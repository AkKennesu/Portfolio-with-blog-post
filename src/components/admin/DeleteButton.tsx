"use client"

import { Trash2, Loader2 } from "lucide-react"
import { useTransition } from "react"

interface ActionResult {
    success: boolean
    error?: string
}

interface DeleteButtonProps {
    action: (id: number) => Promise<ActionResult | void>
    id: number
    confirmMessage?: string
}

export default function DeleteButton({
    action,
    id,
    confirmMessage = "Are you sure you want to delete this item?"
}: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!confirm(confirmMessage)) return

        startTransition(async () => {
            const result = await action(id) as ActionResult
            if (result?.success) {
                window.location.reload()
            } else {
                alert(result?.error || "Failed to delete item")
            }
        })
    }

    return (
        <form onSubmit={handleDelete}>
            <button
                type="submit"
                disabled={isPending}
                className={`p-2 transition-colors ${isPending ? 'text-muted-foreground' : 'text-muted-foreground hover:text-destructive'}`}
                aria-label="Delete"
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Trash2 className="h-4 w-4" />
                )}
            </button>
        </form>
    )
}
