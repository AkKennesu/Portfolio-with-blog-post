"use client"

import { useState, useEffect } from "react"

export function useScroll(threshold = 20) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        let rafId: number | null = null

        const handleScroll = () => {
            if (rafId !== null) return
            rafId = requestAnimationFrame(() => {
                rafId = null
                const isOver = window.scrollY > threshold
                setScrolled((prev) => (prev !== isOver ? isOver : prev))
            })
        }

        // Set initial state
        handleScroll()

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", handleScroll)
            if (rafId !== null) cancelAnimationFrame(rafId)
        }
    }, [threshold])

    return scrolled
}
