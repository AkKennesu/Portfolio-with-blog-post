"use client"

import { motion } from "framer-motion"

export function LiquidBackground() {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-background">
            {/* Animated Gradient Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary/30 blur-[100px] will-change-transform"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute -right-[10%] top-[20%] h-[600px] w-[600px] rounded-full bg-secondary/30 blur-[120px] will-change-transform"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 50, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5,
                }}
                className="absolute left-[20%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-primary/20 blur-[90px] will-change-transform"
            />

            {/* Noise Overlay for texture */}
            <div className="absolute inset-0 opacity-20 contrast-125 brightness-100 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>
    )
}
