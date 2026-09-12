require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./config/db');
const api = require('./routes/api');

// Fail fast on missing/weak security config instead of booting with a
// silently insecure default. util/jwt.js already throws if JWT_SECRET is
// completely unset; this catches the "set but trivially guessable" case
// specifically for production deploys.
if (process.env.NODE_ENV === 'production') {
  const weakSecrets = ['change-me-to-a-long-random-string', 'secret', ''];
  if (!process.env.JWT_SECRET || weakSecrets.includes(process.env.JWT_SECRET) || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a long, random value in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  }
  if (!process.env.ALLOWED_ORIGINS) {
    console.warn('WARNING: ALLOWED_ORIGINS is not set in production — CORS defaults to allowing every origin.');
  }
}

const app = express();

// Trust the first proxy hop (needed behind Nginx/Heroku/Render/etc. so
// req.ip and the rate limiter see the real client IP instead of the proxy's).
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);

// Security headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, etc.
// This is a pure JSON API (no HTML/inline scripts served here), so a strict
// default-src 'none' CSP is safe and does not need per-route tuning.
app.use(helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

// In dev (no ALLOWED_ORIGINS set) allow any origin so `npm run dev` just
// works; in production set ALLOWED_ORIGINS to a comma-separated list of your
// real frontend domain(s) so the API only accepts requests from your app.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));

// Cap request body size — this API only ever receives small JSON payloads
// (auth forms, project metadata, CMS text), never raw video, so 2mb is
// generous headroom while still blocking oversized-payload abuse.
app.use(express.json({ limit: '2mb' }));

// HTTP Parameter Pollution guard: if a client sends the same query-string key
// twice (?email=a&email=b), Express normally hands you an array, which can
// bypass code written assuming a string (e.g. regex/length checks silently
// passing on an array). hpp collapses duplicates to the last value instead.
app.use(hpp());

// General API rate limit: generous enough for normal editor use, but caps
// scripted abuse / scraping.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a few minutes.' },
}));

// Stricter limit on auth endpoints specifically — these are the routes worth
// protecting against credential stuffing / brute-force / signup spam. Keyed
// by IP; a real deployment behind a shared NAT may want to also key by email.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});
app.use('/api/auth', authLimiter);

app.use('/api', api);

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Start the HTTP server immediately - the API is available even without DB.
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  // Ensure PostgreSQL schema + seed data (runs in the background).
  initDb();
}

startServer();
