-- Cutroom (CapCut-style) PostgreSQL schema
-- Idempotent: safe to run at every server boot.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  is_admin      BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Add columns to users if they already exist (upgrade path for existing DBs).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
-- Upgrade path: earlier versions stored a plaintext copy of the password for
-- admin-panel debugging. That was a security bug, not a feature — drop it.
ALTER TABLE users DROP COLUMN IF EXISTS password_plain;
-- One-time password-reset tokens. Stored hashed (SHA-256) so a DB leak does not
-- expose usable links; tokens expire after 1 hour and are marked used once
-- consumed. Delete rows are cleaned up opportunistically.
CREATE TABLE IF NOT EXISTS password_resets (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id         SERIAL PRIMARY KEY,
  name       TEXT      NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Creative library: free text templates
CREATE TABLE IF NOT EXISTS text_templates (
  id       SERIAL PRIMARY KEY,
  title    VARCHAR(80)  NOT NULL,
  content  TEXT         NOT NULL,
  font_size INT         NOT NULL DEFAULT 48,
  color    VARCHAR(20)  NOT NULL DEFAULT '#ffffff',
  font     VARCHAR(80)  NOT NULL DEFAULT 'Inter',
  category VARCHAR(40)  NOT NULL DEFAULT 'default'
);

-- Creative library: stickers (emoji glyphs drawn on the canvas)
CREATE TABLE IF NOT EXISTS stickers (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(60) NOT NULL,
  glyph    VARCHAR(12) NOT NULL,
  size     INT         NOT NULL DEFAULT 64,
  category VARCHAR(40) NOT NULL DEFAULT 'default'
);

-- Creative library: background music (public sample URLs)
CREATE TABLE IF NOT EXISTS music (
  id       SERIAL PRIMARY KEY,
  title    VARCHAR(120) NOT NULL,
  artist   VARCHAR(120) DEFAULT '',
  url      TEXT         NOT NULL,
  duration INT          DEFAULT 0,
  category VARCHAR(40)  NOT NULL DEFAULT 'default'
);

-- Cloud-saved unfinished projects
CREATE TABLE IF NOT EXISTS projects (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(160) NOT NULL,
  data       JSONB        NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Website CMS pages edited by admin (Home / About / How it works / Features / Pricing)
CREATE TABLE IF NOT EXISTS site_pages (
  key        VARCHAR(40) PRIMARY KEY,
  title      VARCHAR(120) NOT NULL,
  hero       TEXT DEFAULT '',
  body       TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blog posts managed by admin and shown on the public website
CREATE TABLE IF NOT EXISTS blog_posts (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(160) NOT NULL,
  slug       VARCHAR(80) UNIQUE,
  excerpt    TEXT DEFAULT '',
  content    TEXT NOT NULL,
  image      TEXT DEFAULT '',
  published  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track sign-in events so admin can audit account logins
CREATE TABLE IF NOT EXISTS login_events (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER,
  email      VARCHAR(255),
  success    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Questions / messages submitted through the public "Ask a question" form
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120)  NOT NULL,
  email      VARCHAR(255)  NOT NULL,
  subject    VARCHAR(160)  NOT NULL,
  message    TEXT          NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
