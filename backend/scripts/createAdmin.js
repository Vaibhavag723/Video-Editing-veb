require('dotenv').config();
const process = require('process');
const { ensurePool, initDb } = require('../config/db');
const { hashPassword } = require('../util/hash');
const User = require('../models/User');

// Provision an admin account (name, email, password). PostgreSQL assigns the
// numeric id (SERIAL) automatically — we just surface it after creation.
//
// Admins are intentionally NOT creatable via the public Sign In / Sign Up pages
// (signup hard-codes is_admin=false), so only an operator with shell access can
// grant admin rights. The resulting admin then signs in normally on the Sign In
// page and reaches the dashboard through the Admin button.
//
// Usage:
//   npm run create:admin -- --name "Admin User" --email admin@example.com --password secret123
//   ADMIN_NAME="Admin User" ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret123 npm run create:admin

function parseArgs(argv) {
  const out = {};
  const map = {
    '--name': 'name', '-n': 'name',
    '--email': 'email', '-e': 'email',
    '--password': 'password', '-p': 'password',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a in map) { out[map[a]] = argv[++i]; }
    else {
      const m = a.match(/^--(name|email|password)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
  }
  return out;
}

(async () => {
  const args = parseArgs(process.argv);
  const env = { name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };
  const name = String(args.name || env.name || '').trim();
  const email = String(args.email || env.email || '').trim().toLowerCase();
  const password = args.password || env.password || '';

  if (!name || !email || !password) {
    console.error('Usage: node scripts/createAdmin.js --name "Admin User" --email admin@example.com --password secret123');
    console.error('   Env vars: ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD');
    process.exit(1);
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) { console.error('Invalid email:', email); process.exit(1); }
  if (password.length < 8) { console.error('Password must be at least 8 characters.'); process.exit(1); }

  try {
    await ensurePool();
    await initDb();
    const existing = await User.findByEmail(email);
    if (existing) {
      console.log(`An account with email ${email} already exists (id=${existing.id}, is_admin=${existing.is_admin}).`);
      console.log(existing.is_admin
        ? 'It is already an admin; nothing to do.'
        : `Promote it with: UPDATE users SET is_admin = true WHERE id = ${existing.id};  (or re-run after deleting it)`);
      process.exit(0);
    }
    const hashed = await hashPassword(password);
    const created = await User.create(name, email, hashed, password, true);
    console.log('Created admin account:');
    console.log(`  id        : ${created.id}`);
    console.log(`  name      : ${created.name}`);
    console.log(`  email     : ${created.email}`);
    console.log(`  is_admin  : ${created.is_admin}`);
    console.log(`  password  : ${password} (kept plaintext in password_plain only for the demo audit view; hashed on login)`);
    console.log(`  sign in at the Sign In page with email/password above, then click the "Admin" button.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
