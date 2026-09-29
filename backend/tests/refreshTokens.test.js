// Access-token + refresh-token flow: login issues an httpOnly cookie,
// /auth/refresh rotates it, reuse of a rotated token is treated as theft,
// logout / logout-all revoke it. The DB-backed models are mocked.
process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';

jest.mock('../models/User');
jest.mock('../models/RefreshToken');
jest.mock('../config/db', () => ({ query: jest.fn().mockResolvedValue({ rows: [] }) }));

const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { signToken, verifyToken } = require('../util/jwt');
const { hashPassword } = require('../util/hash');
const api = require('../routes/api');

// Bare app (no rate limiter) so these tests can make as many auth calls as they need.
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', api);
  return app;
}

const ENV = { ...process.env };
const USER = { id: 7, name: 'Ada', email: 'ada@example.com', is_admin: false };
const future = () => new Date(Date.now() + 60 * 60 * 1000);
const secondsAgo = (n) => new Date(Date.now() - n * 1000);

// Headers a real browser session sends to the cookie endpoints.
const withCookie = (req, token = 'raw-refresh-token') =>
  req.set('X-Requested-With', 'XMLHttpRequest').set('Cookie', `refresh_token=${token}`);

const setCookies = (res) => [].concat(res.headers['set-cookie'] || []);

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...ENV, ALLOWED_ORIGINS: '' };
  User.findById.mockResolvedValue(USER);
  RefreshToken.issue.mockResolvedValue('brand-new-refresh-token');
  RefreshToken.rotate.mockResolvedValue('rotated-refresh-token');
  RefreshToken.revokeAllForUser.mockResolvedValue();
  RefreshToken.revoke.mockResolvedValue();
});
afterAll(() => { process.env = ENV; });

describe('login issues the session pair', () => {
  test('returns a short-lived access token in JSON and the refresh token ONLY as an httpOnly cookie', async () => {
    User.findByEmail.mockResolvedValue({ ...USER, password_hash: await hashPassword('correct1pass') });
    const res = await request(buildApp()).post('/api/auth/login').send({ email: USER.email, password: 'correct1pass' });

    expect(res.status).toBe(200);
    expect(verifyToken(res.body.token).sub).toBe(USER.id);
    // 15-minute access token
    const { iat, exp } = verifyToken(res.body.token);
    expect(exp - iat).toBe(15 * 60);
    // the refresh token must never appear in the response body
    expect(JSON.stringify(res.body)).not.toContain('brand-new-refresh-token');

    const cookie = setCookies(res).find((c) => c.startsWith('refresh_token='));
    expect(cookie).toContain('brand-new-refresh-token');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/api/auth');
    expect(cookie).toContain('SameSite=Lax');
  });
});

describe('cookie flags', () => {
  test('adds Secure in production', async () => {
    process.env.NODE_ENV = 'production';
    RefreshToken.find.mockResolvedValue({ id: 1, user_id: 7, expires_at: future(), revoked_at: null });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(setCookies(res).find((c) => c.startsWith('refresh_token='))).toContain('Secure');
  });

  test('COOKIE_SAMESITE=none (cross-domain deployment) forces Secure on, as browsers require', async () => {
    process.env.COOKIE_SAMESITE = 'none'; // NODE_ENV is not production here
    RefreshToken.find.mockResolvedValue({ id: 1, user_id: 7, expires_at: future(), revoked_at: null });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    const cookie = setCookies(res).find((c) => c.startsWith('refresh_token='));
    expect(cookie).toContain('SameSite=None');
    expect(cookie).toContain('Secure');
  });

  test('an unrecognised COOKIE_SAMESITE value falls back to Lax', async () => {
    process.env.COOKIE_SAMESITE = 'banana';
    RefreshToken.find.mockResolvedValue({ id: 1, user_id: 7, expires_at: future(), revoked_at: null });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(setCookies(res).find((c) => c.startsWith('refresh_token='))).toContain('SameSite=Lax');
  });
});

