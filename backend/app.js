require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const enforceHttps = require('./middleware/enforceHttps');
const api = require('./routes/api');

// Fail fast on missing/weak security config instead of booting with a
// silently insecure default (util/jwt.js already throws if JWT_SECRET is unset).
if (process.env.NODE_ENV === 'production') {
  const weakSecrets = ['change-me-to-a-long-random-string', 'secret', ''];
  if (!process.env.JWT_SECRET || weakSecrets.includes(process.env.JWT_SECRET) || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a long, random value in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  }
  if (!process.env.ALLOWED_ORIGINS) {
    console.warn('WARNING: ALLOWED_ORIGINS is not set in production — CORS allows every origin and cookie endpoints skip the Origin check.');
  }
}

const app = express();

// Behind Nginx/Render/Heroku/Cloudflare, trust the first proxy hop so req.ip,
// the rate limiter and req.secure (X-Forwarded-Proto) reflect the real client.
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);

// 1. HTTPS first: nothing below should ever see a plain-HTTP request in production.
app.use(enforceHttps);

// 2. Security headers (helmet).
// CSP: this is a pure JSON API — it never serves HTML, scripts or styles — so
// the strictest policy is also the correct one. `default-src 'none'` blocks
// every resource type unless allowed, and `frame-ancestors 'none'` stops these
// responses being framed by another site (clickjacking). Nothing here is
// loosened per route; a future route that must serve HTML gets its own scoped
// helmet call. (The frontend has its own CSP: see frontend/vite.config.js.)
// HSTS: once a browser has seen this header over HTTPS it refuses plain HTTP
// to this host for a year, which defeats SSL-stripping downgrade attacks.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

// 3. Cookies (the httpOnly refresh-token cookie; see routes/api.js).
app.use(cookieParser());

// 4. CORS policy.
//  - Origins: ALLOWED_ORIGINS is an allowlist. Requests with no Origin header
//    (curl, server-to-server, same-origin) are not browser cross-site calls so
//    they pass; any other unlisted origin gets no CORS headers, so the browser
//    blocks the response. With ALLOWED_ORIGINS empty (local dev) any origin is
//    allowed. `credentials: true` (needed for the refresh cookie) cannot be
//    combined with a wildcard, so this echoes back the one matching origin.
//  - Methods: only the verbs the API actually uses. TRACE/CONNECT/HEAD-style
//    verbs are never approved in a preflight.
//  - Headers: only those the frontend sends. Anything else fails the preflight.
//  - maxAge: browsers cache the preflight for 10 minutes, cutting OPTIONS traffic.
const allowedOrigins = () => (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    const list = allowedOrigins();
    if (!origin || list.length === 0 || list.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Retry-After'],
  maxAge: 600,
  optionsSuccessStatus: 204,
}));

// Small JSON bodies only — auth forms, project metadata, CMS text; never raw video.
app.use(express.json({ limit: '2mb' }));

// HTTP Parameter Pollution guard: ?email=a&email=b would otherwise arrive as an
// array and slip past code that assumes a string.
app.use(hpp());

// General API rate limit, then a stricter one on the auth endpoints.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a few minutes.' },
}));
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
}));

app.use('/api', api);

module.exports = app;
