const { query } = require('../config/db');

// PostgreSQL-backed "Item" model (serial `id` replaces Mongo _id).

async function findAll() {
  const { rows } = await query('SELECT * FROM items ORDER BY created_at DESC');
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT * FROM items WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create(name) {
  const { rows } = await query(
    'INSERT INTO items (name) VALUES ($1) RETURNING *',
    [name],
  );
  return rows[0];
}

async function remove(id) {
  const { rows } = await query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

module.exports = { findAll, findById, create, remove };
