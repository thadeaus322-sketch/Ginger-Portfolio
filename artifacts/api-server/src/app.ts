import path from "path";
import fsp from "fs/promises";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { db, galleriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { slugifyGalleryName } from "./routes/publicGallery.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", router);

// ── Serve frontend in production ───────────────────────────────────────────
// The Vite build output lands at dist/public (one directory up from dist/)
const frontendDist = path.join(__dirname, "..", "public");

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function galleryMetaHtml(
  html: string,
  title: string,
  description: string,
  publicUrl: string,
  thumbnailUrl: string,
): string {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(publicUrl);
  const safeThumbnail = escapeHtml(thumbnailUrl);
  const replacements: Array<[RegExp, string]> = [
    [/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`],
    [/<meta name="description"[^>]*>/i, `<meta name="description" content="${safeDescription}" />`],
    [/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${safeTitle}" />`],
    [/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${safeDescription}" />`],
    [/<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${safeThumbnail}" />`],
    [/<meta property="og:image:alt"[^>]*>/i, `<meta property="og:image:alt" content="${safeTitle}" />`],
    [/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${safeUrl}" />`],
    [/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${safeTitle}" />`],
    [/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${safeDescription}" />`],
    [/<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${safeThumbnail}" />`],
    [/<meta name="twitter:image:alt"[^>]*>/i, `<meta name="twitter:image:alt" content="${safeTitle}" />`],
  ];

  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), html);
}

// Social crawlers do not run the gallery's React code. Give them the real
// gallery title and the selected cover thumbnail before serving the SPA shell.
app.get(["/gallery/:slug/:token", "/gallery/:token"], async (req, res, next) => {
  const rawToken = req.params.token ?? req.params.slug;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  if (!token) return next();

  try {
    const [gallery] = await db
      .select()
      .from(galleriesTable)
      .where(eq(galleriesTable.accessToken, token));
    if (!gallery || gallery.isRevoked || new Date(gallery.expiresAt) < new Date()) {
      return next();
    }

    const origin = `${req.protocol}://${req.get("host")}`;
    const publicUrl = `${origin}/gallery/${slugifyGalleryName(gallery.clientName, gallery.shootTitle)}/${encodeURIComponent(token)}`;
    const thumbnailUrl = `${origin}/api/gallery/${encodeURIComponent(token)}/thumbnail`;
    const description = `${gallery.clientName} — ${gallery.shootTitle}. Private client gallery by Ginger Studios & Creatives.`;
    const indexHtml = await fsp.readFile(path.join(frontendDist, "index.html"), "utf8");
    res.type("html").send(galleryMetaHtml(indexHtml, `${gallery.shootTitle} | Ginger Studios & Creatives`, description, publicUrl, thumbnailUrl));
  } catch (error) {
    req.log.warn({ err: error }, "Unable to prepare gallery share metadata");
    next();
  }
});

app.use(express.static(frontendDist));

// SPA fallback — any non-API route serves index.html
// Express 5 / path-to-regexp v8 requires named wildcard syntax
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

export default app;
