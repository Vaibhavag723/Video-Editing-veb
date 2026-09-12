process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';

jest.mock('../models/User');
jest.mock('../config/db', () => ({ query: jest.fn().mockResolvedValue({ rows: [] }) }));

const express = require('express');
const request = require('supertest');
const User = require('../models/User');
const api = require('../routes/api');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', api);
  return app;
}

beforeEach(() => jest.clearAllMocks());

describe('POST /api/auth/signup', () => {
  test('rejects a missing password', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'ada@example.com' });
    expect(res.status).toBe(400);
  });

  test('rejects a short password', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'ada@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  test('rejects a password with no digit', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'ada@example.com', password: 'alletterspw' });
    expect(res.status).toBe(400);
  });

  test('rejects a password with no letter', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'ada@example.com', password: '12345678' });
    expect(res.status).toBe(400);
  });

  test('rejects an invalid email', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'not-an-email', password: 'longenough1' });
    expect(res.status).toBe(400);
  });

  test('rejects a duplicate email', async () => {
    User.findByEmail.mockResolvedValue({ id: 1, email: 'ada@example.com' });
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'ada@example.com', password: 'longenough1' });
    expect(res.status).toBe(409);
  });

  test('creates an account and returns a session token, never the password', async () => {
    User.findByEmail.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 5, name: 'Ada', email: 'ada@example.com', is_admin: false });
    const app = buildApp();
    const res = await request(app).post('/api/auth/signup').send({ name: 'Ada', email: 'ada@example.com', password: 'longenough1' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).not.toHaveProperty('password');
    expect(res.body).not.toHaveProperty('password_hash');
  });
});

describe('POST /api/auth/login', () => {
  test('rejects an unknown email without revealing whether the account exists', async () => {
    User.findByEmail.mockResolvedValue(null);
    const app = buildApp();
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'whatever' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Incorrect email or password.');
  });

  test('locks out an account after repeated failed attempts, even from a fresh IP', async () => {
    // Simulate the login_events audit log already showing 8+ recent failures
    // for this email — the account-level guard should block the request
    // before even checking the password, independent of the caller's IP.
    const db = require('../config/db');
    db.query.mockResolvedValue({ rows: [{ n: 8 }] });
    User.findByEmail.mockResolvedValue({ id: 1, email: 'ada@example.com', password_hash: 'irrelevant' });
    const app = buildApp();
    const res = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'whatever' });
    expect(res.status).toBe(429);
    expect(User.findByEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/google/dev (demo Google sign-in)', () => {
  const OLD_ENV = process.env;
  beforeEach(() => { process.env = { ...OLD_ENV }; delete process.env.GOOGLE_CLIENT_ID; });
  afterAll(() => { process.env = OLD_ENV; });

  test('never signs in to an existing account — only creates a brand-new one', async () => {
    // This is the critical regression test: without this check, anyone who
    // knows a registered email (e.g. the admin's) could be signed in as that
    // account through this "demo" route with no password at all.
    User.findByEmail.mockResolvedValue({ id: 1, email: 'admin@cutroom.com', is_admin: true });
    const app = buildApp();
    const res = await request(app).post('/api/auth/google/dev').send({ name: 'Attacker', email: 'admin@cutroom.com' });
    expect(res.status).toBe(409);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('is disabled by default in production even without a Google client id', async () => {
    process.env.NODE_ENV = 'production';
    User.findByEmail.mockResolvedValue(null);
    const app = buildApp();
    const res = await request(app).post('/api/auth/google/dev').send({ name: 'Ada', email: 'ada@example.com' });
    expect(res.status).toBe(403);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('creates a fresh demo account when the email is not already registered', async () => {
    User.findByEmail.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 9, name: 'Ada', email: 'ada@example.com', is_admin: false });
    const app = buildApp();
    const res = await request(app).post('/api/auth/google/dev').send({ name: 'Ada', email: 'ada@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('protected routes without a session', () => {
  test('GET /api/projects requires authentication', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
  });

  test('GET /api/admin/stats requires authentication', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  test('GET /api/admin/stats is still rejected even with a spoofed X-User-Id header', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/admin/stats').set('X-User-Id', '1');
    expect(res.status).toBe(401);
  });
});
