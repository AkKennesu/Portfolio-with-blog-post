"use client"

import React, { useRef, useState, useEffect, memo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useActiveSection } from "@/hooks/use-active-section"
import { navItems } from "@/lib/data"
import { cn, scrollToSection } from "@/lib/utils"

export const MobileNav = memo(function MobileNav() {
    const [isVisible, setIsVisible] = useState(true)
    const lastScrollY = useRef(0)

    useEffect(() => {
        let rafId: number | null = null

        const handleScroll = () => {
            if (rafId !== null) return
            rafId = requestAnimationFrame(() => {
                rafId = null
                const currentScrollY = window.scrollY
                const diff = currentScrollY - lastScrollY.current

                // Always show near top
                if (currentScrollY < 60) {
                    setIsVisible((prev) => (prev ? prev : true))
                } else if (diff > 8) {
                    // Scrolling down -> hide navbar
                    setIsVisible((prev) => (!prev ? prev : false))
                } else if (diff < -8) {
                    // Scrolling up -> show navbar
                    setIsVisible((prev) => (prev ? prev : true))
                }

                lastScrollY.current = currentScrollY
            })
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", handleScroll)
            if (rafId !== null) cancelAnimationFrame(rafId)
        }
    }, [])

    return (
        <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{
                y: isVisible ? 0 : 80,
                opacity: isVisible ? 1 : 0,
            }}
            transition={{
                duration: 0.28,
                ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center md:hidden px-4 pointer-events-none"
        >
            <SlideTabs />
        </motion.div>
    )
})

const SlideTabs = memo(function SlideTabs() {
    const pathname = usePathname()
    const activeSection = useActiveSection()
    const isBlogRoute = pathname?.startsWith("/blog")
    const effectiveActive = isBlogRoute ? "/#blog" : activeSection

    const [position, setPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    })
    const navContainerRef = useRef<HTMLUListElement | null>(null)
    const tabsRef = useRef<(HTMLLIElement | null)[]>([])

    const updatePosition = React.useCallback(() => {
        const activeIndex = navItems.findIndex((item) => item.href === effectiveActive)

        if (activeIndex !== -1 && tabsRef.current[activeIndex] && navContainerRef.current) {
            const currentTab = tabsRef.current[activeIndex]
            const container = navContainerRef.current
            const tabRect = currentTab.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()

            // Calculate left position relative to scrollable container
            const relativeLeft = tabRect.left - containerRect.left + container.scrollLeft

            setPosition((prev) => {
                if (
                    prev.left === relativeLeft &&
                    prev.width === tabRect.width &&
                    prev.opacity === 1
                ) {
                    return prev
                }
                return {
                    left: relativeLeft,
                    width: tabRect.width,
                    opacity: 1,
                }
            })

            // Scroll container so the active tab is visible if overflowed
            currentTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
        }
    }, [effectiveActive])

    useEffect(() => {
        updatePosition()
        window.addEventListener("resize", updatePosition)
        return () => window.removeEventListener("resize", updatePosition)
    }, [updatePosition])

    return (
        <ul
            ref={navContainerRef}
            className="pointer-events-auto relative flex w-fit items-center rounded-full border border-primary/20 bg-background/80 p-0.5 shadow-lg backdrop-blur-md overflow-x-auto no-scrollbar max-w-full"
        >
            {navItems.map((item, index) => (
                <Tab
                    key={item.href}
                    item={item}
                    ref={(el) => { tabsRef.current[index] = el }}
                    isActive={effectiveActive === item.href}
                />
            ))}

            <Cursor position={position} />
        </ul>
    )
})

const Tab = memo(React.forwardRef<
    HTMLLIElement,
    { item: typeof navItems[0]; isActive: boolean }
>(({ item, isActive }, ref) => {
    const Icon = item.icon
    return (
        <li
            ref={ref}
            className={cn(
                "relative z-10 block cursor-pointer px-2.5 py-1.5 transition-colors shrink-0",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Link
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="flex items-center justify-center w-full h-full"
            >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{item.name}</span>
            </Link>
        </li>
    )
}))

Tab.displayName = "Tab"

const Cursor = memo(function Cursor({ position }: { position: { left: number; width: number; opacity: number } }) {
    return (
        <motion.li
            animate={{
                left: position.left,
                width: position.width,
                opacity: position.opacity,
            }}
            transition={{
                type: "spring",
                stiffness: 450,
                damping: 35
            }}
            className="absolute z-0 top-0.5 bottom-0.5 rounded-full bg-primary"
        />
    )
})
