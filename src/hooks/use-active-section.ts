"use client"

import { useState, useEffect } from "react"

export function useActiveSection(initialSection = "/") {
    const [activeSection, setActiveSection] = useState(initialSection)

    useEffect(() => {
        let ticking = false

        // Quick scroll boundary check for top and bottom of the page
        const handleScroll = () => {
            const scrollY = window.scrollY
            if (scrollY < 80) {
                setActiveSection((prev) => (prev !== "/" ? "/" : prev))
            } else if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 60) {
                setActiveSection((prev) => (prev !== "/#contact" ? "/#contact" : prev))
            }
        }

        const onScrollThrottled = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll()
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener("scroll", onScrollThrottled, { passive: true })

        // Efficient IntersectionObserver: Zero forced layout reflows on scroll
        const sections = document.querySelectorAll("section[id], div[id='hero']")
        if (sections.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (window.scrollY < 80) return

                // Pick the visible intersecting entry with the highest intersection ratio
                const intersecting = entries.filter((e) => e.isIntersecting)
                if (intersecting.length > 0) {
                    const best = intersecting.reduce((prev, curr) =>
                        curr.intersectionRatio > prev.intersectionRatio ? curr : prev
                    )
                    const id = best.target.id
                    if (id) {
                        const newActive = id === "hero" ? "/" : `/#${id}`
                        setActiveSection((prev) => (prev !== newActive ? newActive : prev))
                    }
                }
            },
            {
                rootMargin: "-20% 0px -40% 0px",
                threshold: [0, 0.2, 0.5, 0.8, 1],
            }
        )

        sections.forEach((sec) => observer.observe(sec))

        return () => {
            observer.disconnect()
            window.removeEventListener("scroll", onScrollThrottled)
        }
    }, [])

    return activeSection
}
