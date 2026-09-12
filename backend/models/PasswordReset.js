const crypto = require('crypto');
const { query } = require('../config/db');

// One-time password-reset tokens backed by the `password_resets` table.
// The raw token is never stored: only its SHA-256 hash, so a leaked database
// does not expose usable reset links.

const TOKEN_TTL_MS = 60 * 60 * 1000; // links are valid for 1 hour

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

// Persist a reset token hash for the given user, expiring in TOKEN_TTL_MS.
async function createForUser(userId, token) {
  const { rows } = await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at`,
    [userId, hashToken(token), new Date(Date.now() + TOKEN_TTL_MS)],
  );
  return rows[0];
}

// Return the newest unconsumed, unexpired reset row for the raw token, or null.
async function findValid(token) {
  const { rows } = await query(
    `SELECT r.id, r.user_id, r.expires_at, u.email
       FROM password_resets r
       JOIN users u ON u.id = r.user_id
      WHERE r.token_hash = $1 AND r.used = false AND r.expires_at > now()
      ORDER BY r.created_at DESC
      LIMIT 1`,
    [hashToken(token)],
  );
  return rows[0] || null;
}

async function markUsed(id) {
  await query('UPDATE password_resets SET used = true WHERE id = $1', [id]);
}

// Consume every outstanding token for a user (after a successful reset).
async function invalidateForUser(userId) {
  await query('UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false', [userId]);
}

// Opportunistic cleanup of expired / already-used rows.
async function deleteExpired() {
  await query('DELETE FROM password_resets WHERE expires_at <= now() OR used = true');
}

module.exports = { hashToken, createForUser, findValid, markUsed, invalidateForUser, deleteExpired };