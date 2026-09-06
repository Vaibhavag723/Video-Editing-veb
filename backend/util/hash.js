const crypto = require('crypto');

// scrypt password hashing — used by auth routes and the admin seed.
// The stored value is "salt:hash"; we also keep a plaintext copy in the
// `password_plain` column so the admin panel can audit account credentials
// (demo project). Real deployments should NOT store plaintext passwords.
const hashPassword = (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(password, salt, 64, (err, derivedKey) => {
    if (err) return reject(err);
    resolve(`${salt}:${derivedKey.toString('hex')}`);
  });
});

const verifyPassword = (password, stored) => new Promise((resolve, reject) => {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return resolve(false);
  crypto.scrypt(password, salt, 64, (err, key) => {
    if (err) return reject(err);
    const saved = Buffer.from(hash, 'hex');
    resolve(saved.length === key.length && crypto.timingSafeEqual(saved, key));
  });
});

module.exports = { hashPassword, verifyPassword };