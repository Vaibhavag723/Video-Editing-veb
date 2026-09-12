const { hashPassword, verifyPassword } = require('../util/hash');

describe('hashPassword / verifyPassword', () => {
  test('a correct password verifies against its own hash', async () => {
    const stored = await hashPassword('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', stored)).resolves.toBe(true);
  });

  test('a wrong password is rejected', async () => {
    const stored = await hashPassword('correct horse battery staple');
    await expect(verifyPassword('wrong password', stored)).resolves.toBe(false);
  });

  test('two hashes of the same password are different (random salt)', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);
  });

  test('never stores or returns the plaintext password', async () => {
    const stored = await hashPassword('super-secret');
    expect(stored).not.toContain('super-secret');
  });

  test('a malformed stored value fails closed instead of throwing', async () => {
    await expect(verifyPassword('anything', 'not-a-real-hash')).resolves.toBe(false);
  });
});
