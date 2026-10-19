import { cookies } from "next/headers";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { createHash, timingSafeEqual } from "crypto";
import { AuthError } from "./errors";

const RAW_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;

if (!RAW_SECRET && process.env.NODE_ENV === "production" && typeof window === "undefined" && !process.env.NEXT_PHASE) {
  console.warn("⚠️ Warning: JWT_SECRET or ADMIN_JWT_SECRET environment variable is not defined in production.");
}

const SECRET_KEY = new TextEncoder().encode(
  RAW_SECRET || "development-only-fallback-secret-key-32-chars-min"
);

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 24 hours

export interface AdminSessionPayload extends JWTPayload {
  role: "admin";
  username?: string;
}

/**
 * Creates a signed JWT for the admin session.
 */
export async function createAdminSessionToken(username = "admin"): Promise<string> {
  return await new SignJWT({ role: "admin", username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(SECRET_KEY);
}

/**
 * Verifies a given token string.
 */
export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin") return null;
    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current admin session from incoming cookies.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

/**
 * Enforces admin authentication. Throws AuthError if unauthenticated.
 */
export async function requireAdminAuth(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new AuthError("Unauthorized: Admin credentials or active session required.");
  }
  return session;
}

/**
 * Constant-time comparison between input password and admin password to prevent timing attacks.
 */
export function verifyAdminPassword(inputPassword: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !inputPassword) {
    return false;
  }

  const inputHash = createHash("sha256").update(inputPassword).digest();
  const targetHash = createHash("sha256").update(adminPassword).digest();

  return timingSafeEqual(inputHash, targetHash);
}
