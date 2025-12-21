import { unstable_noStore as noStore } from "next/cache"
import { getPosts } from "@/lib/blog"
import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Edit, Database } from "lucide-react"
import { deletePost } from "@/actions/blog"
import { checkTablesExist } from "@/lib/db"
import DeleteButton from "@/components/admin/DeleteButton"

export default async function AdminBlogListPage() {
    noStore()
    const session = await getSession()
    if (!session) redirect("/admin/login")

    const tablesExist = await checkTablesExist()

    if (!tablesExist) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center mt-12">
                <div className="bg-amber-500/10 p-12 rounded-2xl border border-amber-500/20 flex flex-col items-center gap-6">
                    <Database className="h-12 w-12 text-amber-500" />
                    <h2 className="text-2xl font-bold">Database Not Initialized</h2>
                    <p className="text-muted-foreground">
                        Your database tables haven&apos;t been created yet. Please go to the dashboard to initialize your database.
                    </p>
                    <Link
                        href="/admin/dashboard"
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

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
                                        <DeleteButton
                                            action={deletePost}
                                            id={post.id!}
                                            confirmMessage={`Are you sure you want to delete "${post.title}"?`}
                                        />
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
