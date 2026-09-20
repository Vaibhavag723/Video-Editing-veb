process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';

jest.mock('../models/User');
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

// Signed-in as user 7 throughout.
const ALICE = { id: 7, name: 'Alice', email: 'alice@example.com', is_admin: false };
const aliceAuth = () => `Bearer ${signToken({ id: ALICE.id })}`;

beforeEach(() => {
  jest.clearAllMocks();
  User.findById.mockResolvedValue(ALICE);
  db.query.mockResolvedValue({ rows: [] });
});

describe('GET /api/projects', () => {
  test('requires a session', async () => {
    const res = await request(buildApp()).get('/api/projects');
    expect(res.status).toBe(401);
  });

  test('only ever queries for the authenticated user\'s own rows', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, name: 'Draft', updatedAt: '2026-01-01' }] });
    const res = await request(buildApp()).get('/api/projects').set('Authorization', aliceAuth());
    expect(res.status).toBe(200);
    // The user id passed to SQL must come from the token, not the request.
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), [ALICE.id]);
  });

  test('returns an empty list (not an error) when the user has no saved projects', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(buildApp()).get('/api/projects').set('Authorization', aliceAuth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/projects/:id', () => {
  test('404s for a project id that belongs to someone else', async () => {
    // The SQL is scoped by user_id, so another account's row simply returns
    // no match — the API must not leak that the id exists at all.
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(buildApp()).get('/api/projects/999').set('Authorization', aliceAuth());
    expect(res.status).toBe(404);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('user_id = $2'), ['999', ALICE.id]);
  });

  test('returns the project when it belongs to the caller', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 3, user_id: 7, name: 'My edit' }] });
    const res = await request(buildApp()).get('/api/projects/3').set('Authorization', aliceAuth());
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('My edit');
  });
});

describe('POST /api/projects', () => {
  test('requires a session', async () => {
    const res = await request(buildApp()).post('/api/projects').send({ name: 'x' });
    expect(res.status).toBe(401);
  });

  test('saves under the authenticated user even if the body claims another user_id', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, user_id: 7, name: 'Mine' }] });
    const res = await request(buildApp())
      .post('/api/projects')
      .set('Authorization', aliceAuth())
      .send({ name: 'Mine', data: {}, user_id: 1, userId: 1 });
    expect(res.status).toBe(201);
    const [, params] = db.query.mock.calls[0];
    expect(params[0]).toBe(ALICE.id); // not 1
  });

  test('falls back to a default name when none is given', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1 }] });
    await request(buildApp()).post('/api/projects').set('Authorization', aliceAuth()).send({ data: {} });
    const [, params] = db.query.mock.calls[0];
    expect(params[1]).toBe('Untitled project');
  });

  test('handles a missing data payload without crashing', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1 }] });
    const res = await request(buildApp()).post('/api/projects').set('Authorization', aliceAuth()).send({ name: 'No data' });
    expect(res.status).toBe(201);
    const [, params] = db.query.mock.calls[0];
    expect(params[2]).toBe('{}');
  });
});

describe('DELETE /api/projects/:id', () => {
  test('requires a session', async () => {
    const res = await request(buildApp()).delete('/api/projects/1');
    expect(res.status).toBe(401);
  });

  test('scopes the delete to the caller so it cannot remove another account\'s project', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(buildApp()).delete('/api/projects/999').set('Authorization', aliceAuth());
    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('user_id = $2'), ['999', ALICE.id]);
  });
});
