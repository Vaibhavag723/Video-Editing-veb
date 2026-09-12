const requireAuth = require('./requireAuth');

// Admin guard: first verifies the caller's session (requireAuth), then checks
// the freshly-loaded user is currently an admin. Replaces the old version
// that trusted a client-supplied `X-User-Id` header with no signature at all.
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.user.is_admin) return res.status(403).json({ error: 'Admin access required.' });
    req.adminUser = req.user;
    next();
  });
}

module.exports = requireAdmin;
