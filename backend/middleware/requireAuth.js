const { verifyToken } = require('../util/jwt');
const User = require('../models/User');

// Verifies the `Authorization: Bearer <token>` header and attaches the
// current user (fetched fresh from the DB) as `req.user`. Replaces the old
// pattern of trusting a client-supplied user id — a request can no longer
// claim to be anyone just by sending a different id.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Sign in required.' });

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Session is no longer valid.' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session is invalid or has expired.' });
  }
}

module.exports = requireAuth;
