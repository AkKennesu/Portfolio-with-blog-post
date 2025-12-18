import { getPosts } from "@/lib/blog"
import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"
import { deletePost } from "@/actions/blog"

export default async function AdminBlogListPage() {
    const session = await getSession()
    if (!session) redirect("/admin/login")

    const posts = await getPosts()

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
                <Link
                    href="/admin/blog/new"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Post
                </Link>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 font-semibold text-sm">Title</th>
                            <th className="px-6 py-4 font-semibold text-sm">Date</th>
                            <th className="px-6 py-4 font-semibold text-sm">Slug</th>
                            <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {posts.map((post) => (
                            <tr key={post.slug} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium">{post.title}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{post.date}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{post.slug}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/blog/edit/${post.slug}`}
                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <form action={deletePost.bind(null, post.id!)}>
                                            <button
                                                type="submit"
                                                onClick={(e) => {
                                                    if (!confirm("Are you sure you want to delete this post?")) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
