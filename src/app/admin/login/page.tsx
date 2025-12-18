"use client"

import { useActionState } from "react"
import { login, type AdminState } from "@/actions/admin"
import { motion } from "framer-motion"
import { Lock, LogIn } from "lucide-react"

const initialState: AdminState = {}

export default function AdminLoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center px-4 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl"
            >
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">Admin Access</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your administrative password to continue
                    </p>
                </div>

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>

                    {state.error && (
                        <p className="text-sm font-medium text-destructive">{state.error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isPending ? "Validating..." : "Login"}
                        {!isPending && <LogIn className="ml-2 h-4 w-4" />}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
