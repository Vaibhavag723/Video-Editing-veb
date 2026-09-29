// Exercises the REAL app (app.js): CORS policy, helmet headers (CSP + HSTS),
// and HTTPS enforcement — not a stand-in app built inside the test.
process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';

jest.mock('../config/db', () => ({ query: jest.fn().mockResolvedValue({ rows: [] }) }));
jest.mock('../models/User');
jest.mock('../models/RefreshToken');

const request = require('supertest');
const app = require('../app');

const ENV = { ...process.env };
afterEach(() => { process.env = { ...ENV }; });

describe('CORS policy', () => {
  const preflight = (origin, extra = {}) =>
    request(app)
      .options('/api/auth/login')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', extra.method || 'POST')
      .set('Access-Control-Request-Headers', extra.headers || 'content-type');

  beforeEach(() => { process.env.ALLOWED_ORIGINS = 'https://app.vidiocut.com,https://vidiocut.com'; });

  test('approves a preflight from an allowed origin and echoes that exact origin', async () => {
    const res = await preflight('https://app.vidiocut.com');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://app.vidiocut.com');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-max-age']).toBe('600');
  });

  test('never uses a wildcard origin (incompatible with credentialed cookies)', async () => {
    const res = await preflight('https://app.vidiocut.com');
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
  });

  test('sends no CORS headers to an origin that is not on the allowlist', async () => {
    const res = await preflight('https://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });

  test('only advertises the HTTP methods the API actually uses', async () => {
    const res = await preflight('https://app.vidiocut.com');
    const methods = res.headers['access-control-allow-methods'].split(',').map((m) => m.trim());
    expect(methods).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
    expect(methods).not.toContain('TRACE');
    expect(methods).not.toContain('CONNECT');
  });

  test('only advertises the request headers the frontend sends', async () => {
    const res = await preflight('https://app.vidiocut.com', { headers: 'x-evil-header' });
    const allowed = res.headers['access-control-allow-headers'].toLowerCase();
    expect(allowed).toContain('authorization');
    expect(allowed).toContain('x-requested-with');
    expect(allowed).not.toContain('x-evil-header');
  });

  test('with no ALLOWED_ORIGINS (local dev) any origin is accepted', async () => {
    process.env.ALLOWED_ORIGINS = '';
    const res = await preflight('http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });
});

describe('helmet headers on the real app', () => {
  test('CSP blocks everything by default and forbids framing', async () => {
    const res = await request(app).get('/api/nothing-here');
    const csp = res.headers['content-security-policy'];
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'none'");
  });

  test('sends HSTS for a year including subdomains', async () => {
    const res = await request(app).get('/api/nothing-here');
    expect(res.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });

  test('sets nosniff + no-referrer and hides the framework', async () => {
    const res = await request(app).get('/api/nothing-here');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('HTTPS enforcement on the real app', () => {
  test('is off in development, so local http keeps working', async () => {
    delete process.env.FORCE_HTTPS;
    const res = await request(app).get('/api/nothing-here');
    expect(res.status).not.toBe(308);
    expect(res.status).not.toBe(426);
  });

  test('redirects plain-HTTP GETs to https when enforced', async () => {
    process.env.FORCE_HTTPS = '1';
    const res = await request(app).get('/api/nothing-here?x=1').set('Host', 'vidiocut.com');
    expect(res.status).toBe(308);
    expect(res.headers.location).toBe('https://vidiocut.com/api/nothing-here?x=1');
  });

  test('refuses (does not redirect) a plain-HTTP POST carrying credentials', async () => {
    process.env.FORCE_HTTPS = '1';
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'x' });
    expect(res.status).toBe(426);
  });
});
