import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const galleriesTable = pgTable("galleries", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  shootTitle: text("shoot_title").notNull(),
  imageUrls: jsonb("image_urls").notNull().$type<string[]>().default([]),
  coverUrl: text("cover_url"),
  notes: text("notes"),
  accessToken: text("access_token").notNull().unique(),
  viewCount: integer("view_count").notNull().default(0),
  isRevoked: boolean("is_revoked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertGallerySchema = createInsertSchema(galleriesTable).omit({
  id: true,
  viewCount: true,
  isRevoked: true,
  createdAt: true,
});

export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryRow = typeof galleriesTable.$inferSelect;
export type AdminUser = typeof adminUsersTable.$inferSelect;
