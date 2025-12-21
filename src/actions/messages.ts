"use server"

import { dbQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "./admin"

export type Message = {
    id: number
    name: string
    email: string
    message: string
    is_read: boolean
    is_important: boolean
    created_at: string
}

async function checkAuth() {
    const session = await getSession()
    if (!session) throw new Error("Unauthorized")
}

export async function getMessages(): Promise<Message[]> {
    await checkAuth()
    try {
        const { rows } = await dbQuery`
            SELECT * FROM messages 
            ORDER BY created_at DESC
        `
        return rows as unknown as Message[]
    } catch (error) {
        console.error("Failed to fetch messages:", error)
        return []
    }
}

export async function toggleRead(id: number, status: boolean) {
    await checkAuth()
    try {
        await dbQuery`
            UPDATE messages 
            SET is_read = ${status} 
            WHERE id = ${id}
        `
        revalidatePath("/admin/messages")
    } catch (error) {
        console.error("Failed to toggle read status:", error)
    }
}

export async function toggleImportant(id: number, status: boolean) {
    await checkAuth()
    try {
        await dbQuery`
            UPDATE messages 
            SET is_important = ${status} 
            WHERE id = ${id}
        `
        revalidatePath("/admin/messages")
    } catch (error) {
        console.error("Failed to toggle important status:", error)
    }
}

export async function deleteMessage(id: number) {
    await checkAuth()
    try {
        await dbQuery`
            DELETE FROM messages 
            WHERE id = ${id}
        `
        revalidatePath("/admin/messages")
        revalidatePath("/admin", "layout")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete message:", error)
        return { success: false, error: "Deletion failed" }
    }
}
