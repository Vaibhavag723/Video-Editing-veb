require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const api = require('./routes/api');

const app = express();
app.use(cors());
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