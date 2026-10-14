"use client"

import { useState, useEffect } from "react"

export function useActiveSection(initialSection = "/") {
    const [activeSection, setActiveSection] = useState(initialSection)

    useEffect(() => {
        const updateActiveSection = () => {
            const scrollY = window.scrollY
            if (scrollY < 80) {
                setActiveSection("/")
                return
            }

            // If scrolled to bottom of page, activate last item (contact)
            if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50) {
                setActiveSection("/#contact")
                return
            }

            const sections = Array.from(document.querySelectorAll("section[id], div[id='hero']")) as HTMLElement[]
            // Find the section that occupies the viewport focal line (around top 35% of viewport)
            const focalPoint = scrollY + window.innerHeight * 0.35

            let currentId = ""
            for (const section of sections) {
                const top = section.offsetTop
                const height = section.offsetHeight
                if (focalPoint >= top && focalPoint < top + height) {
                    currentId = section.id
                    break
                }
            }

            if (currentId) {
                setActiveSection(currentId === "hero" ? "/" : `/#${currentId}`)
            }
        }

        window.addEventListener("scroll", updateActiveSection, { passive: true })
        window.addEventListener("resize", updateActiveSection, { passive: true })
        // Initial run
        updateActiveSection()

        return () => {
            window.removeEventListener("scroll", updateActiveSection)
            window.removeEventListener("resize", updateActiveSection)
        }
    }, [])

    return activeSection
}
