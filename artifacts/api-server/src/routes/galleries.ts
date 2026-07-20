import { Router } from "express";
import { db, galleriesTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";
import { generateAccessToken } from "../lib/auth.js";
import type { GalleryRow } from "@workspace/db";

const router = Router();

// All gallery admin routes require auth
router.use(requireAdmin);

function computeStatus(g: GalleryRow): "active" | "expiring_soon" | "expired" | "revoked" {
  if (g.isRevoked) return "revoked";
  const now = new Date();
  const exp = new Date(g.expiresAt);
  if (exp < now) return "expired";
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (exp < sevenDays) return "expiring_soon";
  return "active";
}

function toApiGallery(g: GalleryRow) {
  return {
    id: g.id,
    clientName: g.clientName,
    shootTitle: g.shootTitle,
    imageUrls: g.imageUrls ?? [],
    coverUrl: g.coverUrl ?? null,
    notes: g.notes ?? null,
    accessToken: g.accessToken,
    viewCount: g.viewCount,
    imageCount: (g.imageUrls ?? []).length,
    status: computeStatus(g),
    createdAt: g.createdAt.toISOString(),
    expiresAt: g.expiresAt.toISOString(),
  };
}

// GET /galleries/stats — must come before /:id route
router.get("/galleries/stats", async (_req, res) => {
  const rows = await db.select().from(galleriesTable).orderBy(desc(galleriesTable.createdAt));

  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let active = 0, expiringSoon = 0, expired = 0, totalImages = 0, totalViews = 0;

  for (const g of rows) {
    totalImages += (g.imageUrls ?? []).length;
    totalViews += g.viewCount;
    const status = computeStatus(g);
    if (status === "active") active++;
    else if (status === "expiring_soon") expiringSoon++;
    else if (status === "expired") expired++;
  }

  res.json({
    totalGalleries: rows.length,
    activeGalleries: active,
    expiringSoon,
    expiredGalleries: expired,
    totalImages,
    totalViews,
    recentGalleries: rows.slice(0, 5).map(toApiGallery),
  });
});

// GET /galleries
router.get("/galleries", async (_req, res) => {
  const rows = await db.select().from(galleriesTable).orderBy(desc(galleriesTable.createdAt));
  res.json(rows.map(toApiGallery));
});

// POST /galleries
router.post("/galleries", async (req, res) => {
  const { clientName, shootTitle, imageUrls, coverUrl, notes, expiresAt } = req.body as {
    clientName?: string;
    shootTitle?: string;
    imageUrls?: string[];
    coverUrl?: string | null;
    notes?: string | null;
    expiresAt?: string | null;
  };

  if (!clientName || !shootTitle) {
    res.status(400).json({ error: "clientName and shootTitle are required" });
    return;
  }

  const expiry = expiresAt
    ? new Date(expiresAt)
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

  const [gallery] = await db
    .insert(galleriesTable)
    .values({
      clientName,
      shootTitle,
      imageUrls: imageUrls ?? [],
      coverUrl: coverUrl ?? null,
      notes: notes ?? null,
      accessToken: generateAccessToken(),
      expiresAt: expiry,
    })
    .returning();

  res.status(201).json(toApiGallery(gallery));
});

// GET /galleries/:id
router.get("/galleries/:id", async (req, res) => {
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [gallery] = await db.select().from(galleriesTable).where(eq(galleriesTable.id, id));
  if (!gallery) { res.status(404).json({ error: "Gallery not found" }); return; }

  res.json(toApiGallery(gallery));
});

// PATCH /galleries/:id
router.patch("/galleries/:id", async (req, res) => {
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { clientName, shootTitle, expiresAt, status, notes, coverUrl } = req.body as {
    clientName?: string | null;
    shootTitle?: string | null;
    expiresAt?: string | null;
    status?: string | null;
    notes?: string | null;
    coverUrl?: string | null;
  };

  const updates: Partial<typeof galleriesTable.$inferInsert> = {};
  if (clientName != null) updates.clientName = clientName;
  if (shootTitle != null) updates.shootTitle = shootTitle;
  if (notes !== undefined) updates.notes = notes;
  if (coverUrl !== undefined) updates.coverUrl = coverUrl;
  if (expiresAt != null) updates.expiresAt = new Date(expiresAt);
  if (status === "revoked") updates.isRevoked = true;
  if (status === "active") updates.isRevoked = false;

  const [updated] = await db
    .update(galleriesTable)
    .set(updates)
    .where(eq(galleriesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Gallery not found" }); return; }

  res.json(toApiGallery(updated));
});

// DELETE /galleries/:id
router.delete("/galleries/:id", async (req, res) => {
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(galleriesTable).where(eq(galleriesTable.id, id));
  res.json({ ok: true });
});

// POST /galleries/:id/regenerate-link
router.post("/galleries/:id/regenerate-link", async (req, res) => {
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [updated] = await db
    .update(galleriesTable)
    .set({ accessToken: generateAccessToken() })
    .where(eq(galleriesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Gallery not found" }); return; }

  res.json(toApiGallery(updated));
});

export default router;
