"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Download } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { navItems } from "@/lib/data"
import { useScroll } from "@/hooks/use-scroll"
import { useActiveSection } from "@/hooks/use-active-section"

export function Navbar() {
    const scrolled = useScroll()
    const activeSection = useActiveSection()

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full border-b transition-all duration-300",
                scrolled
                    ? "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                    : "border-transparent bg-transparent"
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            AK
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 items-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-link-hover block px-4 py-2 text-sm font-medium transition-colors",
                                activeSection === item.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <ModeToggle />
                    <a
                        href="/cv.pdf"
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

                {/* Mobile Mode Toggle (since menu is gone) */}
                <div className="flex items-center gap-2 md:hidden">
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}
