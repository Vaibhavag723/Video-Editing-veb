const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query } = require('../config/db');
const { hashPassword, verifyPassword, isStrongPassword, WEAK_PASSWORD_MSG } = require('../util/hash');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const PasswordReset = require('../models/PasswordReset');
const ContactMessage = require('../models/ContactMessage');
const { sendPasswordResetEmail, sendAdminMessageNotification } = require('../util/email');
const { signToken } = require('../util/jwt');
const { sendError } = require('../util/errors');
const requireAuth = require('../middleware/requireAuth');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');

// Cookie carrying the long-lived refresh token. httpOnly so client-side JS
// (and therefore an XSS bug) can never read it; scoped to /api/auth so it is
// never even sent on other API calls, shrinking the blast radius further;
// `secure` in production so it's only ever transmitted over HTTPS; `lax`
// rather than `strict` so a user following a link from email/elsewhere into
// the app doesn't get logged out, while still blocking the classic
// cross-site POST CSRF pattern.
const REFRESH_COOKIE = 'refresh_token';

// SameSite policy. 'lax' (default) is right when the frontend and API share a
// registrable domain (app.example.com + api.example.com) or run on localhost.
// If they live on completely different domains, the browser will not send a
// lax cookie on the frontend's fetch() calls — set COOKIE_SAMESITE=none, which
// browsers only accept together with `secure`, so it is forced on here.
// 'strict' is also accepted for same-site-only deployments.
function cookieSameSite() {
  const v = String(process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  return ['lax', 'strict', 'none'].includes(v) ? v : 'lax';
}
const refreshCookieOpts = () => {
  const sameSite = cookieSameSite();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — must match RefreshToken's TTL
  };
};
// Clearing a cookie only works if the attributes match the ones it was set with.
const clearRefreshCookie = (res) => {
  const { maxAge, ...attrs } = refreshCookieOpts();
  res.clearCookie(REFRESH_COOKIE, attrs);
};

// Two tabs (or two parallel requests) can present the same refresh token in the
// same instant. The loser finds it already rotated — indistinguishable from a
// replayed stolen token unless we allow a short grace window. Inside it we
// hand out a fresh access token but do NOT alarm; outside it, reuse of a
// rotated token means possible theft and the whole session family is revoked.
const ROTATION_GRACE_MS = 10 * 1000;

// Shared shape for every auth response: never send password data back,
// always include a short-lived (15m) signed access token the frontend
// attaches as `Authorization: Bearer <token>` on subsequent requests, and set
// an httpOnly refresh-token cookie the frontend can silently exchange for a
// new access token via /auth/refresh once the access token expires.
async function issueSession(res, user) {
  const refreshToken = await RefreshToken.issue(user.id);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOpts());
  return { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin, token: signToken(user) };
}

/* ---------- Auth (PostgreSQL) ---------- */

// Shared helper: record a sign-in attempt for the admin audit log.
async function logLogin(userId, email, success) {
  try { await query('INSERT INTO login_events (user_id, email, success) VALUES ($1, $2, $3)', [userId, email, !!success]); }
  catch { /* audit logging is best-effort */ }
}

