import { getSession, migrateData, initializeDatabase } from "@/actions/admin"
import { redirect } from "next/navigation"
import { dbQuery } from "@/lib/db"
import { FileText, Award, MessageSquare, Database, RefreshCw } from "lucide-react"

export default async function AdminDashboardPage() {
    const session = await getSession()
    if (!session) redirect("/admin/login")

    // Get stats
    let blogCount = 0
    let certCount = 0

    try {
        if (process.env.POSTGRES_URL) {
            const { rows: blogRows } = await dbQuery`SELECT count(*) FROM blog_posts`
            const { rows: certRows } = await dbQuery`SELECT count(*) FROM certificates`

            blogCount = Number(blogRows[0].count)
            certCount = Number(certRows[0].count)
        }
    } catch {
        // Tables might not exist yet if not initialized
    }

    const stats = [
        { name: "Total Blog Posts", value: blogCount, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
        { name: "Total Certificates", value: certCount, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
        { name: "Contact Requests", value: "Active", icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10" },
    ]

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-lg`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-6">
                <div className="p-8 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                        <Database className="h-6 w-6" />
                        <h2 className="text-xl font-semibold">Database Setup</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Initialize the database tables for the first time.
                    </p>
                    <form action={initializeDatabase}>
                        <button type="submit" className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            Initialize Tables
                        </button>
                    </form>
                </div>

                <div className="p-8 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-amber-500">
                        <RefreshCw className="h-6 w-6" />
                        <h2 className="text-xl font-semibold">Migrate Data</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Sync your existing hardcoded blog posts and certificates to the database.
                    </p>
                    <form action={migrateData}>
                        <button type="submit" className="w-full border border-amber-500/20 text-amber-600 hover:bg-amber-500/5 px-4 py-2 rounded-lg font-medium transition-colors">
                            Sync with Static Data
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
