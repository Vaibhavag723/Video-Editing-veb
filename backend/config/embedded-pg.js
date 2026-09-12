// Starts a fully embedded PostgreSQL cluster — no system installation needed.
// Data persists in `backend/.pgdata`. Used automatically by config/db.js when
// no external PostgreSQL server is reachable. Set EMBEDDED_PG=0 to disable.
const path = require('path');
const fs = require('fs');

const USER = 'postgres';
const PASSWORD = 'postgres';
const PORT = 5432;
const DATABASE = 'cutroom';

let starting = null;

async function startEmbeddedPg() {
  if (starting) return starting;
  starting = (async () => {
    const { default: EmbeddedPostgres } = await import('embedded-postgres');
    const databaseDir = path.join(__dirname, '..', '.pgdata');
    fs.mkdirSync(databaseDir, { recursive: true });

    const pg = new EmbeddedPostgres({
      databaseDir,
      user: USER,
      password: PASSWORD,
      port: PORT,
      persistent: true, // keep data between restarts
      initdbFlags: ['--encoding=UTF8', '--locale=C'], // required for Unicode library content
      onLog: () => {},   // quiet
      onError: (err) => console.error('[embedded-pg]', typeof err === 'string' ? err : err.message || err),
    });

    // initialise() only creates the cluster the first time. If the data dir was
    // already initialised (PG_VERSION marker exists), skip it — otherwise initdb
    // fails with "directory exists but is not empty".
    const alreadyInitialised = fs.existsSync(path.join(databaseDir, 'PG_VERSION'));
    if (!alreadyInitialised) await pg.initialise();
    await pg.start();

    // Ensure the application database exists on the embedded cluster.
    try {
      await pg.createDatabase(DATABASE);
    } catch (err) {
      // Already exists — that's fine.
    }
    console.log(`Embedded PostgreSQL running on port ${PORT} → postgres://${USER}:${PASSWORD}@localhost:${PORT}/${DATABASE}`);
    return pg;
  })();

  try { await starting; }
  catch (err) { starting = null; throw err; }
  return starting;
}

module.exports = { startEmbeddedPg, DATABASE_URL: `postgres://${USER}:${PASSWORD}@localhost:${PORT}/${DATABASE}` };