"use server"

import { dbQuery } from "@/lib/db"
import { z } from "zod"

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
})

export type ContactState = {
    success?: boolean
    error?: string
    fields?: Record<string, string>
}

export async function submitContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
    const rawData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        message: formData.get("message") as string,
    }

    // Validate data
    const validated = contactSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            error: "Validation failed. Please check your inputs.",
            fields: rawData,
        }
    }

    try {
        // Save to Database
        await dbQuery`
            INSERT INTO messages (name, email, message)
            VALUES (${validated.data.name}, ${validated.data.email}, ${validated.data.message})
        `

        // Artificial delay to show loading state (optional but nice for UX)
        await new Promise((resolve) => setTimeout(resolve, 800))

        return {
            success: true,
        }
    } catch (error) {
        console.error("Error saving contact message:", error)
        return {
            error: "Failed to send message. Please try again later.",
            fields: rawData,
        }
    }
}
