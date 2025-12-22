"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useActiveSection } from "@/hooks/use-active-section"
import { navItems } from "@/lib/data"
import { cn } from "@/lib/utils"
import { SettingsMap } from "@/actions/settings"

export const MobileNav = ({ settings }: { settings?: SettingsMap }) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center md:hidden px-4 pointer-events-none">
            <SlideTabs />
        </div>
    )
}

const SlideTabs = () => {
    const activeSection = useActiveSection()
    const [position, setPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    })
    const tabsRef = useRef<(HTMLLIElement | null)[]>([])

    useEffect(() => {
        // Find the index of the active section
        const activeIndex = navItems.findIndex((item) => item.href === activeSection)

        // If active section is found and ref exists, update position
        if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
            const currentTab = tabsRef.current[activeIndex]
            setPosition({
                left: currentTab.offsetLeft,
                width: currentTab.getBoundingClientRect().width,
                opacity: 1,
            })
        }
    }, [activeSection])

    return (
        <ul
            className="pointer-events-auto relative flex w-fit items-center rounded-full border border-primary/20 bg-background/80 p-1 shadow-lg backdrop-blur-md overflow-x-auto no-scrollbar max-w-full"
        >
            {navItems.map((item, index) => (
                <Tab
                    key={item.href}
                    item={item}
                    ref={(el) => { tabsRef.current[index] = el }}
                    isActive={activeSection === item.href}
                />
            ))}

            <Cursor position={position} />
        </ul>
    )
}

const Tab = React.forwardRef<
    HTMLLIElement,
    { item: typeof navItems[0]; isActive: boolean }
>(({ item, isActive }, ref) => {
    const Icon = item.icon
    return (
        <li
            ref={ref}
            className={cn(
                "relative z-10 block cursor-pointer px-4 py-3 transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Link href={item.href} className="block w-full h-full">
                <Icon className="h-5 w-5" />
                <span className="sr-only">{item.name}</span>
            </Link>
        </li>
    )
})

Tab.displayName = "Tab"

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
    return (
        <motion.li
            animate={{
                ...position,
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
            }}
            className="absolute z-0 h-7 rounded-full bg-primary"
        />
    )
}
