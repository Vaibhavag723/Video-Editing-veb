process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';

jest.mock('../models/User');
jest.mock('../models/ContactMessage');
jest.mock('../config/db', () => ({ query: jest.fn() }));

const express = require('express');
const request = require('supertest');
const User = require('../models/User');
const db = require('../config/db');
const { signToken } = require('../util/jwt');
const api = require('../routes/api');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', api);
  return app;
}

const ADMIN = { id: 1, name: 'Admin', email: 'admin@cutroom.com', is_admin: true };
const PLAIN = { id: 7, name: 'Alice', email: 'alice@example.com', is_admin: false };
const adminAuth = () => `Bearer ${signToken({ id: ADMIN.id })}`;
const plainAuth = () => `Bearer ${signToken({ id: PLAIN.id })}`;

beforeEach(() => {
  jest.clearAllMocks();
  db.query.mockResolvedValue({ rows: [{ n: 0 }] });
});

describe('admin route authorization', () => {
  test('no session is rejected with 401', async () => {
    const res = await request(buildApp()).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('a valid non-admin session is rejected with 403', async () => {
    User.findById.mockResolvedValue(PLAIN);
    const res = await request(buildApp()).get('/api/admin/users').set('Authorization', plainAuth());
    expect(res.status).toBe(403);
  });

  test('a valid admin session is allowed through', async () => {
    User.findById.mockResolvedValue(ADMIN);
    User.findAllWithMeta.mockResolvedValue([]);
    const res = await request(buildApp()).get('/api/admin/users').set('Authorization', adminAuth());
    expect(res.status).toBe(200);
  });

  test('a demoted admin loses access immediately, without waiting for the token to expire', async () => {
    // The token is still cryptographically valid, but the middleware re-reads
    // the user from the DB on every request, so is_admin=false wins.
    User.findById.mockResolvedValue({ ...ADMIN, is_admin: false });
    const res = await request(buildApp()).get('/api/admin/users').set('Authorization', adminAuth());
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/admin/users/:id/role', () => {
  beforeEach(() => { User.findById.mockImplementation((id) => Promise.resolve(Number(id) === ADMIN.id ? ADMIN : PLAIN)); });

  test('an admin cannot change their own role', async () => {
    const res = await request(buildApp())
      .patch(`/api/admin/users/${ADMIN.id}/role`).set('Authorization', adminAuth()).send({ isAdmin: 'true' });
    expect(res.status).toBe(400);
    expect(User.setAdmin).not.toHaveBeenCalled();
  });

  test('demotion is refused — the admin role is permanent', async () => {
    User.findById.mockImplementation((id) => Promise.resolve(
      Number(id) === ADMIN.id ? ADMIN : { ...PLAIN, id: 8, is_admin: true }));
    const res = await request(buildApp())
      .patch('/api/admin/users/8/role').set('Authorization', adminAuth()).send({ isAdmin: 'false' });
    expect(res.status).toBe(400);
    expect(User.setAdmin).not.toHaveBeenCalled();
  });

  test('404s for a user that does not exist', async () => {
    User.findById.mockImplementation((id) => Promise.resolve(Number(id) === ADMIN.id ? ADMIN : null));
    const res = await request(buildApp())
      .patch('/api/admin/users/999/role').set('Authorization', adminAuth()).send({ isAdmin: 'true' });
    expect(res.status).toBe(404);
  });

  test('promotes a regular user to admin', async () => {
    User.setAdmin.mockResolvedValue({ ...PLAIN, is_admin: true });
    const res = await request(buildApp())
      .patch(`/api/admin/users/${PLAIN.id}/role`).set('Authorization', adminAuth()).send({ isAdmin: 'true' });
    expect(res.status).toBe(200);
    expect(User.setAdmin).toHaveBeenCalledWith(PLAIN.id, true);
  });
});

describe('DELETE /api/admin/users/:id', () => {
  beforeEach(() => { User.findById.mockResolvedValue(ADMIN); });

  test('an admin cannot delete their own account', async () => {
    const res = await request(buildApp()).delete(`/api/admin/users/${ADMIN.id}`).set('Authorization', adminAuth());
    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalledWith(expect.stringContaining('DELETE FROM users'), expect.anything());
  });

  test('deletes another account', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(buildApp()).delete('/api/admin/users/7').set('Authorization', adminAuth());
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/admin/users/:id', () => {
  beforeEach(() => { User.findById.mockResolvedValue(ADMIN); });

  test('rejects a missing name or email', async () => {
    const res = await request(buildApp()).put('/api/admin/users/7').set('Authorization', adminAuth()).send({ name: '', email: '' });
    expect(res.status).toBe(400);
  });

  test('rejects a malformed email', async () => {
    const res = await request(buildApp()).put('/api/admin/users/7').set('Authorization', adminAuth())
      .send({ name: 'Alice', email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  test('rejects an email already taken by a different account', async () => {
    User.findByEmail.mockResolvedValue({ id: 99, email: 'taken@example.com' });
    const res = await request(buildApp()).put('/api/admin/users/7').set('Authorization', adminAuth())
      .send({ name: 'Alice', email: 'taken@example.com' });
    expect(res.status).toBe(409);
  });

  test('allows keeping the same email on the same account', async () => {
    User.findByEmail.mockResolvedValue({ id: 7, email: 'alice@example.com' });
    User.updateUser.mockResolvedValue({ ...PLAIN });
    const res = await request(buildApp()).put('/api/admin/users/7').set('Authorization', adminAuth())
      .send({ name: 'Alice', email: 'alice@example.com' });
    expect(res.status).toBe(200);
  });

  test('rejects a weak new password', async () => {
    User.findByEmail.mockResolvedValue(null);
    const res = await request(buildApp()).put('/api/admin/users/7').set('Authorization', adminAuth())
      .send({ name: 'Alice', email: 'alice@example.com', password: 'weak' });
    expect(res.status).toBe(400);
    expect(User.updateUser).not.toHaveBeenCalled();
  });

  test('404s when the target user does not exist', async () => {
    User.findByEmail.mockResolvedValue(null);
    User.updateUser.mockResolvedValue(null);
    const res = await request(buildApp()).put('/api/admin/users/999').set('Authorization', adminAuth())
      .send({ name: 'Ghost', email: 'ghost@example.com' });
    expect(res.status).toBe(404);
  });
});
