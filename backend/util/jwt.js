const jwt = require('jsonwebtoken');

// Access tokens: signed with JWT_SECRET, valid for 15 minutes only. The
// payload carries just the user id — every request re-checks the current
// is_admin/name/email from the database, so a promotion, rename, or account
// deletion takes effect immediately rather than waiting for the token to
// expire. The short lifetime limits how long a leaked access token (e.g. via
// an XSS bug) stays useful; sessions are kept alive past 15 minutes by the
// separate, httpOnly-cookie-backed refresh token in models/RefreshToken.js —
// see routes/api.js's /auth/refresh.
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // Fail loudly rather than silently signing tokens with `undefined` (which
  // would make every token forgeable with the literal string "undefined").
  throw new Error('JWT_SECRET is not set. Add one to backend/.env (see .env.example).');
}

const ACCESS_TOKEN_TTL = '15m';

function signToken(user) {
  return jwt.sign({ sub: user.id }, SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET); // throws if invalid/expired
}

module.exports = { signToken, verifyToken, ACCESS_TOKEN_TTL };