describe('POST /api/auth/refresh', () => {
  test('is blocked without the X-Requested-With header (CSRF guard)', async () => {
    const res = await request(buildApp()).post('/api/auth/refresh').set('Cookie', 'refresh_token=raw');
    expect(res.status).toBe(403);
    expect(RefreshToken.find).not.toHaveBeenCalled();
  });

  test('is blocked from a foreign Origin when ALLOWED_ORIGINS is set', async () => {
    process.env.ALLOWED_ORIGINS = 'https://app.vidiocut.com';
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh')).set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
    expect(RefreshToken.find).not.toHaveBeenCalled();
  });

  test('401 when there is no refresh cookie', async () => {
    const res = await request(buildApp()).post('/api/auth/refresh').set('X-Requested-With', 'XMLHttpRequest');
    expect(res.status).toBe(401);
  });

  test('401 and clears the cookie for a token the server has never seen', async () => {
    RefreshToken.find.mockResolvedValue(null);
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(res.status).toBe(401);
    expect(setCookies(res).join(';')).toMatch(/refresh_token=;/);
  });

  test('401 for an expired refresh token', async () => {
    RefreshToken.find.mockResolvedValue({ id: 1, user_id: 7, expires_at: secondsAgo(60), revoked_at: null });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(res.status).toBe(401);
    expect(RefreshToken.rotate).not.toHaveBeenCalled();
  });

  test('a valid token yields a new access token AND rotates the refresh token', async () => {
    RefreshToken.find.mockResolvedValue({ id: 5, user_id: 7, expires_at: future(), revoked_at: null });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));

    expect(res.status).toBe(200);
    expect(verifyToken(res.body.token).sub).toBe(USER.id);
    expect(RefreshToken.rotate).toHaveBeenCalledWith(5, USER.id);
    expect(setCookies(res).find((c) => c.startsWith('refresh_token='))).toContain('rotated-refresh-token');
    // the old token value must not be echoed back
    expect(JSON.stringify(res.body)).not.toContain('raw-refresh-token');
  });

  test('re-reads the user each time, so a deleted account cannot refresh', async () => {
    RefreshToken.find.mockResolvedValue({ id: 5, user_id: 7, expires_at: future(), revoked_at: null });
    User.findById.mockResolvedValue(null);
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(res.status).toBe(401);
    expect(RefreshToken.rotate).not.toHaveBeenCalled();
  });

  test('replaying an already-rotated token long after rotation revokes the WHOLE session', async () => {
    RefreshToken.find.mockResolvedValue({
      id: 5, user_id: 7, expires_at: future(), revoked_at: secondsAgo(120), rotated_at: secondsAgo(120),
    });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(res.status).toBe(401);
    expect(RefreshToken.revokeAllForUser).toHaveBeenCalledWith(7);
    expect(RefreshToken.rotate).not.toHaveBeenCalled();
  });

  test('a token revoked by LOGOUT gets no grace period, even if just revoked', async () => {
    // revoked moments ago but never rotated → it was a logout, not a race
    RefreshToken.find.mockResolvedValue({
      id: 5, user_id: 7, expires_at: future(), revoked_at: secondsAgo(2), rotated_at: null,
    });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(res.status).toBe(401);
    expect(RefreshToken.revokeAllForUser).toHaveBeenCalledWith(7);
  });

  test('two tabs refreshing at once: the loser (rotated a moment ago) gets an access token and no alarm', async () => {
    RefreshToken.find.mockResolvedValue({
      id: 5, user_id: 7, expires_at: future(), revoked_at: secondsAgo(2), rotated_at: secondsAgo(2),
    });
    const res = await withCookie(request(buildApp()).post('/api/auth/refresh'));
    expect(res.status).toBe(200);
    expect(verifyToken(res.body.token).sub).toBe(USER.id);
    expect(RefreshToken.revokeAllForUser).not.toHaveBeenCalled();
    expect(RefreshToken.rotate).not.toHaveBeenCalled();
    // and it must not overwrite the fresh cookie the winning tab was given
    expect(setCookies(res).find((c) => c.startsWith('refresh_token='))).toBeUndefined();
  });
});

describe('POST /api/auth/logout', () => {
  test('is blocked without the X-Requested-With header', async () => {
    const res = await request(buildApp()).post('/api/auth/logout').set('Cookie', 'refresh_token=raw');
    expect(res.status).toBe(403);
    expect(RefreshToken.revoke).not.toHaveBeenCalled();
  });

  test('revokes the presented refresh token and clears the cookie', async () => {
    RefreshToken.find.mockResolvedValue({ id: 9, user_id: 7, expires_at: future(), revoked_at: null });
    const res = await withCookie(request(buildApp()).post('/api/auth/logout'));
    expect(res.status).toBe(200);
    expect(RefreshToken.revoke).toHaveBeenCalledWith(9);
    expect(setCookies(res).join(';')).toMatch(/refresh_token=;/);
  });

  test('still succeeds (and clears the cookie) when there is no cookie at all', async () => {
    const res = await request(buildApp()).post('/api/auth/logout').set('X-Requested-With', 'XMLHttpRequest');
    expect(res.status).toBe(200);
    expect(RefreshToken.revoke).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/logout-all', () => {
  test('needs a valid access token — the cookie alone is not enough', async () => {
    const res = await withCookie(request(buildApp()).post('/api/auth/logout-all'));
    expect(res.status).toBe(401);
    expect(RefreshToken.revokeAllForUser).not.toHaveBeenCalled();
  });

  test('revokes every refresh token for the signed-in user and clears this browser\'s cookie', async () => {
    const res = await withCookie(request(buildApp()).post('/api/auth/logout-all'))
      .set('Authorization', `Bearer ${signToken(USER)}`);
    expect(res.status).toBe(200);
    expect(RefreshToken.revokeAllForUser).toHaveBeenCalledWith(USER.id);
    expect(setCookies(res).join(';')).toMatch(/refresh_token=;/);
  });

  test('also requires the CSRF header', async () => {
    const res = await request(buildApp()).post('/api/auth/logout-all').set('Authorization', `Bearer ${signToken(USER)}`);
    expect(res.status).toBe(403);
  });
});
