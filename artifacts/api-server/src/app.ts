import path from "path";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { db, galleriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The Vite build output lands at dist/public (one directory up from dist/)
const frontendDist = path.join(__dirname, "..", "public");

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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character] ?? character));
}

function absolutePublicUrl(req: express.Request, value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || req.protocol;
  return `${protocol}://${req.get("host")}${value.startsWith("/") ? value : `/${value}`}`;
}

// Inject gallery-specific metadata before serving the SPA shell. Social
// crawlers can read the shoot title and optimized cover without running React.
app.get(/^\/gallery\/[^/]+(?:\/[^/]+)?$/, async (req, res, next) => {
  const segments = req.path.split("/").filter(Boolean);
  const token = segments.at(-1);
  if (!token) return next();

  try {
    const [gallery] = await db
      .select()
      .from(galleriesTable)
      .where(eq(galleriesTable.accessToken, token));
    if (!gallery) return next();

    const frontendIndex = path.join(frontendDist, "index.html");
    let html = await readFile(frontendIndex, "utf8");
    const title = escapeHtml(`${gallery.shootTitle} | Ginger Studios & Creatives`);
    const description = escapeHtml(
      `${gallery.clientName}'s private photo gallery from Ginger Studios & Creatives.`,
    );
    const coverUrl = gallery.coverUrl
      ? absolutePublicUrl(req, `/api/gallery/${encodeURIComponent(token)}/cover`)
      : absolutePublicUrl(req, "/images/ginger-studios-share.png");
    const pageUrl = absolutePublicUrl(req, req.path);

    html = html
      .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`)
      .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(coverUrl)}" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`)
      .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${escapeHtml(coverUrl)}" />`)
      .replace("</head>", `<meta property="og:url" content="${escapeHtml(pageUrl)}" /><meta name="twitter:image:alt" content="${title}" /></head>`);

    res.setHeader("Cache-Control", "no-store");
    res.type("html").send(html);
  } catch (error) {
    req.log.error({ err: error }, "Failed to inject gallery metadata");
    next();
  }
});

// ── Serve frontend in production ───────────────────────────────────────────
app.use(express.static(frontendDist));

// SPA fallback — any non-API route serves index.html
// Express 5 / path-to-regexp v8 requires named wildcard syntax
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

export default app;
