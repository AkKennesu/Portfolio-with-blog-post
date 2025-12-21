import { unstable_noStore as noStore } from "next/cache"
import { getMessages } from "@/actions/messages"
import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"
import { Mail, Inbox, Database } from "lucide-react"
import { MessageItem } from "@/components/admin/MessageItem"
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
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Mail className="h-8 w-8 text-primary" />
                        Messages
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-12">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            When someone contacts you through the website, their message will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {messages.map((message) => (
                            <MessageItem key={message.id} message={message} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
