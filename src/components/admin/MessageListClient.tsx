"use client"

import { useState } from "react"
import { type Message } from "@/actions/messages"
import { deleteMessages } from "@/actions/messages"
import { MessageItem } from "./MessageItem"
import { BatchDeleteToolbar } from "./BatchDeleteToolbar"
import { CheckSquare, Square, Inbox } from "lucide-react"

export default function MessageListClient({ messages }: { messages: Message[] }) {
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    const toggleSelectAll = () => {
        if (selectedIds.length === messages.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(messages.map(m => m.id).filter(Boolean))
        }
    }

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleBatchDelete = async () => {
        const result = await deleteMessages(selectedIds)
        if (result.success) {
            setSelectedIds([])
            window.location.reload()
        }
    }

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                    When someone contacts you through the website, their message will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center gap-4">
                    <button
                        onClick={toggleSelectAll}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                        {selectedIds.length > 0 && selectedIds.length === messages.length ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                            <Square className="h-4 w-4" />
                        )}
                        Select All
                    </button>
                    {selectedIds.length > 0 && (
                        <span className="text-xs font-medium text-muted-foreground bg-primary/10 px-2 py-0.5 rounded text-primary">
                            {selectedIds.length} Selected
                        </span>
                    )}
                </div>
                <div className="divide-y divide-border">
                    {messages.map((message) => (
                        <div key={message.id} className="relative flex items-center group">
                            <div className="pl-6 py-4 absolute left-0 z-10 pointer-events-none group-hover:pointer-events-auto">
                                <button
                                    onClick={() => toggleSelect(message.id)}
                                    className={`transition-colors p-1 rounded hover:bg-muted ${selectedIds.includes(message.id) ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                                        }`}
                                >
                                    {selectedIds.includes(message.id) ? (
                                        <CheckSquare className="h-5 w-5" />
                                    ) : (
                                        <Square className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <div className={`w-full transition-all ${selectedIds.includes(message.id) ? "pl-16 bg-primary/5" : "pl-0"}`}>
                                <MessageItem message={message} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <BatchDeleteToolbar
                selectedCount={selectedIds.length}
                onDelete={handleBatchDelete}
                onClear={() => setSelectedIds([])}
                itemName="messages"
            />
        </div>
    )
}
