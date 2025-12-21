"use server"

import { dbQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "./admin"

export type SettingsMap = {
    about_me_1: string
    about_me_2: string
    primary_color: string
}

async function checkAuth() {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
}

export async function getSettings(): Promise<SettingsMap> {
    const defaults: SettingsMap = {
        about_me_1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non neque est. Sed vel pretium massa. Donec eget nibh a magna feugiat rutrum.",
        about_me_2: "Vivamus at dui mollis, finibus justo vitae, accumsan nullam. Phasellus vestibulum hendrerit ex, ut ullamcorper arcu finibus a. Fusce et nibh quist.",
        primary_color: "#3b82f6" // Default blue-500
    }

    try {
        const { rows } = await dbQuery`SELECT key, value FROM site_settings`
        const settings = { ...defaults } as any

        rows.forEach((row: any) => {
            if (row.key in settings) {
                settings[row.key] = row.value
            }
        })

        return settings as SettingsMap
    } catch (error) {
        console.error("Failed to fetch settings:", error)
        return defaults
    }
}

export async function updateSettings(formData: FormData) {
    await checkAuth()

    const settingsToUpdate = [
        "about_me_1",
        "about_me_2",
        "primary_color"
    ]

    try {
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

        revalidatePath("/")
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}
