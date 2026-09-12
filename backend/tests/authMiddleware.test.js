process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';
const { signToken } = require('../util/jwt');

jest.mock('../models/User');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('requireAuth', () => {
  test('rejects a request with no Authorization header', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a request with an invalid token', async () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid token and attaches the fresh user record', async () => {
    User.findById.mockResolvedValue({ id: 7, name: 'Ada', is_admin: false });
    const token = signToken({ id: 7 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 7, name: 'Ada', is_admin: false });
  });

  test('a token can never impersonate a client-chosen user id — only the signed id is trusted', async () => {
    User.findById.mockResolvedValue({ id: 7, name: 'Ada', is_admin: false });
    const token = signToken({ id: 7 });
    // Even if the request body/query tries to claim a different id, the
    // middleware only ever looks up the id embedded in the signed token.
    const req = { headers: { authorization: `Bearer ${token}` }, body: { userId: 1 }, query: { userId: 1 } };
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(User.findById).toHaveBeenCalledWith(7);
    expect(User.findById).not.toHaveBeenCalledWith(1);
  });
});

describe('requireAdmin', () => {
  test('rejects a valid session that is not an admin', async () => {
    User.findById.mockResolvedValue({ id: 7, name: 'Ada', is_admin: false });
    const token = signToken({ id: 7 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    await requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid admin session', async () => {
    User.findById.mockResolvedValue({ id: 1, name: 'Admin', is_admin: true });
    const token = signToken({ id: 1 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.adminUser.is_admin).toBe(true);
  });

  test('a plain X-User-Id header alone grants nothing (no token, no access)', async () => {
    const req = { headers: { 'x-user-id': '1' } };
    const res = mockRes();
    const next = jest.fn();
    await requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
