import { unstable_noStore as noStore } from "next/cache"
import { getMessages } from "@/actions/messages"
import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"
import { Mail, Database } from "lucide-react"
import MessageListClient from "@/components/admin/MessageListClient"
import { checkTablesExist } from "@/lib/db"
import Link from "next/link"

export default async function AdminMessagesPage() {
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
                        Your messaging table hasn&apos;t been created yet. Please go to the dashboard to initialize your database.
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

    const messages = await getMessages()
    const unreadCount = messages.filter(m => !m.is_read).length

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                        <Mail className="h-8 w-8 text-primary" />
                        Messages
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <MessageListClient messages={messages} />
        </div>
    )
}
