const app = require('./app');
const { initDb } = require('./config/db');

const PORT = process.env.PORT || 5000;
const usingTls = !!(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH);

// HTTPS/TLS. In most deployments TLS ends at a reverse proxy (Nginx, Render,
// Cloudflare...) in front of this plain-HTTP server — leave SSL_* empty and set
// TRUST_PROXY=1. When Node itself must terminate TLS (a standalone VM with its
// own certificate), set SSL_KEY_PATH and SSL_CERT_PATH and the server switches
// to https.createServer. Generate a local test pair with `npm run cert:dev`.
function createHttpServer() {
  if (usingTls) {
    const https = require('https');
    const fs = require('fs');
    return https.createServer({
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      minVersion: 'TLSv1.2', // refuse the obsolete SSL 3 / TLS 1.0 / 1.1
    }, app);
  }
  return require('http').createServer(app);
}

// Optional companion listener: when Node terminates TLS, HTTP_REDIRECT_PORT
// (e.g. 80) answers plain-HTTP visitors with a redirect to the HTTPS port.
function startHttpRedirect() {
  const port = process.env.HTTP_REDIRECT_PORT;
  if (!usingTls || !port) return;
  const HOST_PATTERN = /^[a-z0-9.-]+$/i;
  require('http').createServer((req, res) => {
    const host = (process.env.PUBLIC_HOST || (req.headers.host || '').replace(/:\d+$/, ''));
    if (!HOST_PATTERN.test(host.replace(/:\d+$/, ''))) { res.writeHead(400); return res.end(); }
    const target = process.env.PUBLIC_HOST ? host : `${host}${PORT === '443' ? '' : `:${PORT}`}`;
    res.writeHead(308, { Location: `https://${target}${req.url}` });
    res.end();
  }).listen(port, () => console.log(`HTTP→HTTPS redirect listening on :${port}`));
}

async function startServer() {
  createHttpServer().listen(PORT, () => console.log(`Backend running on ${usingTls ? 'https' : 'http'}://localhost:${PORT}`));
  startHttpRedirect();
  initDb(); // schema + seed data, in the background

  // Housekeeping: purge expired password-reset links and long-expired refresh
  // tokens so those tables don't grow forever. Best-effort, never fatal.
  const cleanupStaleTokens = async () => {
    try {
      await require('./models/PasswordReset').deleteExpired();
      await require('./models/RefreshToken').deleteStale();
    } catch (err) {
      console.error('Token cleanup skipped:', err.message);
    }
  };
  setTimeout(cleanupStaleTokens, 30 * 1000);
  setInterval(cleanupStaleTokens, 24 * 60 * 60 * 1000);
}

startServer();
