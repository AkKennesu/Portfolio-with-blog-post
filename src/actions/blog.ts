"use server"

import { dbQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const blogSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Invalid slug format"),
    excerpt: z.string().min(1, "Excerpt is required"),
    date: z.string().min(1, "Date is required"),
    content: z.string().min(1, "Content is required"),
})

export async function createPost(formData: FormData) {
    const rawData = {
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        excerpt: formData.get("excerpt") as string,
        date: formData.get("date") as string,
        content: formData.get("content") as string,
    }

    const validated = blogSchema.parse(rawData)

    await dbQuery`
        INSERT INTO blog_posts (title, slug, excerpt, date, content)
        VALUES (${validated.title}, ${validated.slug}, ${validated.excerpt}, ${validated.date}, ${validated.content})
    `

    revalidatePath("/blog")
    revalidatePath("/admin/blog")
    redirect("/admin/blog")
}

export async function updatePost(id: number, formData: FormData) {
    const rawData = {
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        excerpt: formData.get("excerpt") as string,
        date: formData.get("date") as string,
        content: formData.get("content") as string,
    }

    const validated = blogSchema.parse(rawData)

    await dbQuery`
        UPDATE blog_posts
        SET title = ${validated.title}, slug = ${validated.slug}, excerpt = ${validated.excerpt}, date = ${validated.date}, content = ${validated.content}
        WHERE id = ${id}
    `

    revalidatePath("/blog")
    revalidatePath(`/blog/${validated.slug}`)
    revalidatePath("/admin/blog")
    redirect("/admin/blog")
}

export async function deletePost(id: number) {
    await dbQuery`DELETE FROM blog_posts WHERE id = ${id}`
    revalidatePath("/blog")
    revalidatePath("/admin/blog")
}
