const crypto = require('crypto');
const { query } = require('../config/db');

// Refresh tokens backed by the `refresh_tokens` table. As with PasswordReset,
// only a SHA-256 hash of the raw token is ever stored — a leaked database
// alone can't be replayed to log in as anyone.
//
// Tokens are rotated on every use: `rotate()` atomically revokes the
// presented token and inserts a new one in its place. If a refresh token is
// ever presented twice (e.g. a stolen token used after the legitimate owner
// already rotated it), the second attempt finds it already revoked — that's
// the signal in routes/api.js to revoke the whole session as a precaution.

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

// Issue a fresh refresh token for a user and return the RAW token (only the
// hash is persisted). Callers are responsible for sending the raw value to
// the client (as an httpOnly cookie) and never logging or storing it themselves.
async function issue(userId) {
  const token = generateToken();
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(token), new Date(Date.now() + TOKEN_TTL_MS)],
  );
  return token;
}

// Look up a raw token's row, distinguishing "valid", "expired", and "already
// revoked" (a possible reuse of a stolen/rotated-out token) so callers can
// react differently to each.
async function find(token) {
  const { rows } = await query(
    'SELECT id, user_id, expires_at, revoked_at, rotated_at FROM refresh_tokens WHERE token_hash = $1',
    [hashToken(token)],
  );
  return rows[0] || null;
}

async function revoke(id) {
  await query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL', [id]);
}

// Revoke every outstanding refresh token for a user — used on logout-all and
// as the precaution when a revoked/expired token gets presented again.
async function revokeAllForUser(userId) {
  await query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [userId]);
}

// Revoke the old token and issue a new one in a single call, returning the
// new raw token. Rotation limits how long a stolen refresh token stays useful
// even if it's never detected as reused.
async function rotate(oldTokenId, userId) {
  // rotated_at (as opposed to a plain logout/revoke) is what lets the refresh
  // route tell "two tabs refreshed at the same instant" apart from "a stolen
  // token is being replayed" — see the grace window in routes/api.js.
  await query('UPDATE refresh_tokens SET revoked_at = now(), rotated_at = now() WHERE id = $1 AND revoked_at IS NULL', [oldTokenId]);
  return issue(userId);
}

// Opportunistic cleanup of long-expired rows (kept a little past expiry so
// admins can still see recent revocations if needed).
async function deleteStale() {
  await query("DELETE FROM refresh_tokens WHERE expires_at <= now() - interval '7 days'");
}

module.exports = { issue, find, revoke, revokeAllForUser, rotate, deleteStale };