// Account-level brute-force guard, layered on top of the IP-based rate
// limiter in server.js. The IP limiter alone doesn't stop a distributed or
// botnet attack that spreads guesses for one specific account across many
// IPs, so this checks the login_events audit log for that email directly.
const LOGIN_LOCKOUT_THRESHOLD = 8;
async function recentFailedLogins(email) {
  try {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS n FROM login_events
        WHERE email = $1 AND success = false AND created_at > now() - interval '15 minutes'`,
      [email],
    );
    return rows[0]?.n || 0;
  } catch { return 0; } // fail open on audit-log errors — never lock users out due to a logging bug
}

// Minimum password strength check lives in util/hash.js so signup, password
// reset, and the admin user-edit form all enforce the same rule.

router.post('/auth/signup', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!isStrongPassword(password)) return res.status(400).json({ error: WEAK_PASSWORD_MSG });
    if (await User.findByEmail(email)) return res.status(409).json({ error: 'An account already exists for that email.' });
    const user = await User.create(name, email, await hashPassword(password));
    res.status(201).json(await issueSession(res, user));
  } catch (err) {
    res.status(500).json({ error: 'Unable to create account.' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if ((await recentFailedLogins(email)) >= LOGIN_LOCKOUT_THRESHOLD) {
      return res.status(429).json({ error: 'Too many failed attempts for this account. Please wait 15 minutes and try again.' });
    }
    const user = await User.findByEmail(email);
    if (!user || !(await verifyPassword(String(req.body.password || ''), user.password_hash))) {
      await logLogin(user?.id || null, email, false);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    await logLogin(user.id, email, true);
    res.json(await issueSession(res, user));
  } catch { res.status(500).json({ error: 'Unable to log in.' }); }
});

// Silently exchange a still-valid refresh-token cookie for a new 15-minute
// access token, so the user doesn't have to log in again every 15 minutes.
// The refresh token itself is rotated on every use (old one revoked, new one
// issued) — if a stolen refresh token is ever replayed after the real owner
// has already rotated past it, the old hash is found already revoked, which
// is treated as a compromise signal and the entire session is killed rather
// than just failing this one request.
router.post('/auth/refresh', requireTrustedOrigin, async (req, res) => {
  try {
    const presented = req.cookies?.[REFRESH_COOKIE];
    if (!presented) return res.status(401).json({ error: 'No refresh session found. Please sign in again.' });

    const row = await RefreshToken.find(presented);
    if (!row || row.expires_at < new Date()) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    if (row.revoked_at) {
      const rotatedRecently = row.rotated_at && Date.now() - new Date(row.rotated_at).getTime() < ROTATION_GRACE_MS;
      if (!rotatedRecently) {
        // Reuse of a rotated-out (or logged-out) token: possible theft. Kill
        // every outstanding refresh token for this user as a precaution.
        await RefreshToken.revokeAllForUser(row.user_id);
        clearRefreshCookie(res);
        return res.status(401).json({ error: 'This session was revoked. Please sign in again.' });
      }
      // Benign race (see ROTATION_GRACE_MS): the other request already issued
      // the new refresh cookie, so only an access token is returned here.
      const raceUser = await User.findById(row.user_id);
      if (!raceUser) { clearRefreshCookie(res); return res.status(401).json({ error: 'Account no longer exists.' }); }
      return res.json({ id: raceUser.id, name: raceUser.name, email: raceUser.email, isAdmin: raceUser.is_admin, token: signToken(raceUser) });
    }

    const user = await User.findById(row.user_id);
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Account no longer exists.' });
    }

    const newRefreshToken = await RefreshToken.rotate(row.id, user.id);
    res.cookie(REFRESH_COOKIE, newRefreshToken, refreshCookieOpts());
    res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin, token: signToken(user) });
  } catch { res.status(500).json({ error: 'Unable to refresh session.' }); }
});

// Revoke the current refresh token and clear its cookie. The short-lived
// access token the client is still holding keeps working until it naturally
// expires (at most 15 minutes) — this only prevents the session from being
// silently renewed past that point.
router.post('/auth/logout', requireTrustedOrigin, async (req, res) => {
  try {
    const presented = req.cookies?.[REFRESH_COOKIE];
    if (presented) {
      const row = await RefreshToken.find(presented);
      if (row) await RefreshToken.revoke(row.id);
    }
  } catch { /* best-effort — clearing the cookie below is what actually matters client-side */ }
  clearRefreshCookie(res);
  res.json({ success: true });
});

// "Sign out everywhere": revokes every refresh token this account holds (every
// browser/device). Needs a valid access token — a stolen cookie alone can't
// trigger it — and clears this browser's cookie too.
router.post('/auth/logout-all', requireTrustedOrigin, requireAuth, async (req, res) => {
  try { await RefreshToken.revokeAllForUser(req.user.id); }
  catch (err) { return sendError(res, 500, err, 'Unable to sign out everywhere.'); }
  clearRefreshCookie(res);
  res.json({ success: true });
});

/* ---------- Password reset via email ----------
 * 1) /auth/forgot-password  — emails a one-time reset link (expires in 1h).
 * 2) /auth/reset-password    — validates the link token + new password.
 */
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Enter your email address.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

    // Opportunistic cleanup of expired / used tokens.
    await PasswordReset.deleteExpired().catch(() => {});

    const user = await User.findByEmail(email);
    let devResetLink = null;
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await PasswordReset.createForUser(user.id, token);
      const result = await sendPasswordResetEmail(user.email, user.name, token);
      if (!result.sent) devResetLink = result.link; // dev mode: surface the link
    }
    // Always reply the same whether or not the account exists, so the endpoint
    // cannot be used to probe which emails are registered.
    res.json({
      message: 'If an account exists for that email, we sent a password-reset link. Check your inbox.',
      ...(devResetLink ? { devResetLink } : {}),
    });
  } catch { res.status(500).json({ error: 'Unable to send the reset link.' }); }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const token = String(req.body.token || '').trim();
    const password = String(req.body.password || '');
    if (!token) return res.status(400).json({ error: 'Reset token is required.' });
    if (!isStrongPassword(password)) return res.status(400).json({ error: WEAK_PASSWORD_MSG });

    const reset = await PasswordReset.findValid(token);
    if (!reset) return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' });

    // Consume the token, invalidate any other outstanding links, then set the
    // new password so the old one stops working immediately. Also revoke
    // every refresh token for this account — if the reset was needed because
    // a password leaked, an attacker's still-open session should not be able
    // to silently renew itself past this point.
    await PasswordReset.markUsed(reset.id);
    await PasswordReset.invalidateForUser(reset.user_id);
    await User.updatePassword(reset.user_id, await hashPassword(password));
    await RefreshToken.revokeAllForUser(reset.user_id);
    res.json({ message: 'Password updated. You can now sign in with your new password.' });
  } catch { res.status(500).json({ error: 'Unable to reset the password.' }); }
});

/* ---------- Google sign-in ("the account you are logged into in the browser") ----------
 * The frontend uses Google Identity Services to obtain a JWT credential, then
 * posts it to /auth/google where the signature + audience are verified against
 * Google's public keys. When GOOGLE_CLIENT_ID is not configured the backend's
 * demo route /auth/google/dev is used instead so the flow still works locally.
 */
router.post('/auth/google', async (req, res) => {
  try {
    const credential = String(req.body.credential || '');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(400).json({ error: 'Google login is not configured on the server.' });

    const { verifyGoogleToken } = require('../util/googleAuth');
    const verdict = await verifyGoogleToken(credential, clientId);
    if (!verdict.ok) return res.status(401).json({ error: verdict.error });

    const google = verdict.payload;
    const email = String(google.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Your Google account has no email address.' });

    let user = await User.findByEmail(email);
    if (!user) {
      // No usable password: the account can only sign in through Google.
      const randomHash = await hashPassword(crypto.randomBytes(24).toString('hex'));
      user = await User.create(String(google.name || 'Google user').slice(0, 120), email, randomHash);
    }
    await logLogin(user.id, email, true);
    res.json(await issueSession(res, user));
  } catch { res.status(500).json({ error: 'Unable to sign in with Google.' }); }
});

// Demo route, active ONLY while no real Google client id is configured, and
// disabled by default in production even then (see GOOGLE_DEV_LOGIN below).
//
// SECURITY: this must never be allowed to sign in to an EXISTING account.
// It only creates a brand-new throwaway demo account per email; if that
// email is already registered it is rejected outright. Without that check,
// anyone who knows (or guesses, e.g. an admin's public contact email) a
// registered email could be signed in as that account with no password —
// a full authentication bypass, not just a "demo" feature.
router.post('/auth/google/dev', async (req, res) => {
  try {
    if (process.env.GOOGLE_CLIENT_ID) return res.status(400).json({ error: 'Google login is configured — use the real sign-in button.' });
    // Opt-in only in production: unset/unrecognized GOOGLE_DEV_LOGIN means
    // "off" in production and "on" everywhere else, so a deploy that simply
    // forgets to configure real Google OAuth doesn't silently ship this
    // backdoor. Set GOOGLE_DEV_LOGIN=1 explicitly to allow it in production.
    const devLoginEnabled = process.env.NODE_ENV === 'production'
      ? process.env.GOOGLE_DEV_LOGIN === '1'
      : String(process.env.GOOGLE_DEV_LOGIN ?? '1') !== '0';
    if (!devLoginEnabled) return res.status(403).json({ error: 'Demo Google sign-in is disabled on the server.' });

    const name = String(req.body.name || '').trim().slice(0, 120);
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

    // Never sign in to an existing account through this route — see above.
    if (await User.findByEmail(email)) {
      return res.status(409).json({ error: 'That email already has an account. Sign in with your password instead.' });
    }

    const randomHash = await hashPassword(crypto.randomBytes(24).toString('hex'));
    const user = await User.create(name, email, randomHash);
    await logLogin(user.id, email, true);
    res.json(await issueSession(res, user));
  } catch { res.status(500).json({ error: 'Unable to sign in with the demo Google account.' }); }
});

/* ---------- "Ask a question" form ---------- */
router.post('/contact', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const subject = String(req.body.subject || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name || !email || !subject || !message) return res.status(400).json({ error: 'Please fill in every field.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (message.length > 2000) return res.status(400).json({ error: 'Your question is too long (max 2000 characters).' });

    await ContactMessage.create({ name, email, subject, message });
    sendAdminMessageNotification({ name, email, subject, message }).catch(() => {});
    res.status(201).json({ message: 'Thanks — your question was sent. We usually reply within 1–2 days.' });
  } catch { res.status(500).json({ error: 'Unable to submit your question.' }); }
});

/* ---------- Creative library (data from PostgreSQL) ---------- */
router.get('/text-templates', async (_req, res) => {
  try { res.json((await query('SELECT * FROM text_templates ORDER BY id')).rows); }
  catch (err) { sendError(res, 500, err); }
});
router.get('/stickers', async (_req, res) => {
  try { res.json((await query('SELECT * FROM stickers ORDER BY id')).rows); }
  catch (err) { sendError(res, 500, err); }
});
router.get('/music', async (_req, res) => {
  try { res.json((await query('SELECT * FROM music ORDER BY id')).rows); }
  catch (err) { sendError(res, 500, err); }
});

/* ---------- Cloud-saved (unfinished) projects ----------
 * All routes require a valid session (requireAuth) and every lookup is
 * scoped to req.user.id, so one account can never read, overwrite, or delete
 * another account's saved projects — the id in the URL/body is not trusted
 * on its own, only in combination with the authenticated user.
 */
router.get('/projects', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, updated_at AS "updatedAt" FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]);
    res.json(rows);
  } catch (err) { sendError(res, 500, err); }
});

router.get('/projects/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) { sendError(res, 500, err); }
});

router.post('/projects', requireAuth, async (req, res) => {
  try {
    const { name, data } = req.body;
    const fresh = String(name || 'Untitled project').trim();
    const { rows } = await query(
      'INSERT INTO projects (user_id, name, data) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, fresh, JSON.stringify(data || {})],
    );
    res.status(201).json(rows[0]);
  } catch (err) { sendError(res, 500, err); }
});

router.delete('/projects/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { sendError(res, 500, err); }
});

/* ---------- Public website (CMS, read-only) ---------- */
router.get('/cms/pages', async (_req, res) => {
  try { res.json((await query('SELECT * FROM site_pages ORDER BY key')).rows); }
  catch (err) { sendError(res, 500, err); }
});
router.get('/cms/blog', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, title, slug, excerpt, content, image, published, created_at, updated_at FROM blog_posts WHERE published = true ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { sendError(res, 500, err); }
});
/* ---------- Admin panel ----------
 * Every /admin/* route lives in ./admin.js (mounted below). The admin router
 * calls `router.use(requireAdmin)` internally, so each request is verified as
 * an admin session before any handler runs.
 */
const adminRoutes = require('./admin');
router.use('/admin', adminRoutes);

module.exports = router;