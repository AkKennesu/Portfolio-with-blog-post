"use client"

import { createPost, updatePost } from "@/actions/blog"
import { type Post } from "@/lib/blog"
import { Save } from "lucide-react"
import Link from "next/link"

export function BlogForm({ post }: { post?: Post }) {

    // Determine which action to use
    const action = post?.id
        ? updatePost.bind(null, post.id)
        : createPost

    // Note: useActionState with bind might need careful handling
    // For simplicity I'll use a wrapper if needed or just handle it inside

    return (
        <form action={action} className="space-y-6 max-w-4xl">
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <input
                        id="title"
                        name="title"
                        required
                        defaultValue={post?.title}
                        placeholder="My Awesome Blog Post"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="slug" className="text-sm font-medium">Slug (URL identifier)</label>
                    <input
                        id="slug"
                        name="slug"
                        required
                        defaultValue={post?.slug}
                        placeholder="my-awesome-post"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="date" className="text-sm font-medium">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        defaultValue={post?.date || new Date().toISOString().split('T')[0]}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="excerpt" className="text-sm font-medium">Excerpt (Short summary)</label>
                    <textarea
                        id="excerpt"
                        name="excerpt"
                        required
                        defaultValue={post?.excerpt}
                        placeholder="Learn how to build amazing things..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="content" className="text-sm font-medium">Content (HTML allowed)</label>
                    <textarea
                        id="content"
                        name="content"
                        required
                        defaultValue={post?.content}
                        placeholder="<p>Start writing here...</p>"
                        className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Link
                    href="/admin/blog"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {post ? "Update Post" : "Create Post"}
                </button>
            </div>
        </form>
    )
}
