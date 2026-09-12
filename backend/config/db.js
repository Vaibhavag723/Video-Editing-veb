const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DEFAULT_URL = 'postgres://postgres:postgres@localhost:5432/cutroom';

// PostgreSQL connection pool. Uses DATABASE_URL when set/reachable, otherwise
// automatically spawns an embedded PostgreSQL cluster (backend/.pgdata).
let pool = makePool(process.env.DATABASE_URL || DEFAULT_URL);
let poolReady = false;

function makePool(connectionString) {
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

function describePgError(err) {
  const code = err?.code ? `[${err.code}] ` : '';
  return `${code}${err?.message || String(err)}`;
}

// Ensures the pool is connected. Prefers the configured DATABASE_URL; if it
// cannot be reached and EMBEDDED_PG is not "0", starts the embedded cluster.
async function ensurePool() {
  if (poolReady) return pool;
  try {
    await pool.query('SELECT 1');
    poolReady = true;
    return pool;
  } catch (err) {
    const reason = describePgError(err);
    await pool.end().catch(() => {});
    if (process.env.EMBEDDED_PG === '0') {
      console.error(`PostgreSQL unreachable (${reason}). Start PostgreSQL or set DATABASE_URL in backend/.env (or set EMBEDDED_PG=1 to auto-start one).`);
      throw err;
    }
    console.log(`No PostgreSQL at ${process.env.DATABASE_URL || DEFAULT_URL} (${reason}) — starting embedded PostgreSQL…`);
    try {
      const { startEmbeddedPg, DATABASE_URL } = require('./embedded-pg');
      await startEmbeddedPg();
      pool = makePool(DATABASE_URL);
      await pool.query('SELECT 1');
      poolReady = true;
      return pool;
    } catch (err2) {
      pool = makePool(DEFAULT_URL);
      console.error(`Embedded PostgreSQL failed (${describePgError(err2)}).`);
      throw err2;
    }
  }
}

// Runs schema (idempotent CREATE TABLE IF NOT EXISTS) and inserts seed data
// only when the library tables are empty.
async function initDb() {
  try {
    await ensurePool();
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    await pool.query(fs.readFileSync(schemaPath, 'utf-8'));
    await seedIfEmpty();
    await ensureAdmin();
    await seedSiteContent();
    console.log('PostgreSQL ready (schema enforced, seed ensured).');
  } catch (err) {
    console.error('PostgreSQL init error:', describePgError(err));
  }
  return pool;
}

async function seedIfEmpty() {
  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM text_templates');
  if (Number(rows[0]?.n || 0) === 0) {
    await pool.query(fs.readFileSync(seedPath, 'utf8'));
    console.log('Seeded creative libraries (templates, stickers, music).');
  }
}

// Idempotently create the default admin account (only if no admin exists yet).
// Email/password are configurable via ADMIN_EMAIL / ADMIN_PASSWORD; when
// ADMIN_PASSWORD is not set, a random one is generated and printed once so
// there is no shared, guessable default credential in the codebase.
async function ensureAdmin() {
  const { hashPassword } = require('../util/hash');
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users WHERE is_admin = true');
  if (Number(rows[0]?.n || 0) > 0) return;

  const email = process.env.ADMIN_EMAIL || 'admin@cutroom.com';
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || require('crypto').randomBytes(9).toString('base64url');
  const hashed = await hashPassword(password);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, is_admin) VALUES ('Admin', $1, $2, true)`,
    [email, hashed],
  );
  console.log(`Created default admin account (${email} / ${password})${generated ? ' — generated password, change it after first login' : ''}.`);
}

// Default website content so the public pages + blog have data to render.
async function seedSiteContent() {
  const defaults = [
    {
      key: 'home',
      title: 'Cutroom',
      hero: 'Edit videos in your browser — no installs, no watermark.',
      body: 'Cutroom is a CapCut-style video editor that runs entirely in your browser. Import, trim, cut, color-grade, add text, mix music and export in minutes.',
    },
    {
      key: 'features',
      title: 'Features',
      hero: 'Everything you need to make your video pop.',
      body: '✦ Cut & trim clips in seconds ✦ Pro color tools (brightness, contrast, saturation, hue) ✦ Text overlays & templates ✦ Sticker library ✦ Background music mixer ✦ Instant browser export ✦ Cloud-saved projects',
    },
    {
      key: 'how-it-works',
      title: 'How it works',
      hero: 'Create in three simple steps.',
      body: '1. Import a video from your device. 2. Trim, cut, color and add text or music. 3. Export straight to a WebM file in your browser.',
    },
    {
      key: 'about',
      title: 'About Cutroom',
      hero: 'Built by creators, for creators.',
      body: 'Cutroom is a React + Node.js + Express + PostgreSQL app. Your footage never leaves your device — only unfinished projects sync to the cloud so you can keep editing anywhere.',
    },
    {
      key: 'pricing',
      title: 'Pricing',
      hero: 'Start free. Upgrade when you need more.',
      body: 'FREE — Trim, cut, color, text, 720p export. PRO — Stickers, music library, 1080p export, cloud sync. TEAMS — Collaboration, priority support, unlimited projects.',
    },
  ];
  for (const page of defaults) {
    await pool.query(
      `INSERT INTO site_pages (key, title, hero, body)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO NOTHING`,
      [page.key, page.title, page.hero, page.body],
    );
  }

  // Sample blog post so the public Blog tab renders real content.
  const posts = [
    {
      slug: 'welcome-to-cutroom',
      title: 'Welcome to Cutroom',
      excerpt: 'A browser-native, CapCut-style video editor — no install, no watermark.',
      content: 'Cutroom started as a weekend hack to pull video editing out of the desktop and into the browser. Today it runs entirely in your tab — import an MP4, trim, color-grade, drop text and stickers, mix music, and export a WebM in minutes.\n\nBecause it is a website, your project syncs to the cloud so you can keep cutting from any device. Your footage never leaves your machine; only the edit plan does.',
      image: '',
      published: true,
    },
  ];
  for (const post of posts) {
    await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, image, published)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO NOTHING`,
      [post.title, post.slug, post.excerpt, post.content, post.image, post.published],
    );
  }
}

// Convenience wrapper so models/routes do not import `pg` directly.
function query(text, params) {
  return pool.query(text, params);
}

// Export `pool` as a live getter so it always points at the *current* pool
// (ensurePool() may swap it for the embedded PostgreSQL pool).
module.exports = {
  get pool() { return pool; },
  query,
  initDb,
  ensurePool,
};
