const { query } = require('../config/db');

// Questions submitted through the public "Ask a question" form. Stored so the
// admin panel can read and reply to them.
async function create({ name, email, subject, message }) {
  const { rows } = await query(
    `INSERT INTO contact_messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, created_at`,
    [name, email, subject, message],
  );
  return rows[0];
}

async function findAll() {
  const { rows } = await query(
    'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200',
  );
  return rows;
}

module.exports = { create, findAll };