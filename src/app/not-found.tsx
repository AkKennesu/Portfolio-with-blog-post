import Link from "next/link"
import { BookOpen, Home, Terminal } from "lucide-react"

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative">
            <div className="w-full max-w-xl text-center">
                {/* Frosted Cyberpunk Card */}
                <div className="relative rounded-3xl border border-primary/25 bg-card/75 backdrop-blur-xl p-8 sm:p-12 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono text-primary mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span>404 // NOT_FOUND</span>
                    </div>

                    {/* Glitch / Big 404 typography */}
                    <div className="mb-4">
                        <span className="text-7xl sm:text-8xl font-black tracking-tighter bg-linear-to-b from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent select-none">
                            404
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">
                        Transmission Lost
                    </h1>

                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                        The requested article, page, or coordinate cannot be located. It may have been relocated, archived, or the link might be misspelled.
                    </p>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/blog"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Browse Journal</span>
                        </Link>
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-background/60 hover:bg-background/90 text-foreground font-medium text-sm transition-all duration-200 hover:border-primary/40"
                        >
                            <Home className="w-4 h-4" />
                            <span>Return to Home</span>
                        </Link>
                    </div>

                    {/* Terminal hint footer */}
                    <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground/70">
                        <Terminal className="w-3.5 h-3.5 text-primary" />
                        <span>err_code: ERR_RESOURCE_DISCONNECTED</span>
                    </div>
                </div>
            </div>
        </main>
    )
}
