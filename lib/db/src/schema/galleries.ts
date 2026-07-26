import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Admin users ──────────────────────────────────────────────────────────────
// Raw SQL equivalent:
//
//   CREATE TABLE admin_users (
//     id            SERIAL PRIMARY KEY,
//     email         TEXT NOT NULL,
//     password_hash TEXT NOT NULL,
//     created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//     CONSTRAINT admin_users_email_unique UNIQUE (email)
//   );
//
export const adminUsersTable = pgTable(
  "admin_users",
  {
    id:           serial("id").primaryKey(),
    email:        text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // Fast login lookup by email
    uniqueIndex("admin_users_email_idx").on(t.email),
  ]
);

// ─── Galleries ────────────────────────────────────────────────────────────────
// Raw SQL equivalent:
//
//   CREATE TABLE galleries (
//     id           SERIAL PRIMARY KEY,
//     client_name  TEXT NOT NULL,
//     shoot_title  TEXT NOT NULL,
//     -- image_urls stores an ordered array of HTTPS URL strings.
//     -- JSONB is chosen over a separate images table because:
//     --   1. We always fetch all images together (no partial reads needed).
//     --   2. Galleries contain 50-500 images — well within JSONB's sweet spot.
//     --   3. Single-row fetch avoids a JOIN on every gallery view.
//     --   4. GIN index is NOT added here because we never query inside the array;
//     --      we only retrieve the full column, which uses the primary-key index.
//     image_urls   JSONB NOT NULL DEFAULT '[]',
//     cover_url    TEXT,
//     notes        TEXT,
//     -- accessToken is the only field used for public gallery lookups.
//     -- The UNIQUE constraint creates an implicit B-tree index — O(log n) lookup.
//     access_token TEXT NOT NULL,
//     view_count   INTEGER NOT NULL DEFAULT 0,
//     is_revoked   BOOLEAN NOT NULL DEFAULT FALSE,
//     created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//     expires_at   TIMESTAMPTZ NOT NULL,
//     CONSTRAINT galleries_access_token_unique UNIQUE (access_token)
//   );
//
//   -- Speeds up dashboard queries that filter by status/expiry
//   CREATE INDEX galleries_expires_at_idx  ON galleries (expires_at);
//   CREATE INDEX galleries_is_revoked_idx  ON galleries (is_revoked);
//   -- Composite index for the common "active, not-yet-expired" query
//   CREATE INDEX galleries_status_idx ON galleries (is_revoked, expires_at);
//
export const galleriesTable = pgTable(
  "galleries",
  {
    id:          serial("id").primaryKey(),
    clientName:  text("client_name").notNull(),
    shootTitle:  text("shoot_title").notNull(),
    /**
     * Stores an ordered array of image URL strings.
     * JSONB is the right type here — see SQL comment above for reasoning.
     * Each URL should point to a CDN-hosted image (e.g. Cloudinary, Supabase
     * Storage, or any HTTPS endpoint) to keep the database lightweight and
     * prevent page lag: the DB stores only the address, not the binary data.
     */
    imageUrls:   jsonb("image_urls").notNull().$type<string[]>().default([]),
    coverUrl:    text("cover_url"),
    notes:       text("notes"),
    accessToken: text("access_token").notNull().unique(),
    viewCount:   integer("view_count").notNull().default(0),
    isRevoked:   boolean("is_revoked").notNull().default(false),
    createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt:   timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    // Public gallery lookup — most critical query path
    uniqueIndex("galleries_access_token_idx").on(t.accessToken),
    // Dashboard: filter/sort by expiry date
    index("galleries_expires_at_idx").on(t.expiresAt),
    // Dashboard: filter by revocation status
    index("galleries_is_revoked_idx").on(t.isRevoked),
    // Composite: the common "show active, not-yet-expired galleries" query
    index("galleries_status_composite_idx").on(t.isRevoked, t.expiresAt),
  ]
);

// ─── Zod / insert schema ──────────────────────────────────────────────────────
export const insertGallerySchema = createInsertSchema(galleriesTable).omit({
  id:        true,
  viewCount: true,
  isRevoked: true,
  createdAt: true,
});

export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryRow    = typeof galleriesTable.$inferSelect;
export type AdminUser     = typeof adminUsersTable.$inferSelect;
