// Guards the endpoints that authenticate with the httpOnly refresh-token
// COOKIE (/auth/refresh, /auth/logout, /auth/logout-all). Everything else uses
// a Bearer header, which browsers never attach on their own. A cookie IS
// attached automatically, so these routes need their own CSRF defence on top
// of the cookie's SameSite flag:
//
//  1. A custom `X-Requested-With` header is required. A cross-site page can't
//     add a custom header without a CORS preflight, and the CORS policy in
//     app.js only approves ALLOWED_ORIGINS, so a forged form post fails here.
//  2. If the browser sent an `Origin` header and ALLOWED_ORIGINS is
//     configured, it must be on that list.
function requireTrustedOrigin(req, res, next) {
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Request blocked.' });
  }
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = req.get('Origin');
  if (origin && allowed.length && !allowed.includes(origin)) {
    return res.status(403).json({ error: 'Request blocked.' });
  }
  next();
}

module.exports = requireTrustedOrigin;
