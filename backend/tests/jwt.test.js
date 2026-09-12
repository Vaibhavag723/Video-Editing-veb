process.env.JWT_SECRET = 'test-secret-do-not-use-in-prod';
const { signToken, verifyToken } = require('../util/jwt');

describe('signToken / verifyToken', () => {
  test('a token signed for a user verifies back to that user id', () => {
    const token = signToken({ id: 42 });
    const payload = verifyToken(token);
    expect(payload.sub).toBe(42);
  });

  test('a tampered token fails verification', () => {
    const token = signToken({ id: 1 });
    const tampered = token.slice(0, -2) + (token.slice(-2) === 'aa' ? 'bb' : 'aa');
    expect(() => verifyToken(tampered)).toThrow();
  });

  test('a token does not carry name/email/is_admin in its payload', () => {
    const token = signToken({ id: 1, name: 'Admin', email: 'admin@cutroom.com', is_admin: true });
    const payload = verifyToken(token);
    expect(payload).not.toHaveProperty('name');
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('is_admin');
  });
});
