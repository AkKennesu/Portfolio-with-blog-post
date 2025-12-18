"use server"

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

    // Simulate backend processing (Database call, Email service, etc.)
    console.log("Server-side processing contact submission:", validated.data)

    // Artificial delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would save to DB here:
    // await db.contactRequests.create({ data: validated.data })

    return {
        success: true,
    }
}
