#!/usr/bin/env node
// Generates a self-signed TLS certificate for LOCAL HTTPS testing only:
//
//   npm run cert:dev
//
// Writes backend/certs/dev-key.pem + dev-cert.pem (valid 365 days, for
// localhost / 127.0.0.1 / ::1). Then set in backend/.env:
//   SSL_KEY_PATH=./certs/dev-key.pem
//   SSL_CERT_PATH=./certs/dev-cert.pem
// and, to serve the frontend dev server over HTTPS too, start it with
//   VITE_DEV_HTTPS=1
//
// A self-signed certificate is not trusted by browsers — you'll get a
// warning you must click through once. It exists to exercise the HTTPS code
// path (secure cookies, HSTS, the http→https redirect). For a real
// deployment use a certificate from a CA: see deploy/nginx.conf.example
// (Let's Encrypt via certbot).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'certs');
const keyPath = path.join(dir, 'dev-key.pem');
const certPath = path.join(dir, 'dev-cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath) && !process.argv.includes('--force')) {
  console.log(`Certificate already exists in ${dir}\nRe-run with --force to replace it.`);
  process.exit(0);
}

fs.mkdirSync(dir, { recursive: true });
try {
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '365',
    '-keyout', keyPath, '-out', certPath,
    '-subj', '/CN=localhost',
    '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1',
  ], { stdio: 'pipe' });
} catch (err) {
  console.error('Could not run openssl. Install OpenSSL (it ships with Git for Windows, macOS and most Linux distros) and retry.');
  console.error(String(err.stderr || err.message).trim());
  process.exit(1);
}
try { fs.chmodSync(keyPath, 0o600); } catch { /* not supported on Windows — harmless */ }

console.log(`Created:\n  ${keyPath}\n  ${certPath}\n\nNext, add to backend/.env:\n  SSL_KEY_PATH=./certs/dev-key.pem\n  SSL_CERT_PATH=./certs/dev-cert.pem\nthen restart the backend — it will log https://localhost:${process.env.PORT || 5000}.`);
