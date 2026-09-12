const crypto = require('crypto');

// scrypt password hashing — used by auth routes. Only the salted hash is ever
// stored (as "salt:hash"); the plaintext password never touches the database.
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
