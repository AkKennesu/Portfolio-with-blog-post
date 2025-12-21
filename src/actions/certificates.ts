"use server"

import { dbQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const certificateSchema = z.object({
    year: z.string().min(1, "Year is required"),
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    description: z.string().min(1, "Description is required"),
    image: z.string().min(1, "Image URL is required"),
})

export async function createCertificate(formData: FormData) {
    const rawData = {
        year: formData.get("year") as string,
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        description: formData.get("description") as string,
        image: formData.get("image") as string,
    }

    const validated = certificateSchema.parse(rawData)

    await dbQuery`
        INSERT INTO certificates (year, title, subtitle, description, image)
        VALUES (${validated.year}, ${validated.title}, ${validated.subtitle}, ${validated.description}, ${validated.image})
    `

    revalidatePath("/")
    revalidatePath("/admin/certificates")
    redirect("/admin/certificates")
}

export async function updateCertificate(id: number, formData: FormData) {
    const rawData = {
        year: formData.get("year") as string,
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        description: formData.get("description") as string,
        image: formData.get("image") as string,
    }

    const validated = certificateSchema.parse(rawData)

    await dbQuery`
        UPDATE certificates
        SET year = ${validated.year}, title = ${validated.title}, subtitle = ${validated.subtitle}, description = ${validated.description}, image = ${validated.image}
        WHERE id = ${id}
    `

    revalidatePath("/")
    revalidatePath("/admin/certificates")
    redirect("/admin/certificates")
}

export async function deleteCertificate(id: number) {
    try {
        await dbQuery`DELETE FROM certificates WHERE id = ${id}`
        revalidatePath("/")
        revalidatePath("/admin/certificates")
        revalidatePath("/admin", "layout")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete certificate:", error)
        return { success: false, error: "Deletion failed" }
    }
}
