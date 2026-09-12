const jwt = require('jsonwebtoken');

// Session tokens: signed with JWT_SECRET, valid for 7 days. The payload only
// carries the user id — every request re-checks the current is_admin/name/
// email from the database, so a promotion, rename, or account deletion takes
// effect immediately instead of waiting for the token to expire.
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // Fail loudly rather than silently signing tokens with `undefined` (which
  // would make every token forgeable with the literal string "undefined").
  throw new Error('JWT_SECRET is not set. Add one to backend/.env (see .env.example).');
}

function signToken(user) {
  return jwt.sign({ sub: user.id }, SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET); // throws if invalid/expired
}

module.exports = { signToken, verifyToken };
