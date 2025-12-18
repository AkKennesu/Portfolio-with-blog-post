"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const SECRET_KEY = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "fallback-secret-key-change-it")
const SESSION_DURATION = 60 * 60 * 24 // 24 hours

export type AdminState = {
    error?: string
    success?: boolean
}

export async function login(prevState: AdminState, formData: FormData): Promise<AdminState> {
    const password = formData.get("password") as string
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
        return { error: "Admin password not configured in environment" }
    }

    if (password !== adminPassword) {
        return { error: "Invalid password" }
    }

    // Create session
    const expires = new Date(Date.now() + SESSION_DURATION * 1000)
    const session = await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(SECRET_KEY)

    const cookieStore = await cookies()
    cookieStore.set("admin_session", session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    })

    redirect("/admin/dashboard")
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")
    redirect("/admin/login")
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")?.value
    if (!session) return null

    try {
        const { payload } = await jwtVerify(session, SECRET_KEY, {
            algorithms: ["HS256"],
        })
        return payload
    } catch {
        return null
    }
}

export async function migrateData() {
    const { posts } = await import("@/lib/blog")
    const { achievementItems } = await import("@/lib/data")

    // Migrate Blog Posts
    for (const post of posts) {
        await sql`
            INSERT INTO blog_posts (slug, title, excerpt, date, content)
            VALUES (${post.slug}, ${post.title}, ${post.excerpt}, ${post.date}, ${post.content})
            ON CONFLICT (slug) DO NOTHING
        `
    }

    // Migrate Certificates
    for (const cert of achievementItems) {
        // Simple duplicate check for certificates (by title and year)
        const { rows: existsRows } = await sql`
            SELECT id FROM certificates 
            WHERE title = ${cert.title} AND year = ${cert.year}
        `
        if (existsRows.length === 0) {
            await sql`
                INSERT INTO certificates (year, title, subtitle, description, image)
                VALUES (${cert.year}, ${cert.title}, ${cert.subtitle}, ${cert.description}, ${cert.image})
            `
        }
    }

    revalidatePath("/admin/dashboard")
    redirect("/admin/dashboard")
}
export async function initializeDatabase() {
    const { initDb } = await import("@/lib/db")
    await initDb()
    revalidatePath("/admin/dashboard")
}
