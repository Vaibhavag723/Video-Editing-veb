import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Content-Security-Policy for the built site.
//
// A CSP tells the browser which origins each kind of resource may load from,
// so an injected <script> from evil.example simply doesn't run. It is built
// here (not hard-coded in index.html) because `connect-src` must include
// whatever API origin VITE_API_URL points at, which differs per deployment.
// It's injected at BUILD time only: the dev server needs inline scripts and a
// websocket for hot reload, which a strict policy would break.
//
// What the app really loads, and why each source is listed:
//   script-src   'self' + Google Identity Services (the Sign in with Google button)
//   style-src    'self' + Google Fonts CSS + Google's button CSS; 'unsafe-inline'
//                because the Google button injects inline styles
//   font-src     Google Fonts files
//   img-src      'self', data:, blob:, https: (blog/CMS images use arbitrary https URLs)
//   media-src    blob: — imported videos/audio are played from object URLs
//   connect-src  'self' + the API origin + Google's sign-in endpoints
//   frame-src    Google's sign-in popup frame
//   object-src   'none' — no plugins; base-uri/form-action locked to 'self'
//
// NOTE: `frame-ancestors` (anti-clickjacking) is ignored when a CSP is
// delivered via <meta>. Set it as a real HTTP header at your host — see
// deploy/nginx.conf.example.
function buildCsp(apiOrigin) {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://accounts.google.com/gsi/client'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com/gsi/style'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'media-src': ["'self'", 'blob:'],
    'connect-src': ["'self'", apiOrigin, 'https://accounts.google.com/gsi/'],
    'frame-src': ['https://accounts.google.com/gsi/'],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };
  // Only when the API itself is https — on a plain-http local build this
  // directive would rewrite every API call to https and break it.
  if (apiOrigin.startsWith('https://')) directives['upgrade-insecure-requests'] = [];
  return Object.entries(directives).map(([k, v]) => [k, ...v].join(' ')).join('; ');
}

function cspPlugin(apiUrl) {
  let apiOrigin = 'http://localhost:5000';
  try { apiOrigin = new URL(apiUrl).origin; } catch { /* keep the default */ }
  const policy = buildCsp(apiOrigin);
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      // First thing in <head>, so it governs everything that follows.
      return html.replace(/<head>/i, `<head>\n  <meta http-equiv="Content-Security-Policy" content="${policy}" />`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000/api';

  // Optional local HTTPS for the dev server: run `npm run cert:dev` in
  // backend/, then start with VITE_DEV_HTTPS=1. Off by default.
  let https;
  if (env.VITE_DEV_HTTPS === '1') {
    const keyPath = path.resolve('../backend/certs/dev-key.pem');
    const certPath = path.resolve('../backend/certs/dev-cert.pem');
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      https = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    } else {
      console.warn('VITE_DEV_HTTPS=1 but backend/certs/dev-*.pem not found — run `npm run cert:dev` in backend/. Falling back to http.');
    }
  }

  return {
    plugins: [react(), cspPlugin(apiUrl)],
    server: { port: 3000, https },
  };
});
