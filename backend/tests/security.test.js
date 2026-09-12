const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const request = require('supertest');

describe('helmet security headers', () => {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'none'"] } } }));
  app.get('/ping', (_req, res) => res.json({ ok: true }));

  test('sets baseline protective headers', async () => {
    const res = await request(app).get('/ping');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
    // Should not advertise the framework/version to potential attackers.
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('rate limiting', () => {
  function buildLimitedApp(max) {
    const app = express();
    app.use(rateLimit({ windowMs: 60_000, max, standardHeaders: true, legacyHeaders: false }));
    app.get('/limited', (_req, res) => res.json({ ok: true }));
    return app;
  }

  test('allows requests under the limit', async () => {
    const app = buildLimitedApp(3);
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/limited');
      expect(res.status).toBe(200);
    }
  });

  test('blocks requests once the limit is exceeded', async () => {
    const app = buildLimitedApp(2);
    await request(app).get('/limited');
    await request(app).get('/limited');
    const res = await request(app).get('/limited');
    expect(res.status).toBe(429);
  });
});
