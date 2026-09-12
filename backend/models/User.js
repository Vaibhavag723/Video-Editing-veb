const { query } = require('../config/db');

// PostgreSQL-backed "User" model. Only the hashed password is ever stored or
// selected — never plaintext.

const USER_COLS = 'id, name, email, password_hash, is_admin, created_at';

async function findByEmail(email) {
  const { rows } = await query(`SELECT ${USER_COLS} FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query(`SELECT ${USER_COLS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function create(name, email, passwordHash, isAdmin = false) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, is_admin)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, is_admin`,
    [name, email, passwordHash, isAdmin],
  );
  return rows[0];
}

// List every account so the admin panel can view names, emails, roles and
// signup dates. Uses a LEFT JOIN to count each user's login events.
async function findAllWithMeta() {
  const { rows } = await query(`
    SELECT u.id, u.name, u.email, u.is_admin, u.created_at,
           (SELECT COUNT(*)::int FROM login_events le WHERE le.user_id = u.id) AS login_count,
           (SELECT COUNT(*)::int FROM login_events le WHERE le.user_id = u.id AND le.success) AS login_success
    FROM users u ORDER BY u.created_at DESC
  `);
  return rows;
}

// Role management. The admin role is permanent: an existing admin can never be
// demoted through the app. `setAdmin` therefore only ever executes a promotion
// (regular user -> admin); any other request is a no-op that returns the row.
async function setAdmin(id, isAdmin) {
  const current = await findById(id);
  if (!current) return null;
  if (current.is_admin || !isAdmin) return current;
  await query('UPDATE users SET is_admin = true WHERE id = $1', [id]);
  return findById(id);
}

// Update a user's editable profile (name / email / optional new password).
// Pass null for passwordHash to keep the current password.
// This never touches the is_admin column — the admin role is immutable.
async function updateUser(id, { name, email, passwordHash = null }) {
  const { rows } = await query(
    `UPDATE users
        SET name          = COALESCE($2, name),
            email         = COALESCE($3, email),
            password_hash = COALESCE($4, password_hash)
      WHERE id = $1
      RETURNING id, name, email, is_admin, created_at`,
    [id, name, email, passwordHash],
  );
  return rows[0] || null;
}

// Set a brand-new password (used by the "forgot password" reset flow).
async function updatePassword(id, passwordHash) {
  const { rows } = await query(
    'UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING id, name, email, is_admin',
    [id, passwordHash],
  );
  return rows[0] || null;
}

async function findByName(name) {
  const nameClause = String(name || '').trim();
  if (!nameClause) return [];
  const { rows } = await query(
    'SELECT id, name, email FROM users WHERE name ILIKE $1 ORDER BY created_at DESC',
    [`%${nameClause}%`],
  );
  return rows;
}

module.exports = { findByEmail, findById, create, findAllWithMeta, setAdmin, updateUser, updatePassword, findByName };
