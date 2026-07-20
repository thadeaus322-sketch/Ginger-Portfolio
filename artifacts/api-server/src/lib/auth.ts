import { createHmac, timingSafeEqual, randomBytes, createHash } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "ginger-dev-secret-change-in-prod";

interface TokenPayload {
  email: string;
  iat: number;
}

export function signToken(email: string): string {
  const payload: TokenPayload = { email, iat: Date.now() };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const data = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
    // Pad buffers to same length for timingSafeEqual
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export function generateAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@gingerstudios.com";
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? hashPassword(process.env.ADMIN_PASSWORD ?? "GingerStudios2026!");

export const TOKEN_COOKIE = "gvs_auth";
