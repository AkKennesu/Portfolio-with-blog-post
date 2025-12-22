"use client"

import { useState } from "react"
import { Trash2, X, Loader2, AlertCircle } from "lucide-react"

interface BatchDeleteToolbarProps {
    selectedCount: number
    onDelete: () => Promise<void>
    onClear: () => void
    itemName?: string
}

export function BatchDeleteToolbar({ selectedCount, onDelete, onClear, itemName = "items" }: BatchDeleteToolbarProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    if (selectedCount === 0) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await onDelete()
            setIsConfirming(false)
            // Re-syncing is handled by the parent components (usually window.location.reload() or revalidatePath)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-background border border-border shadow-2xl rounded-2xl flex items-center gap-4 px-6 py-4 min-w-[300px] border-primary/20 bg-background/80 backdrop-blur-xl">
                <div className="flex items-center gap-3 pr-4 border-r border-border">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {selectedCount === 1 ? itemName.replace(/s$/, '') : itemName} selected
                    </span>
                </div>

                {!isConfirming ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClear}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            title="Clear Selection"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsConfirming(true)}
                            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-destructive mr-2">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase">Are you sure?</span>
                        </div>
                        <button
                            disabled={isDeleting}
                            onClick={() => setIsConfirming(false)}
                            className="text-muted-foreground text-xs font-bold uppercase hover:underline disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Yes, Purge
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
