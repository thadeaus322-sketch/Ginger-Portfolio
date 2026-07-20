import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.use(requireAdmin);

// POST /upload/complete — register already-uploaded URLs
router.post("/upload/complete", (req, res) => {
  const { urls } = req.body as { urls?: string[] };

  if (!Array.isArray(urls) || urls.length === 0) {
    res.status(400).json({ error: "urls array is required" });
    return;
  }

  const validUrls = urls.filter((u) => typeof u === "string" && u.startsWith("http"));

  res.json({
    urls: validUrls,
    count: validUrls.length,
  });
});

export default router;
