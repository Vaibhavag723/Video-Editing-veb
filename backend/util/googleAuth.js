const jwt = require('jsonwebtoken');

// Verifies the credential (JWT) produced by Google Identity Services.
// The token is an RS256 JWT signed by Google; we validate the signature against
// Google's public keys (https://www.googleapis.com/oauth2/v3/certs) and enforce
// the audience (our OAuth client id). Keys are cached for a few hours.

const KEYS_TTL_MS = 12 * 60 * 60 * 1000;
let keysCache = null;
let keysFetchedAt = 0;

const base64UrlDecode = (segment) =>
  Buffer.from(segment.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

async function getGoogleKeys() {
  if (keysCache && Date.now() - keysFetchedAt < KEYS_TTL_MS) return keysCache;
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!res.ok) throw new Error('Unable to fetch Google signing keys.');
  const data = await res.json();
  keysCache = data.keys || [];
  keysFetchedAt = Date.now();
  return keysCache;
}

const pemFromCert = (cert) =>
  `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`;

// Returns { ok, payload } on success or { ok:false, error } when the token is
// missing, misconfigured, or cannot be verified against Google.
async function verifyGoogleToken(token, clientId) {
  if (!token) return { ok: false, error: 'Google credential is required.' };
  if (!clientId) return { ok: false, error: 'Google login is not configured on the server.' };

  let header;
  try {
    header = JSON.parse(base64UrlDecode(token.split('.')[0]));
  } catch {
    return { ok: false, error: 'Google credential is malformed.' };
  }

  const keys = await getGoogleKeys().catch(() => []);
  const key = keys.find((k) => k.kid === header.kid && k.alg === header.alg);
  if (!key) return { ok: false, error: 'Google signing key not found.' };

  try {
    const payload = jwt.verify(token, pemFromCert(key.x5c[0]), {
      algorithms: ['RS256'],
      audience: clientId,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    });
    return { ok: true, payload };
  } catch {
    return { ok: false, error: 'Google credential could not be verified.' };
  }
}

module.exports = { verifyGoogleToken };