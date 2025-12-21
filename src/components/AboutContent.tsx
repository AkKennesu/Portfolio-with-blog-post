"use client"

import { motion, Target, VariantLabels } from "framer-motion"

interface AboutContentProps {
    children: React.ReactNode
    initial: Target | VariantLabels
    delay: number
    className?: string
}

export default function AboutContent({ children, initial, delay, className }: AboutContentProps) {
    return (
        <motion.div
            initial={initial}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            viewport={{ once: true }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
