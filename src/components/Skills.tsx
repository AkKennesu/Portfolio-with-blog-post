"use client"

import { motion } from "framer-motion"
import {
    SiNextdotjs, SiJavascript, SiReact, SiTypescript,
    SiPostgresql, SiFirebase, SiFramer, SiFigma, SiGit,
    SiPython, SiExpo, SiTailwindcss, SiUnity, SiFastapi
} from "react-icons/si"
import { FaJava } from "react-icons/fa"

import { useState, useRef, useEffect } from "react"

const skills = [
    { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
    { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
    { name: "React", icon: SiReact, color: "#61DAFB" },
    { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    { name: "SQL", icon: SiPostgresql, color: "#4169E1" },
    { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    { name: "Framer Motion", icon: SiFramer, color: "#0055FF" },
    { name: "Figma", icon: SiFigma, color: "#F24E1E" },
    { name: "Git", icon: SiGit, color: "#F05032" },
    { name: "Python", icon: SiPython, color: "#3776AB" },
    { name: "Expo", icon: SiExpo, color: "#000020" },
    { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
    { name: "Unity", icon: SiUnity, color: "#000000" },
    { name: "Java", icon: FaJava, color: "#007396" },
    { name: "FastAPI", icon: SiFastapi, color: "#009688" }
]

export function Skills() {
    return (
        <section id="skills" className="py-24 sm:py-32 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Technical Skills</h2>
                    <p className="text-muted-foreground max-w-[800px]">
                        The technologies and tools I use to build modern digital products.
                    </p>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                    {skills.map((skill, index) => (
                        <SkillCard key={skill.name} skill={skill} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function SkillCard({ skill, index }: { skill: typeof skills[0], index: number }) {
    const [isFlipped, setIsFlipped] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleInteraction = () => {
        setIsFlipped((prev) => {
            const newState = !prev

            // Clear existing timer
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }

            // If flipping to back (true), set timer to auto-reset
            if (newState) {
                timeoutRef.current = setTimeout(() => {
                    setIsFlipped(false)
                }, 7000) // 7 seconds
            }

            return newState
        })
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <div
            className="h-20 w-full cursor-pointer"
            style={{ perspective: "1000px" }}
            onMouseEnter={handleInteraction}
        >
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                viewport={{ once: true }}
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full rounded-xl border border-border bg-card flex items-center justify-center shadow-sm"
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                    <span className="text-xs font-semibold">{skill.name}</span>
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 h-full w-full rounded-xl flex items-center justify-center shadow-md"
                    style={{
                        backgroundColor: skill.color,
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden"
                    }}
                >
                    <skill.icon className="w-8 h-8 text-white" />
                </div>
            </motion.div>
        </div>
    )
}
