"use client"

import { memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, scrollToSection } from "@/lib/utils"
import { Download } from "lucide-react"
import { navItems } from "@/lib/data"
import { useScroll } from "@/hooks/use-scroll"
import { useActiveSection } from "@/hooks/use-active-section"
import { SettingsMap } from "@/actions/settings"

export const Navbar = memo(function Navbar({ settings }: { settings?: SettingsMap }) {
    const pathname = usePathname()
    const scrolled = useScroll()
    const activeSection = useActiveSection()

    // Use uploaded CV if it exists, otherwise fallback to local asset
    const cvHref = settings?.cv_file || "/cv.pdf"
    const isBlogRoute = pathname?.startsWith("/blog")

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full border-b transition-all duration-300",
                scrolled
                    ? "border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
                    : "border-transparent bg-transparent"
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                            AK
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 items-center">
                    {navItems.map((item) => {
                        const active = isBlogRoute
                            ? item.href === "/#blog"
                            : activeSection === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href)}
                                className={cn(
                                    "nav-link-hover block px-4 py-2 text-sm font-medium transition-colors",
                                    active ? "text-primary font-semibold" : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        )
                    })}
                    <a
                        href={cvHref}
                        download="Arn_Kenneth_CV"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        )}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        CV
                    </a>
                </nav>

                {/* Mobile CV quick access */}
                <div className="flex items-center gap-2 md:hidden">
                    <a
                        href={cvHref}
                        download="Arn_Kenneth_CV"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-primary/30 px-3 text-xs font-medium text-foreground hover:text-primary transition-colors"
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        CV
                    </a>
                </div>
            </div>
        </header>
    )
})
