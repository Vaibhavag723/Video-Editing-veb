const { sendError } = require('../util/errors');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('sendError', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => { process.env.NODE_ENV = originalEnv; });

  test('never leaks the raw error message to the client in production', () => {
    process.env.NODE_ENV = 'production';
    const res = mockRes();
    const dbError = new Error('relation "users" column "ssn" does not exist');
    sendError(res, 500, dbError, 'Something went wrong.');
    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBe('Something went wrong.');
    expect(body.error).not.toContain('relation');
    expect(body.error).not.toContain('ssn');
  });

  test('shows the real message in development for local debugging', () => {
    process.env.NODE_ENV = 'development';
    const res = mockRes();
    sendError(res, 500, new Error('boom'), 'fallback');
    expect(res.json.mock.calls[0][0].error).toBe('boom');
  });

  test('falls back to the generic message when there is no error object', () => {
    process.env.NODE_ENV = 'production';
    const res = mockRes();
    sendError(res, 400, null, 'Invalid request.');
    expect(res.json.mock.calls[0][0].error).toBe('Invalid request.');
  });
});
