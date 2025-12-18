import { getPost } from "@/lib/blog"
import { getSession } from "@/actions/admin"
import { redirect, notFound } from "next/navigation"
import { BlogForm } from "@/components/admin/BlogForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditBlogPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const session = await getSession()
    if (!session) redirect("/admin/login")

    const { slug } = await params
    const post = await getPost(slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link
                    href="/admin/blog"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog List
                </Link>
                <h1 className="text-3xl font-bold">Edit Post</h1>
                <p className="text-muted-foreground mt-1">Editing: {post.title}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
                <BlogForm post={post} />
            </div>
        </div>
    )
}
