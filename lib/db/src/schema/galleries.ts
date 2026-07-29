import {
  mysqlTable,
  int,
  text,
  varchar,
  boolean,
  timestamp,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Admin users ──────────────────────────────────────────────────────────────
export const adminUsersTable = mysqlTable(
  "admin_users",
  {
    id:           int("id").primaryKey().autoincrement(),
    email:        varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt:    timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("admin_users_email_idx").on(t.email),
  ]
);

// ─── Galleries ────────────────────────────────────────────────────────────────
export const galleriesTable = mysqlTable(
  "galleries",
  {
    id:          int("id").primaryKey().autoincrement(),
    clientName:  text("client_name").notNull(),
    shootTitle:  text("shoot_title").notNull(),
    /**
     * Stores an ordered array of image URL strings as JSON.
     * Each URL should point to a hosted image (CDN or your uploads folder).
     */
    imageUrls:   json("image_urls").notNull().$type<string[]>().default([]),
    coverUrl:    text("cover_url"),
    notes:       text("notes"),
    accessToken: varchar("access_token", { length: 500 }).notNull().unique(),
    viewCount:   int("view_count").notNull().default(0),
    isRevoked:   boolean("is_revoked").notNull().default(false),
    createdAt:   timestamp("created_at").defaultNow().notNull(),
    expiresAt:   timestamp("expires_at").notNull(),
  },
  (t) => [
    uniqueIndex("galleries_access_token_idx").on(t.accessToken),
    index("galleries_expires_at_idx").on(t.expiresAt),
    index("galleries_is_revoked_idx").on(t.isRevoked),
    index("galleries_status_composite_idx").on(t.isRevoked, t.expiresAt),
  ]
);

// ─── Site Images ──────────────────────────────────────────────────────────────
// section: "hero_slide" | "card_stack" | "portfolio"
// category: "weddings" | "portraits" | "events" | "food" | "products" | "birthday" | "all"
export const siteImagesTable = mysqlTable(
  "site_images",
  {
    id:        int("id").primaryKey().autoincrement(),
    section:   varchar("section", { length: 100 }).notNull(),
    category:  varchar("category", { length: 100 }).notNull().default("all"),
    title:     text("title").notNull().default(""),
    label:     text("label").notNull().default(""),
    imageUrl:  text("image_url").notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    tall:      boolean("tall").notNull().default(false),
    isActive:  boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("site_images_section_idx").on(t.section),
    index("site_images_section_sort_idx").on(t.section, t.sortOrder),
  ]
);

// ─── Zod / insert schema ──────────────────────────────────────────────────────
export const insertGallerySchema = createInsertSchema(galleriesTable).omit({
  id:        true,
  viewCount: true,
  isRevoked: true,
  createdAt: true,
});

export const insertSiteImageSchema = createInsertSchema(siteImagesTable).omit({
  id:        true,
  createdAt: true,
});

export type InsertGallery    = z.infer<typeof insertGallerySchema>;
export type InsertSiteImage  = z.infer<typeof insertSiteImageSchema>;
export type GalleryRow       = typeof galleriesTable.$inferSelect;
export type SiteImageRow     = typeof siteImagesTable.$inferSelect;
export type AdminUser        = typeof adminUsersTable.$inferSelect;
