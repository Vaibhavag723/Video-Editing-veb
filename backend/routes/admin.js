const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { hashPassword } = require('../util/hash');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');
const requireAdmin = require('../middleware/requireAdmin');

// Mounted by routes/api.js at `/admin`. Every route in this module is guarded
// by requireAdmin (verifies the X-User-Id header belongs to an admin).
router.use(requireAdmin);

/* ---------- Dashboard stats ---------- */
router.get('/stats', async (_req, res) => {
  try {
    const users = await query('SELECT COUNT(*)::int AS n FROM users');
    const admins = await query('SELECT COUNT(*)::int AS n FROM users WHERE is_admin = true');
    const posts = await query('SELECT COUNT(*)::int AS n FROM blog_posts');
    const pages = await query('SELECT COUNT(*)::int AS n FROM site_pages');
    const logins = await query('SELECT COUNT(*)::int AS n FROM login_events WHERE success = true');
    res.json({
      users: users.rows[0].n,
      admins: admins.rows[0].n,
      posts: posts.rows[0].n,
      pages: pages.rows[0].n,
      logins: logins.rows[0].n,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- User accounts ---------- */
router.get('/users', async (_req, res) => {
  try { res.json(await User.findAllWithMeta()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Edit a user's profile (name / email / optional new password) from the admin
// "Edit" form. The admin role cannot be changed here — use the role route.
router.put('/users/:id', async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

    // Emails must stay unique — a different account cannot take this address.
    const existing = await User.findByEmail(email);
    if (existing && existing.id !== targetId) {
      return res.status(409).json({ error: 'Another account already uses that email.' });
    }

    let passwordHash = null;
    let passwordPlain = null;
    if (password) {
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      passwordHash = await hashPassword(password);
      passwordPlain = password;
    }

    const updated = await User.updateUser(targetId, { name, email, passwordHash, passwordPlain });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Change a user's role. The admin role is permanent, so only a promotion
// (user -> admin) is possible and you can never change your own role.
router.patch('/users/:id/role', async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const isAdmin = String(req.body.isAdmin || '').toLowerCase() === 'true';
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.is_admin) return res.status(400).json({ error: 'The admin role cannot be changed.' });
    if (targetId === req.adminUser.id) return res.status(400).json({ error: 'You cannot change your own role.' });
    if (!isAdmin) return res.status(400).json({ error: 'Only promotion to Admin is allowed — the admin role is permanent.' });
    res.json(await User.setAdmin(targetId, true));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (Number(req.params.id) === req.adminUser.id) return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- Login audit ---------- */
router.get('/login-events', async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM login_events ORDER BY created_at DESC LIMIT 200');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- Questions from the "Ask a question" form ---------- */
router.get('/messages', async (_req, res) => {
  try { res.json(await ContactMessage.findAll()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- Site page editor ---------- */
router.get('/pages', async (_req, res) => {
  try { res.json((await query('SELECT * FROM site_pages ORDER BY key')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/pages/:key', async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const hero = String(req.body.hero || '');
    const body = String(req.body.body || '');
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const { rows } = await query(
      'UPDATE site_pages SET title = $1, hero = $2, body = $3, updated_at = now() WHERE key = $4 RETURNING *',
      [title, hero, body, req.params.key],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Page not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- Blog CRUD ---------- */
router.get('/blog', async (_req, res) => {
  try { res.json((await query('SELECT id, title, slug, excerpt, image, published, created_at, updated_at FROM blog_posts ORDER BY created_at DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/blog', async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const slug = String(req.body.slug || '').trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { rows } = await query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, image, published)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, slug, String(req.body.excerpt || ''), String(req.body.content || ''), String(req.body.image || ''), !!req.body.published],
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/blog/:id', async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const { rows } = await query(
      `UPDATE blog_posts SET title = $1, slug = $2, excerpt = $3, content = $4, image = $5, published = $6, updated_at = now()
       WHERE id = $7 RETURNING *`,
      [title, String(req.body.slug || ''), String(req.body.excerpt || ''), String(req.body.content || ''), String(req.body.image || ''), !!req.body.published, req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Post not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/posts/:id', async (req, res) => {
  try {
    await query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;