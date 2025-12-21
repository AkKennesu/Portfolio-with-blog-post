import { getSession } from "@/actions/admin"
import Link from "next/link"
import { LayoutDashboard, FileText, Award, ExternalLink, Mail } from "lucide-react"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    // Protected route check - if not on login/page, check session
    // This is handled by checking session in the root of the layout
    // unless the current path is /admin/login (handled by page itself if needed or handled here)

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar (only show if logged in) */}
            {session && (
                <aside className="w-64 border-r border-border bg-card p-6 hidden md:block">
                    <div className="flex items-center gap-2 mb-10 px-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl">Admin</span>
                    </div>

                    <nav className="space-y-2">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/messages"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <Mail className="h-4 w-4" />
                            Messages
                        </Link>
                        <Link
                            href="/admin/blog"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <FileText className="h-4 w-4" />
                            Blog Posts
                        </Link>
                        <Link
                            href="/admin/certificates"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <Award className="h-4 w-4" />
                            Certificates
                        </Link>
                        <hr className="my-4 border-border" />
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Site
                        </Link>
                        <form action="/api/auth/logout" method="POST">
                            {/* Note: I'll use a server action for logout instead in the UI later */}
                        </form>
                    </nav>
                </aside>
            )}

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
