# Security

A running list of what's in place and what's still a manual step for
whoever deploys this. Update this file whenever you touch auth, headers,
or rate limiting so it doesn't drift from the code.

## Authentication & sessions
- Passwords are hashed with scrypt (random salt per user, `timingSafeEqual`
  comparison) — never stored or logged in plaintext. See `util/hash.js`.
- Sessions are signed JWTs (`util/jwt.js`), 7-day expiry, carrying only the
  user id. Every request re-fetches the current user from the database, so a
  role change, rename, or account deletion takes effect immediately instead
  of waiting for the token to expire.
- `middleware/requireAuth.js` verifies the `Authorization: Bearer <token>`
  header; `middleware/requireAdmin.js` layers an `is_admin` check on top.
  Neither trusts any client-supplied id — only the signed token.
- Minimum password strength (`isStrongPassword` in `util/hash.js`): 8+
  characters, at least one letter and one number. Enforced on signup,
  password reset, and admin-initiated password changes.
- Account-level brute-force lockout: after 8 failed login attempts for the
  same email within 15 minutes, further attempts are rejected with 429,
  regardless of which IP they come from (see `recentFailedLogins` in
  `routes/api.js`). This is on top of, not instead of, the IP-based rate
  limit below.
- Password reset tokens are single-use, expire in 1 hour, stored only as a
  SHA-256 hash (`models/PasswordReset.js`), and the forgot-password endpoint
  always returns the same response whether or not the email exists, so it
  can't be used to enumerate accounts.
- Google sign-in verifies the credential's signature against Google's
  published JWKS, pins the algorithm to RS256 (no algorithm-confusion
  attack), and checks audience + issuer (`util/googleAuth.js`).
- The admin role is permanent once granted (no demotion path) and an admin
  can never delete or demote their own account through the API — both
  enforced server-side in `routes/admin.js`, not just hidden in the UI.

## Transport / request hardening (`server.js`)
- `helmet()` sets baseline security headers (CSP, `X-Content-Type-Options`,
  no `X-Powered-By`, etc.). CSP is `default-src 'none'` since this is a pure
  JSON API with no HTML/inline scripts of its own.
- CORS is restricted to `ALLOWED_ORIGINS` in production; open in local dev
  for convenience.
- `express.json({ limit: '2mb' })` caps request body size.
- `hpp()` collapses duplicate query-string parameters so validation code
  can't be bypassed by sending an array where a string is expected.
- Rate limiting: 300 req/15min per IP on `/api`, tightened to 20 req/15min
  on `/api/auth` specifically.
- `trust proxy` is only enabled when `TRUST_PROXY` is explicitly set — never
  blindly, since trusting `X-Forwarded-For` without a real reverse proxy in
  front lets a client spoof its own IP and bypass rate limiting.
- In production, the server refuses to boot with a missing, empty, or
  known-placeholder `JWT_SECRET` (see the check at the top of `server.js`).

## Data access
- Every SQL query is parameterized (`$1, $2, ...`) — no string-concatenated
  SQL anywhere in the codebase.
- Cloud-saved projects, admin self-protection, and per-user data are always
  scoped by the authenticated user's id from the verified token, never from
  a client-supplied id in the URL or body.
- Error responses never leak raw database/error details in production
  (`util/errors.js`) — the real error is logged server-side, the client gets
  a generic message. Raw messages are only echoed in non-production for
  local debugging convenience.

## What's intentionally out of scope
- **CSRF**: not applicable — sessions are Bearer tokens sent explicitly in
  the `Authorization` header (kept in memory on the frontend, never in a
  cookie), so there's nothing for a cross-site request to ride on.
- **CSP for the frontend SPA**: not added as a `<meta>` tag in
  `frontend/index.html`, because a safe policy needs to allow Google Fonts,
  the Google Identity Services script/frame, and whatever API origin
  `VITE_API_URL` points at per-deployment — none of which can be verified
  without running the app. If you deploy this, set a `Content-Security-Policy`
  response header at your hosting/CDN layer instead (more flexible than a
  static meta tag) and test the Google sign-in button + font loading against
  it before shipping.

## Manual steps before a real deployment
1. Set a long random `JWT_SECRET` (see `.env.example`) — the server refuses
   to boot in production without one.
2. Set `ALLOWED_ORIGINS` to your real frontend domain(s).
3. Set `ADMIN_PASSWORD` explicitly, or check the server log for the
   generated one on first boot and change it from the admin panel.
4. Run `npm audit` (`npm run audit` in `backend/`) before shipping and
   whenever dependencies change.
5. Put the API behind HTTPS (a reverse proxy or your host's TLS
   termination) — nothing here encrypts transport on its own.
