import { Request, Response, NextFunction } from "express";
import { verifyToken, TOKEN_COOKIE } from "../lib/auth.js";

export interface AuthedRequest extends Request {
  adminEmail?: string;
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[TOKEN_COOKIE] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  req.adminEmail = payload.email;
  next();
}
