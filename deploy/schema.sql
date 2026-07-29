-- Ginger Studios & Creatives — Database Schema
-- Run this once on your PostgreSQL database before starting the server.
-- Safe to re-run (uses IF NOT EXISTS / IF NOT EXISTS equivalents).

-- ─── Admin users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_users_email_unique UNIQUE (email)
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (email);

-- ─── Client Galleries ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS galleries (
  id           SERIAL PRIMARY KEY,
  client_name  TEXT NOT NULL,
  shoot_title  TEXT NOT NULL,
  image_urls   JSONB NOT NULL DEFAULT '[]',
  cover_url    TEXT,
  notes        TEXT,
  access_token TEXT NOT NULL,
  view_count   INTEGER NOT NULL DEFAULT 0,
  is_revoked   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL,
  CONSTRAINT galleries_access_token_unique UNIQUE (access_token)
);

CREATE UNIQUE INDEX IF NOT EXISTS galleries_access_token_idx  ON galleries (access_token);
CREATE INDEX        IF NOT EXISTS galleries_expires_at_idx    ON galleries (expires_at);
CREATE INDEX        IF NOT EXISTS galleries_is_revoked_idx    ON galleries (is_revoked);
CREATE INDEX        IF NOT EXISTS galleries_status_composite_idx ON galleries (is_revoked, expires_at);

-- ─── Site Images (homepage hero, card stack, photography portfolio) ────────────
CREATE TABLE IF NOT EXISTS site_images (
  id         SERIAL PRIMARY KEY,
  section    TEXT NOT NULL,           -- 'hero_slide' | 'card_stack' | 'portfolio'
  category   TEXT NOT NULL DEFAULT 'all',
  title      TEXT NOT NULL DEFAULT '',
  label      TEXT NOT NULL DEFAULT '',
  image_url  TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tall       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_images_section_idx      ON site_images (section);
CREATE INDEX IF NOT EXISTS site_images_section_sort_idx ON site_images (section, sort_order);
