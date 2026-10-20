"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { usePathname } from "next/navigation"

export function ScrollProgress() {
    const pathname = usePathname()
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    if (pathname?.startsWith("/admin")) {
        return null
    }

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
            style={{ scaleX }}
        />
    )
}
