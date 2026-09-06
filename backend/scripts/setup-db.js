require('dotenv').config();
const { ensurePool, initDb, query, pool } = require('../config/db');

// Manual database setup: `npm run db:setup`
// Connects (boots the embedded cluster if needed), enforces the schema
// (idempotent) and seeds the creative libraries if they are empty.
(async () => {
  try {
    await ensurePool();           // throws if no database can be reached
    await initDb();               // schema + seed (logs internally, non-throwing)
    const { rows } = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM text_templates) AS templates,
        (SELECT COUNT(*)::int FROM stickers)      AS stickers,
        (SELECT COUNT(*)::int FROM music)         AS music,
        (SELECT COUNT(*)::int FROM users)         AS users,
        (SELECT COUNT(*)::int FROM projects)      AS projects
    `);
    console.log('Database ready:', rows[0]);
    // The embedded Postgres child keeps the event loop alive; exit explicitly so
    // the library's shutdown hook stops the cluster cleanly.
    process.exit(0);
  } catch (err) {
    console.error('Database setup failed:', err.message);
    process.exit(1);
  }
})();