"use client"

import { Trash2 } from "lucide-react"

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
    const handleDelete = async (e: React.FormEvent) => {
        if (!confirm(confirmMessage)) {
            e.preventDefault()
        }
    }

    return (
        <form action={() => action(id)} onSubmit={handleDelete}>
            <button
                type="submit"
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Delete"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </form>
    )
}
