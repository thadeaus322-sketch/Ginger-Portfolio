import { Router } from "express";
import { db, galleriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { GalleryRow } from "@workspace/db";

const router = Router();

function isExpired(g: GalleryRow): boolean {
  return g.isRevoked || new Date(g.expiresAt) < new Date();
}

function toIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : String(d);
}

// GET /gallery/:token — public client access
router.get("/gallery/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const [gallery] = await db
    .select()
    .from(galleriesTable)
    .where(eq(galleriesTable.accessToken, token));

  if (!gallery) {
    res.status(404).json({ error: "Gallery not found or link is invalid" });
    return;
  }

  const expired = isExpired(gallery);

  if (expired) {
    res.status(410).json({
      error: "This gallery link has expired. Please contact Ginger Studios to request a new link.",
    });
    return;
  }

  res.json({
    clientName: gallery.clientName,
    shootTitle: gallery.shootTitle,
    imageUrls: gallery.imageUrls ?? [],
    coverUrl: gallery.coverUrl ?? null,
    expiresAt: toIso(gallery.expiresAt),
    isExpired: false,
  });
});

// POST /gallery/:token/view — increment view count
router.post("/gallery/:token/view", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const [gallery] = await db
    .select()
    .from(galleriesTable)
    .where(eq(galleriesTable.accessToken, token));

  if (!gallery || isExpired(gallery)) {
    res.json({ ok: true }); // silently ignore
    return;
  }

  await db
    .update(galleriesTable)
    .set({ viewCount: sql`${galleriesTable.viewCount} + 1` })
    .where(eq(galleriesTable.accessToken, token));

  res.json({ ok: true });
});

export default router;
