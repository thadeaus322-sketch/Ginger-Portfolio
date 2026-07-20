import { Router } from "express";
import {
  signToken,
  hashPassword,
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH,
  TOKEN_COOKIE,
} from "../lib/auth.js";
import { requireAdmin, type AuthedRequest } from "../middlewares/auth.js";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  if (email !== ADMIN_EMAIL || hashPassword(password) !== ADMIN_PASSWORD_HASH) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken(email);
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  res.json({ id: 1, email });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(TOKEN_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/auth/me", requireAdmin, (req: AuthedRequest, res) => {
  res.json({ id: 1, email: req.adminEmail });
});

export default router;
