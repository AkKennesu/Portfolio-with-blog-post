"use client"

import { motion } from "framer-motion"

const timelineItems = [
    {
        year: "2024",
        title: "Bachelor of Science in Computer Science",
        subtitle: "University of Technology",
        description: "Graduated with honors. Specialized in Software Engineering and Artificial Intelligence."
    },
    {
        year: "2023",
        title: "Full Stack Development Bootcamp",
        subtitle: "Tech Academy",
        description: "Intensive 12-week program focused on modern web technologies including React, Node.js, and cloud architecture."
    },
    {
        year: "2022",
        title: "Best Innovation Award",
        subtitle: "Regional Hackathon 2022",
        description: "Won first prize for developing an accessible educational platform using AI for personalized learning."
    }
]

export function Timeline() {
    return (
        <section id="education" className="py-24 sm:py-32 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Education & Achievements</h2>
                    <p className="text-muted-foreground max-w-[800px]">
                        My academic journey and professional milestones.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {timelineItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-8 pb-12 last:pb-0 border-l border-border"
                        >
                            <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-1">
                                <span className="text-sm font-bold text-primary">{item.year}</span>
                                <h3 className="text-lg font-semibold">{item.title}</h3>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">{item.subtitle}</p>
                            <p className="text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
