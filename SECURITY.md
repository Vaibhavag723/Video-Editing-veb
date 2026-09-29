# Security

A running list of what's in place and what's still a manual step for
whoever deploys this. Update this file whenever you touch auth, headers,
or rate limiting so it doesn't drift from the code.

## Authentication & sessions
- Passwords are hashed with scrypt (random salt per user, `timingSafeEqual`
  comparison) — never stored or logged in plaintext. See `util/hash.js`.
- **Two-token session model** (`util/jwt.js`, `models/RefreshToken.js`,
  `routes/api.js`):
  - **Access token**: a signed JWT, valid for only **15 minutes**, carrying
    just the user id. Sent as `Authorization: Bearer <token>` and kept in
    memory on the frontend (never in `localStorage` or a cookie), so an XSS
    bug can steal it for at most 15 minutes. Every request re-fetches the
    current user from the database, so a role change, rename, or account
    deletion takes effect immediately rather than waiting for expiry.
  - **Refresh token**: a random 384-bit value, valid for 30 days, stored
    only as a SHA-256 hash server-side (a leaked database alone can't be
    replayed). Sent as an `httpOnly`, `secure` (in production), `SameSite=Lax`
    cookie scoped to `/api/auth` only — client-side JS can never read it, and
    the browser won't even attach it to non-auth API calls.
  - **Rotation + reuse detection**: every call to `POST /api/auth/refresh`
    revokes the presented refresh token and issues a new one. If a token is
    ever presented a second time (the signature of a stolen token being used
    after the real owner already rotated past it), every outstanding refresh
    token for that user is revoked as a precaution, forcing a fresh sign-in
    everywhere.
  - **Frontend integration** (`frontend/src/api.js`): a 401 from an
    authenticated call triggers exactly one silent `POST /auth/refresh`
    before falling back to "session expired" — so the 15-minute access
    token expiring mid-session is invisible to the user. On app load,
    `restoreSession()` makes the same call to resume a session from the
    cookie alone, so a page refresh doesn't force a re-login. `logOut()`
    explicitly calls `POST /api/auth/logout` to revoke the refresh token
    server-side — clearing only the in-memory access token on sign-out would
    leave a still-valid 30-day refresh token sitting in the browser.
  - Password reset revokes every outstanding refresh token for that account
    (see below) — a reset password should mean every existing session ends,
    not just future logins get a new password.
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
  can't be used to enumerate accounts. A successful reset also revokes every
  refresh token for that account.
- Google sign-in verifies the credential's signature against Google's
  published JWKS, pins the algorithm to RS256 (no algorithm-confusion
  attack), and checks audience + issuer (`util/googleAuth.js`).
- The demo Google sign-in (`/auth/google/dev`, used only when `GOOGLE_CLIENT_ID`
  isn't configured) can only ever create a brand-new account — it explicitly
  rejects any email that's already registered rather than silently signing
  the caller into that account. It also defaults to **off** when
  `NODE_ENV=production`, so a deploy that simply forgets to configure real
  Google OAuth doesn't leave this route reachable. (Earlier version of this
  route did neither of those, which amounted to a full authentication
  bypass — anyone who knew a registered email, including the admin's, could
  be signed in as that account with no password at all. Fixed; see the
  regression tests in `tests/authRoutes.test.js`.)
- The admin role is permanent once granted (no demotion path) and an admin
  can never delete or demote their own account through the API — both
  enforced server-side in `routes/admin.js`, not just hidden in the UI.

## Transport / request hardening (`server.js`)
- `helmet()` sets baseline security headers. CSP is `default-src 'none'` +
  `frame-ancestors 'none'`, since this is a pure JSON API with no HTML,
  inline scripts, or CSS of its own to allow — there is nothing to loosen
  the policy for. Helmet's defaults also cover HSTS, `X-Content-Type-Options`,
  removing `X-Powered-By`, and more; see https://helmetjs.github.io for the
  full list. This is deliberately the strictest possible CSP rather than one
  tuned per-route — if a future route needs to serve HTML/JS/images
  directly, give that CSP its own scoped `helmet()` call rather than
  loosening this one.
