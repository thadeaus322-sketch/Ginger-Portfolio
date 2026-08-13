import { Router, type Request } from "express";
import { db, galleriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { GalleryRow } from "@workspace/db";
import sharp from "sharp";

const router = Router();

function isExpired(g: GalleryRow): boolean {
  return g.isRevoked || new Date(g.expiresAt) < new Date();
}

function toIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : String(d);
}

export function slugifyGalleryName(clientName: string, shootTitle: string): string {
  const slug = `${clientName}-${shootTitle}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return slug.slice(0, 80) || "gallery";
}

export async function findGalleryByToken(token: string): Promise<GalleryRow | undefined> {
  const [gallery] = await db
    .select()
    .from(galleriesTable)
    .where(eq(galleriesTable.accessToken, token));
  return gallery;
}

function publicImageUrl(req: Request, url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `${req.protocol}:${url}`;
  return `${req.protocol}://${req.get("host")}${url.startsWith("/") ? url : `/${url}`}`;
}

async function fetchImage(
  req: Request,
  url: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(publicImageUrl(req, url), { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Image request failed with status ${response.status}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type")?.split(";")[0] || "image/jpeg",
  };
}

function extensionFor(contentType: string, url: string): string {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  if (byType[contentType]) return byType[contentType];

  const match = url.match(/\.([a-z0-9]+)(?:[?#].*)?$/i);
  return match?.[1]?.toLowerCase() || "jpg";
}

function safeFilename(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "gallery";
}

function contentDisposition(filename: string): string {
  return `attachment; filename="${filename.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: Array<{ name: string; data: Buffer }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const checksum = crc32(file.data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x800, 6);
    localHeader.writeUInt16LE(0, 8); // store without compression
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(file.data.length, 18);
    localHeader.writeUInt32LE(file.data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, file.data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(file.data.length, 20);
    centralHeader.writeUInt32LE(file.data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + file.data.length;
  }

  const localData = Buffer.concat(localParts);
  const centralData = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralData.length, 12);
  end.writeUInt32LE(localData.length, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([localData, centralData, end]);
}

// GET /gallery/:token — public client access
router.get("/gallery/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const gallery = await findGalleryByToken(token);

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

// GET /gallery/:token/download/:index — download one image with a real filename
router.get("/gallery/:token/download/:index", async (req, res) => {
  const token = req.params.token;
  const index = Number.parseInt(req.params.index ?? "", 10);
  if (!token || !Number.isInteger(index) || index < 0) {
    res.status(400).json({ error: "Invalid gallery image" });
    return;
  }

  const gallery = await findGalleryByToken(token);
  if (!gallery || isExpired(gallery)) {
    res.status(404).json({ error: "Gallery not found or link has expired" });
    return;
  }

  const imageUrl = gallery.imageUrls?.[index];
  if (!imageUrl) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  try {
    const image = await fetchImage(req, imageUrl);
    const extension = extensionFor(image.contentType, imageUrl);
    const base = safeFilename(`${gallery.clientName}-${gallery.shootTitle}`);
    res.setHeader("Content-Type", image.contentType);
    res.setHeader("Content-Length", image.buffer.length);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Content-Disposition", contentDisposition(`${base}-${index + 1}.${extension}`));
    res.send(image.buffer);
  } catch (error) {
    req.log.error({ err: error, token, index }, "Failed to download gallery image");
    res.status(502).json({ error: "Unable to download this image right now" });
  }
});

// GET /gallery/:token/download-all — one ZIP download so mobile browsers do not block multiple files
router.get("/gallery/:token/download-all", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const gallery = await findGalleryByToken(token);
  if (!gallery || isExpired(gallery)) {
    res.status(404).json({ error: "Gallery not found or link has expired" });
    return;
  }

  try {
    const base = safeFilename(`${gallery.clientName}-${gallery.shootTitle}`);
    const files: Array<{ name: string; data: Buffer }> = [];
    for (let index = 0; index < (gallery.imageUrls ?? []).length; index++) {
      const imageUrl = gallery.imageUrls[index];
      const image = await fetchImage(req, imageUrl);
      const extension = extensionFor(image.contentType, imageUrl);
      files.push({ name: `${base}-${index + 1}.${extension}`, data: image.buffer });
    }

    const zip = createZip(files);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", zip.length);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", contentDisposition(`${base}.zip`));
    res.send(zip);
  } catch (error) {
    req.log.error({ err: error, token }, "Failed to create gallery download");
    res.status(502).json({ error: "Unable to download the gallery right now" });
  }
});

// GET /gallery/:token/thumbnail — optimized cover photo for social previews
router.get("/gallery/:token/thumbnail", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const gallery = await findGalleryByToken(token);
  if (!gallery || isExpired(gallery)) {
    res.status(404).json({ error: "Gallery not found or link has expired" });
    return;
  }

  const coverUrl = gallery.coverUrl || gallery.imageUrls?.[0];
  if (!coverUrl) {
    res.status(404).json({ error: "Gallery has no cover photo" });
    return;
  }

  try {
    const image = await fetchImage(req, coverUrl);
    const thumbnail = await sharp(image.buffer)
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", thumbnail.length);
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.send(thumbnail);
  } catch (error) {
    req.log.error({ err: error, token }, "Failed to create gallery thumbnail");
    res.status(502).json({ error: "Unable to create the gallery preview right now" });
  }
});

// POST /gallery/:token/view — increment view count
router.post("/gallery/:token/view", async (req, res) => {
  const token = req.params.token;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const gallery = await findGalleryByToken(token);

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
