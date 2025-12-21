"use client"

import { useState, useTransition } from "react"
import { toggleRead, toggleImportant, deleteMessage, type Message } from "@/actions/messages"
import { Star, CheckCircle2, Circle, Clock, Mail, User } from "lucide-react"
import DeleteButton from "@/components/admin/DeleteButton"

export function MessageItem({ message }: { message: Message }) {
    const [isPending, startTransition] = useTransition()
    const [isRead, setIsRead] = useState(message.is_read)
    const [isImportant, setIsImportant] = useState(message.is_important)

    const handleToggleRead = () => {
        const newStatus = !isRead
        setIsRead(newStatus)
        startTransition(() => toggleRead(message.id, newStatus))
    }

    const handleToggleImportant = () => {
        const newStatus = !isImportant
        setIsImportant(newStatus)
        startTransition(() => toggleImportant(message.id, newStatus))
    }

    return (
        <div className={`p-6 border-b border-border transition-colors ${!isRead ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {message.name}
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground italic">
                            <Mail className="h-3.5 w-3.5" />
                            {message.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(message.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="relative group">
                        <p className={`text-sm leading-relaxed ${!isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {message.message}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:self-start">
                    <button
                        onClick={handleToggleImportant}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition-all ${isImportant ? 'bg-amber-500/10 text-amber-500' : 'text-muted-foreground hover:bg-muted'}`}
                        title={isImportant ? "Mark as normal" : "Mark as important"}
                    >
                        <Star className={`h-4 w-4 ${isImportant ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={handleToggleRead}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition-all ${isRead ? 'text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                        title={isRead ? "Mark as unread" : "Mark as read"}
                    >
                        {isRead ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <Circle className="h-4 w-4" />
                        )}
                    </button>

                    <DeleteButton
                        action={deleteMessage}
                        id={message.id}
                        confirmMessage="Delete this message forever?"
                    />
                </div>
            </div>
        </div>
    )
}