- CORS is restricted to `ALLOWED_ORIGINS` in production (open in local dev
  for convenience), with an explicit **method allowlist**
  (`GET, POST, PUT, PATCH, DELETE, OPTIONS`) and **header allowlist**
  (`Content-Type, Authorization`) — a preflighted request using any other
  method or header is rejected by the browser before it reaches a route
  handler at all. `credentials: true` is required for the browser to
  send/receive the refresh-token cookie, which is exactly why a real,
  specific `ALLOWED_ORIGINS` list (not a wildcard) is required before
  enabling it in production — the two can't be combined per the CORS spec.
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
- **TLS/HTTPS**: in most deployments, TLS termination belongs at a reverse
  proxy or platform load balancer (Nginx, Render, Heroku, Cloudflare, etc.)
  in front of this plain-HTTP server — that needs no code change here beyond
  `TRUST_PROXY`. For the less common case of Node terminating TLS directly
  (a standalone VM with its own certificate), set `SSL_KEY_PATH` and
  `SSL_CERT_PATH` in `.env` to a private key/certificate pair — from Let's
  Encrypt/certbot in production, or a self-signed pair for local HTTPS
  testing (see `.env.example` for the exact `openssl` command) — and
  `server.js` switches to `https.createServer` automatically. Neither
  variable set (the default) keeps plain HTTP, which is correct for both
  the reverse-proxy setup and for local development.

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
- **CSRF on the refresh-token cookie**: the access token is a Bearer header
  (immune to CSRF by construction — a cross-site form/image/script can't set
  a custom header), but the refresh token *is* a cookie, so it needs its own
  mitigation rather than "not applicable." Three things cover it: (1) the
  cookie is `SameSite=Lax`, so it's never attached to cross-site POST/PUT/
  DELETE requests, only to same-site calls and top-level GET navigations;
  (2) it's scoped to path `/api/auth`, so even a same-site cookie leak
  couldn't reach unrelated endpoints; (3) `POST /api/auth/refresh` only ever
  rotates the caller's own session and returns a token — a forged cross-site
  call to it can't do anything to another account, it can at most refresh
  the attacker's own session, which they could do anyway. A traditional
  CSRF token was not added on top of this because there is no state-changing
  cookie-authenticated endpoint left for one to protect — everything that
  actually changes data (save a project, edit a user, etc.) requires the
  Bearer access token, not just the cookie.
- **CSP for the frontend SPA**: not added as a `<meta>` tag in
  `frontend/index.html`, because a safe policy needs to allow Google Fonts,
  the Google Identity Services script/frame, and whatever API origin
  `VITE_API_URL` points at per-deployment — none of which can be verified
  without running the app. If you deploy this, set a `Content-Security-Policy`
  response header at your hosting/CDN layer instead (more flexible than a
  static meta tag) and test the Google sign-in button + font loading against
  it before shipping.

## Manual steps before a real deployment
1. Set `NODE_ENV=production` — this is the master switch for several of the
   protections above (sanitized error messages, the weak-`JWT_SECRET` boot
   check, and disabling the demo Google login by default). Nothing else on
   this list fully applies without it.
2. Set a long random `JWT_SECRET` (see `.env.example`) — the server refuses
   to boot in production without one.
3. Set `ALLOWED_ORIGINS` to your real frontend domain(s).
4. Set `ADMIN_PASSWORD` explicitly, or check the server log for the
   generated one on first boot and change it from the admin panel.
5. Run `npm audit` (`npm run audit` in `backend/`) before shipping and
   whenever dependencies change.
6. Put the API behind HTTPS (a reverse proxy or your host's TLS
   termination) — nothing here encrypts transport on its own.
