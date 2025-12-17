"use client"

import { useState, useEffect } from "react"

export function useActiveSection(initialSection = "/") {
    const [activeSection, setActiveSection] = useState(initialSection)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY < 100) {
                setActiveSection("/")
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id
                        if (id === "hero") {
                            setActiveSection("/")
                        } else {
                            setActiveSection(`/#${id}`)
                        }
                    }
                })
            },
            { threshold: 0, rootMargin: "-50% 0px -50% 0px" }
        )

        const sections = document.querySelectorAll("section[id], div[id='hero']")
        sections.forEach((section) => observer.observe(section))

        return () => sections.forEach((section) => observer.unobserve(section))
    }, [])

    return activeSection
}
