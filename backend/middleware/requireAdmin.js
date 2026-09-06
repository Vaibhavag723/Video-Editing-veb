const User = require('../models/User');

// Demo auth guard for every /admin/* route: the client sends the logged-in
// user id in an `X-User-Id` header and we verify that account is_admin before
// letting the request through. On success `req.adminUser` is the admin row.
async function requireAdmin(req, res, next) {
  try {
    const uid = Number(req.headers['x-user-id']);
    if (!uid) return res.status(401).json({ error: 'Admin session required.' });
    const adminUser = await User.findById(uid);
    if (!adminUser || !adminUser.is_admin) return res.status(403).json({ error: 'Admin access required.' });
    req.adminUser = adminUser;
    next();
  } catch {
    res.status(500).json({ error: 'Could not verify admin.' });
  }
}

module.exports = requireAdmin;