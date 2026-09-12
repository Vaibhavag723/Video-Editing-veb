require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const api = require('./routes/api');

const app = express();
// In dev (no ALLOWED_ORIGINS set) allow any origin so `npm run dev` just
// works; in production set ALLOWED_ORIGINS to a comma-separated list of your
// real frontend domain(s) so the API only accepts requests from your app.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json());
app.use('/api', api);

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Start the HTTP server immediately - the API is available even without DB.
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  // Ensure PostgreSQL schema + seed data (runs in the background).
  initDb();
}

startServer();