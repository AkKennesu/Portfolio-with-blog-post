"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createAdminSessionToken,
  getAdminSession,
  requireAdminAuth,
  verifyAdminPassword,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  type AdminSessionPayload,
} from "@/lib/auth";
import { CertificateRepository } from "@/repositories/certificate.repo";
import { dbQuery } from "@/lib/db";

export type AdminState = {
  error?: string;
  success?: boolean;
};

export async function login(prevState: AdminState, formData: FormData): Promise<AdminState> {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: "Admin authentication is not configured in server environment." };
  }

  // Constant-time hash verification to prevent timing attacks
  const isValid = verifyAdminPassword(password);
  if (!isValid) {
    return { error: "Invalid admin password. Access denied." };
  }

  const sessionToken = await createAdminSessionToken("admin");
  const expires = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/admin/dashboard");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}

export async function getSession(): Promise<AdminSessionPayload | null> {
  return await getAdminSession();
}

/**
 * Sync static portfolio items to database using atomic ON CONFLICT upserts.
 * Protected: requires active admin session.
 */
export async function migrateData(): Promise<void> {
  await requireAdminAuth();

  const { posts } = await import("@/lib/blog");
  const { achievementItems } = await import("@/lib/data");

  // Migrate Blog Posts atomically
  for (const post of posts) {
    await dbQuery`
      INSERT INTO blog_posts (slug, title, excerpt, date, content, cover_image)
      VALUES (${post.slug}, ${post.title}, ${post.excerpt}, ${post.date}::date, ${post.content}, ${post.cover_image ?? null})
      ON CONFLICT (slug) DO UPDATE
      SET cover_image = EXCLUDED.cover_image
      WHERE blog_posts.cover_image IS NULL
    `;
  }

  // Migrate Certificates using batch repository method
  await CertificateRepository.syncStaticCertificates(achievementItems);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/certificates");
  revalidatePath("/");
  redirect("/admin/dashboard");
}

/**
 * Initialize database tables, indexes, and RLS policies.
 * Protected: requires active admin session.
 */
export async function initializeDatabase(): Promise<void> {
  await requireAdminAuth();
  const { initDb } = await import("@/lib/db");
  await initDb();
  revalidatePath("/admin/dashboard");
}
