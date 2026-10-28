"use client"

import { memo } from "react"
import { motion, type Variants } from "framer-motion"
import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface SocialLinkProps {
    href: string
    icon: LucideIcon
    color: string
    label: string
}

const backgroundVariants: Variants = {
    initial: { y: "100%" },
    hover: { y: 0 },
}

const iconVariants: Variants = {
    initial: { rotate: 0, color: "var(--foreground)" },
    hover: { rotate: 360, color: "#ffffff" },
}

export const SocialLink = memo(function SocialLink({ href, icon: Icon, color, label }: SocialLinkProps) {
    return (
        <Link href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
            <motion.div
                className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-muted-foreground/20 bg-background transition-colors"
                whileHover="hover"
                initial="initial"
                style={{ borderColor: "var(--border)" }}
            >
                {/* Sliding Background */}
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{ backgroundColor: color }}
                    variants={backgroundVariants}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                />

                {/* Icon */}
                <motion.div
                    className="relative z-10 text-foreground"
                    variants={iconVariants}
                    transition={{ duration: 0.4 }}
                >
                    <Icon className="h-6 w-6" />
                </motion.div>
            </motion.div>
        </Link>
    )
})
