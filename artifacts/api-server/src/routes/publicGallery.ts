import { Router } from "express";
import { db, galleriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { GalleryRow } from "@workspace/db";
import sharp from "sharp";
import { createZip } from "../lib/zip.js";

const router = Router();

function isExpired(g: GalleryRow): boolean {
  return g.isRevoked || new Date(g.expiresAt) < new Date();
}

function toIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : String(d);
}

function safeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "gallery";
}

function absoluteUrl(req: Parameters<Parameters<typeof router.get>[1]>[0], value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const protocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");
  return `${protocol}://${host}${value.startsWith("/") ? value : `/${value}`}`;
}

function extensionFor(contentType: string | null, url: string): string {
  const mime = (contentType || "").split(";")[0].trim().toLowerCase();
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  if (mime === "image/gif") return "gif";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return match?.[1]?.toLowerCase() || "jpg";
}

async function getGallery(token: string): Promise<GalleryRow | undefined> {
  const [gallery] = await db
    .select()
    .from(galleriesTable)
    .where(eq(galleriesTable.accessToken, token));
  return gallery;
}

async function fetchGalleryImage(
  req: Parameters<Parameters<typeof router.get>[1]>[0],
  gallery: GalleryRow,
  index: number,
): Promise<{ data: Buffer; contentType: string; sourceUrl: string }> {
  const sourceUrl = absoluteUrl(req, gallery.imageUrls[index]);
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Image request failed with ${response.status}`);
  return {
    data: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || "image/jpeg",
    sourceUrl,
  };
}

// GET /gallery/:token — public client access
router.get("/gallery/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const gallery = await getGallery(token);

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

// GET /gallery/:token/cover — small social-share thumbnail
router.get("/gallery/:token/cover", async (req, res) => {
  const token = req.params.token;
  const gallery = token ? await getGallery(token) : undefined;
  if (!gallery || isExpired(gallery) || !gallery.coverUrl) {
    res.status(404).end();
    return;
  }

  try {
    const sourceUrl = absoluteUrl(req, gallery.coverUrl);
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      res.status(404).end();
      return;
    }
    const thumbnail = await sharp(Buffer.from(await response.arrayBuffer()))
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(thumbnail);
  } catch (error) {
    req.log.error({ err: error }, "Failed to create gallery cover thumbnail");
    res.status(500).end();
  }
});

// GET /gallery/:token/download/:index — one photo with a real filename
router.get("/gallery/:token/download/:index", async (req, res) => {
  const token = req.params.token;
  const index = Number.parseInt(req.params.index ?? "", 10);
  const gallery = token ? await getGallery(token) : undefined;
  if (!gallery || isExpired(gallery) || !Number.isInteger(index) || index < 0 || index >= gallery.imageUrls.length) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  try {
    const image = await fetchGalleryImage(req, gallery, index);
    const filename = `${safeName(gallery.shootTitle)}-${index + 1}.${extensionFor(image.contentType, image.sourceUrl)}`;
    res.setHeader("Content-Type", image.contentType);
    res.setHeader("Content-Length", image.data.length);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(image.data);
  } catch (error) {
    req.log.error({ err: error }, "Failed to download gallery image");
    res.status(502).json({ error: "Unable to download this image" });
  }
});

// GET /gallery/:token/download — one ZIP for reliable mobile downloads
router.get("/gallery/:token/download", async (req, res) => {
  const token = req.params.token;
  const gallery = token ? await getGallery(token) : undefined;
  if (!gallery || isExpired(gallery)) {
    res.status(404).json({ error: "Gallery not found or expired" });
    return;
  }

  try {
    const entries = [];
    const folder = safeName(gallery.shootTitle);
    for (let index = 0; index < gallery.imageUrls.length; index++) {
      const image = await fetchGalleryImage(req, gallery, index);
      entries.push({
        name: `${folder}/${folder}-${index + 1}.${extensionFor(image.contentType, image.sourceUrl)}`,
        data: image.data,
      });
    }
    const archive = createZip(entries);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", archive.length);
    res.setHeader("Content-Disposition", `attachment; filename="${folder}-photos.zip"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.send(archive);
  } catch (error) {
    req.log.error({ err: error }, "Failed to create gallery ZIP");
    res.status(502).json({ error: "Unable to prepare gallery download" });
  }
});

// POST /gallery/:token/view — increment view count
router.post("/gallery/:token/view", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const gallery = await getGallery(token);

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
