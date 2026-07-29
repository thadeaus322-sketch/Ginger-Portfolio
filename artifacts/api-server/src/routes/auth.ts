import { Router } from "express";
import { db, adminUsersTable } from "@workspace/db";
import {
  signToken,
  hashPassword,
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH,
  TOKEN_COOKIE,
} from "../lib/auth.js";
import { requireAdmin, type AuthedRequest } from "../middlewares/auth.js";

const router = Router();

// ─── Helpers: resolve effective credentials (DB overrides env vars) ───────────

async function getEffectiveCredentials(): Promise<{ email: string; passwordHash: string; usingDefaults: boolean }> {
  const [row] = await db.select().from(adminUsersTable).limit(1);
  if (row) {
    return { email: row.email, passwordHash: row.passwordHash, usingDefaults: false };
  }
  return { email: ADMIN_EMAIL, passwordHash: ADMIN_PASSWORD_HASH, usingDefaults: true };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const { email: effectiveEmail, passwordHash: effectiveHash } = await getEffectiveCredentials();

  if (email !== effectiveEmail || hashPassword(password) !== effectiveHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken(email);
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ id: 1, email });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(TOKEN_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/auth/me", requireAdmin, async (req: AuthedRequest, res) => {
  const { email, usingDefaults } = await getEffectiveCredentials();
  res.json({ id: 1, email, usingDefaults });
});

/**
 * POST /auth/update-settings
 * Lets the logged-in admin change their email and/or password.
 * Always requires the current password for confirmation.
 */
router.post("/auth/update-settings", requireAdmin, async (req, res) => {
  const { currentPassword, newPassword, newEmail } =
    req.body as { currentPassword?: string; newPassword?: string; newEmail?: string };

  if (!currentPassword) {
    res.status(400).json({ error: "Current password is required" });
    return;
  }

  // Verify current password
  const { email: currentEmail, passwordHash: currentHash } = await getEffectiveCredentials();
  if (hashPassword(currentPassword) !== currentHash) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  // Validate new email if provided
  const trimmedEmail = newEmail?.trim();
  if (trimmedEmail !== undefined && trimmedEmail !== "") {
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }
  }

  // Validate new password if provided
  if (newPassword !== undefined && newPassword !== "") {
    if (newPassword.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
  }

  const emailToSave = (trimmedEmail && trimmedEmail !== "") ? trimmedEmail : currentEmail;
  const hashToSave = (newPassword && newPassword !== "") ? hashPassword(newPassword) : currentHash;

  // Replace any existing admin record with the updated credentials
  await db.delete(adminUsersTable);
  await db.insert(adminUsersTable).values({
    email: emailToSave,
    passwordHash: hashToSave,
  });

  res.json({ ok: true, email: emailToSave });
});

export default router;
