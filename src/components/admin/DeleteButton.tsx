"use client"

import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface DeleteButtonProps {
    action: (id: number) => Promise<void>
    id: number
    confirmMessage?: string
}

export default function DeleteButton({
    action,
    id,
    confirmMessage = "Are you sure you want to delete this item?"
}: DeleteButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!confirm(confirmMessage)) return

        startTransition(async () => {
            await action(id)
            router.refresh()
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
