"use server"

import { dbQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "./admin"

export type SettingsMap = {
    about_me_1: string
    about_me_2: string
    primary_color: string
    social_github: string
    social_linkedin: string
    social_twitter: string
    social_facebook: string
    social_email: string
    custom_social_links: string // JSON representation of { label: string, url: string, icon: string }[]
}

async function checkAuth() {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
}

export async function getSettings(): Promise<SettingsMap> {
    const defaults: SettingsMap = {
        about_me_1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non neque est. Sed vel pretium massa. Donec eget nibh a magna feugiat rutrum.",
        about_me_2: "Vivamus at dui mollis, finibus justo vitae, accumsan nullam. Phasellus vestibulum hendrerit ex, ut ullamcorper arcu finibus a. Fusce et nibh quist.",
        primary_color: "#3b82f6", // Default blue-500
        social_github: "#",
        social_linkedin: "#",
        social_twitter: "#",
        social_facebook: "#",
        social_email: "hello@example.com",
        custom_social_links: "[]"
    }

    try {
        const { rows } = await dbQuery`SELECT key, value FROM site_settings`
        if (rows.length === 0) return defaults

        const settings = { ...defaults }

        const dbRows = rows as unknown as { key: string; value: string }[]
        dbRows.forEach((row) => {
            const key = row.key as keyof SettingsMap
            if (key in settings) {
                settings[key] = row.value
            }
        })

        return settings
    } catch (error) {
        console.error("Failed to fetch settings:", error)
        return defaults
    }
}

export async function updateSettings(formData: FormData) {
    try {
        await checkAuth()

        const settingsToUpdate = [
            "about_me_1",
            "about_me_2",
            "primary_color",
            "social_github",
            "social_linkedin",
            "social_twitter",
            "social_facebook",
            "social_email",
            "custom_social_links"
        ]

        for (const key of settingsToUpdate) {
            const value = formData.get(key) as string
            if (value !== null) {
                await dbQuery`
                    INSERT INTO site_settings (key, value)
                    VALUES (${key}, ${value})
                    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
                `
            }
        }

        revalidatePath("/", "layout")
        revalidatePath("/admin/settings")
        console.log("Settings updated successfully for keys:", settingsToUpdate)
        return { success: true }
    } catch (error) {
        console.error("Failed to update settings:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to update settings" }
    }
}
