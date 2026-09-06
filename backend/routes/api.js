const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query } = require('../config/db');
const { hashPassword, verifyPassword } = require('../util/hash');
const User = require('../models/User');
const Item = require('../models/Item');
const PasswordReset = require('../models/PasswordReset');
const ContactMessage = require('../models/ContactMessage');
const { sendPasswordResetEmail, sendAdminMessageNotification } = require('../util/email');

/* ---------- Auth (PostgreSQL) ---------- */
router.post('/auth/signup', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (await User.findByEmail(email)) return res.status(409).json({ error: 'An account already exists for that email.' });
    const user = await User.create(name, email, await hashPassword(password), password);
    res.status(201).json({ id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin });
  } catch (err) {
    res.status(500).json({ error: 'Unable to create account.' });
  }
});

// Shared helper: record a sign-in attempt for the admin audit log.
async function logLogin(userId, email, success) {
  try { await query('INSERT INTO login_events (user_id, email, success) VALUES ($1, $2, $3)', [userId, email, !!success]); }
  catch { /* audit logging is best-effort */ }
}

router.post('/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findByEmail(email);
    if (!user || !(await verifyPassword(String(req.body.password || ''), user.password_hash))) {
      await logLogin(null, email, false);
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    await logLogin(user.id, email, true);
    res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin });
  } catch { res.status(500).json({ error: 'Unable to log in.' }); }
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
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const reset = await PasswordReset.findValid(token);
    if (!reset) return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' });

    // Consume the token, invalidate any other outstanding links, then set the
    // new password so the old one stops working immediately.
    await PasswordReset.markUsed(reset.id);
    await PasswordReset.invalidateForUser(reset.user_id);
    await User.updatePassword(reset.user_id, await hashPassword(password), password);
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
      user = await User.create(String(google.name || 'Google user').slice(0, 120), email, randomHash, '', false);
    }
    await logLogin(user.id, email, true);
    res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin });
  } catch { res.status(500).json({ error: 'Unable to sign in with Google.' }); }
});

// Demo route, active ONLY while no real Google client id is configured.
router.post('/auth/google/dev', async (req, res) => {
  try {
    if (process.env.GOOGLE_CLIENT_ID) return res.status(400).json({ error: 'Google login is configured — use the real sign-in button.' });
    if (String(process.env.GOOGLE_DEV_LOGIN ?? '1') === '0') return res.status(403).json({ error: 'Demo Google sign-in is disabled on the server.' });

    const name = String(req.body.name || '').trim().slice(0, 120);
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

    const randomHash = await hashPassword(crypto.randomBytes(24).toString('hex'));
    let user = await User.findByEmail(email) || await User.create(name, email, randomHash, '', false);
    await logLogin(user.id, email, true);
    res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin });
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

/* ---------- Items ---------- */
router.get('/items', async (req, res) => {
  try { res.json(await Item.findAll()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/items', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Name required' });
    res.status(201).json(await Item.create(name));
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/items/:id', async (req, res) => {
  try {
    await Item.remove(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

/* ---------- Creative library (data from PostgreSQL) ---------- */
router.get('/text-templates', async (_req, res) => {
  try { res.json((await query('SELECT * FROM text_templates ORDER BY id')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/stickers', async (_req, res) => {
  try { res.json((await query('SELECT * FROM stickers ORDER BY id')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/music', async (_req, res) => {
  try { res.json((await query('SELECT * FROM music ORDER BY id')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- Cloud-saved (unfinished) projects ---------- */
router.get('/projects', async (req, res) => {
  try {
    const id = req.query.userId;
    if (!id) return res.json([]);
    const { rows } = await query(
      'SELECT id, name, updated_at AS "updatedAt" FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/projects', async (req, res) => {
  try {
    const { userId, name, data } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const fresh = String(name || 'Untitled project').trim();
    const { rows } = await query(
      'INSERT INTO projects (user_id, name, data) VALUES ($1, $2, $3) RETURNING *',
      [userId, fresh, JSON.stringify(data || {})],
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- Public website (CMS, read-only) ---------- */
router.get('/cms/pages', async (_req, res) => {
  try { res.json((await query('SELECT * FROM site_pages ORDER BY key')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/cms/pages/:key', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM site_pages WHERE key = $1', [req.params.key]);
    if (!rows[0]) return res.status(404).json({ error: 'Page not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/cms/blog', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, title, slug, excerpt, content, image, published, created_at, updated_at FROM blog_posts WHERE published = true ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/cms/blog/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM blog_posts WHERE published = true AND id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Post not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- Admin panel ----------
 * Every /admin/* route lives in ./admin.js (mounted below). The admin router
 * calls `router.use(requireAdmin)` internally, so each request is verified as
 * an admin session before any handler runs.
 */
const adminRoutes = require('./admin');
router.use('/admin', adminRoutes);

module.exports = router;