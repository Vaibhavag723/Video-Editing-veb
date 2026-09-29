// Unit tests for the two guard middleware, using plain fake req/res objects.
const enforceHttps = require('../middleware/enforceHttps');
const requireTrustedOrigin = require('../middleware/requireTrustedOrigin');

const ENV = { ...process.env };
afterEach(() => { process.env = { ...ENV }; });

function run(mw, req) {
  const out = { status: null, body: null, redirect: null, next: false };
  const res = {
    status(c) { out.status = c; return res; },
    json(b) { out.body = b; return res; },
    redirect(c, u) { out.redirect = [c, u]; return res; },
  };
  req.get = (h) => req.headers[h.toLowerCase()];
  mw(req, res, () => { out.next = true; });
  return out;
}

describe('enforceHttps', () => {
  test('does nothing outside production unless FORCE_HTTPS=1', () => {
    process.env.NODE_ENV = 'development'; delete process.env.FORCE_HTTPS;
    expect(run(enforceHttps, { secure: false, method: 'GET', headers: {}, originalUrl: '/' }).next).toBe(true);
  });

  test('lets secure requests through in production', () => {
    process.env.NODE_ENV = 'production';
    expect(run(enforceHttps, { secure: true, method: 'POST', headers: {}, originalUrl: '/' }).next).toBe(true);
  });

  test('permanently redirects insecure GET/HEAD, preserving path and query', () => {
    process.env.NODE_ENV = 'production';
    const o = run(enforceHttps, { secure: false, method: 'GET', headers: { host: 'vidiocut.com' }, originalUrl: '/api/x?y=1' });
    expect(o.redirect).toEqual([308, 'https://vidiocut.com/api/x?y=1']);
  });

  test('refuses insecure POSTs outright instead of redirecting them', () => {
    process.env.NODE_ENV = 'production';
    const o = run(enforceHttps, { secure: false, method: 'POST', headers: { host: 'vidiocut.com' }, originalUrl: '/api/auth/login' });
    expect(o.status).toBe(426);
    expect(o.redirect).toBeNull();
  });

  test('rejects a forged Host header rather than becoming an open redirect', () => {
    process.env.NODE_ENV = 'production';
    const o = run(enforceHttps, { secure: false, method: 'GET', headers: { host: 'evil.com/\\@x' }, originalUrl: '/' });
    expect(o.status).toBe(400);
  });

  test('PUBLIC_HOST takes priority over the Host header', () => {
    process.env.NODE_ENV = 'production'; process.env.PUBLIC_HOST = 'app.vidiocut.com';
    const o = run(enforceHttps, { secure: false, method: 'GET', headers: { host: 'anything.evil' }, originalUrl: '/z' });
    expect(o.redirect).toEqual([308, 'https://app.vidiocut.com/z']);
  });
});

describe('requireTrustedOrigin (CSRF guard for cookie endpoints)', () => {
  const H = 'x-requested-with';
  beforeEach(() => { process.env.ALLOWED_ORIGINS = 'https://app.vidiocut.com,https://vidiocut.com'; });

  test('blocks a request missing the custom header', () => {
    expect(run(requireTrustedOrigin, { headers: {} }).status).toBe(403);
  });
  test('blocks a listed header from a foreign Origin', () => {
    expect(run(requireTrustedOrigin, { headers: { [H]: 'XMLHttpRequest', origin: 'https://evil.com' } }).status).toBe(403);
  });
  test('allows an allowlisted Origin', () => {
    expect(run(requireTrustedOrigin, { headers: { [H]: 'XMLHttpRequest', origin: 'https://app.vidiocut.com' } }).next).toBe(true);
  });
  test('allows a request with no Origin header (non-browser client)', () => {
    expect(run(requireTrustedOrigin, { headers: { [H]: 'XMLHttpRequest' } }).next).toBe(true);
  });
  test('skips the Origin check when no allowlist is configured (local dev)', () => {
    process.env.ALLOWED_ORIGINS = '';
    expect(run(requireTrustedOrigin, { headers: { [H]: 'XMLHttpRequest', origin: 'http://localhost:3000' } }).next).toBe(true);
  });
});
