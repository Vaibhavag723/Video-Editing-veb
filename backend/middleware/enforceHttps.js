// Forces HTTPS in production (or whenever FORCE_HTTPS=1).
//
// `req.secure` is true when the connection is TLS, or — with TRUST_PROXY set —
// when the reverse proxy reports `X-Forwarded-Proto: https`. Plain-HTTP GET/HEAD
// requests get a permanent redirect to the https:// URL; anything else (a POST
// carrying a password or cookie over plain HTTP) is refused outright rather
// than redirected, because by then the secret has already crossed the wire.
//
// The redirect target is built from PUBLIC_HOST when set. Otherwise the Host
// header is used, but only after it is validated, so a forged Host header can't
// turn this into an open redirect.
const HOST_PATTERN = /^[a-z0-9.-]+(:\d{1,5})?$/i;

function httpsRequired() {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === '1';
}

function enforceHttps(req, res, next) {
  if (!httpsRequired() || req.secure) return next();

  if (req.method === 'GET' || req.method === 'HEAD') {
    const host = process.env.PUBLIC_HOST || req.headers.host || '';
    if (!HOST_PATTERN.test(host)) return res.status(400).json({ error: 'Invalid host.' });
    return res.redirect(308, `https://${host}${req.originalUrl}`);
  }
  return res.status(426).json({ error: 'HTTPS is required. Use the https:// address.' });
}

module.exports = enforceHttps;
module.exports.httpsRequired = httpsRequired;
