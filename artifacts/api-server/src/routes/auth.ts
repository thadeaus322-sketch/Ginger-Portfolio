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
import { logger } from "../lib/logger.js";

const router = Router();

type EffectiveCredentials = {
  email: string;
  passwordHash: string;
  usingDefaults: boolean;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const shouldUseEnvironmentCredentials =
  process.env.AUTH_CREDENTIALS_SOURCE?.trim().toLowerCase() === "env";

// ─── Helpers: resolve effective credentials ────────────────────────────────────
//
// Database credentials remain the normal source after an admin changes them.
// AUTH_CREDENTIALS_SOURCE=env is an intentional recovery switch for a host
// where the admin row is stale or the admin_users table is unavailable.
async function getEffectiveCredentials(): Promise<EffectiveCredentials> {
  if (shouldUseEnvironmentCredentials) {
    return { email: ADMIN_EMAIL, passwordHash: ADMIN_PASSWORD_HASH, usingDefaults: true };
  }

  try {
    const [row] = await db.select().from(adminUsersTable).limit(1);
    if (row) {
      return { email: row.email, passwordHash: row.passwordHash, usingDefaults: false };
    }
  } catch (error) {
    // Keep login available during a database/schema outage, but leave a useful
    // server-side diagnostic instead of silently hiding the root cause.
    logger.warn(
      { error: error instanceof Error ? error.message : "Unknown database error" },
      "Admin credential lookup failed; using environment credentials",
    );
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

  if (
    normalizeEmail(email) !== normalizeEmail(effectiveEmail) ||
    hashPassword(password) !== effectiveHash
  ) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken(effectiveEmail);
  // Use HTTPS-aware check: secure cookies only when the connection is actually
  // over HTTPS (works correctly behind Nginx/cPanel reverse proxies too).
  const isHttps =
    req.secure ||
    req.headers["x-forwarded-proto"] === "https" ||
    (req.headers["x-forwarded-proto"] as string)?.split(",")[0].trim() === "https";

  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ id: 1, email: effectiveEmail });
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
