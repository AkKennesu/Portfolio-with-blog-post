"use client"

import { useRef, useState } from "react"
import { Lock } from "lucide-react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const CYCLES_PER_LETTER = 2
const SHUFFLE_TIME = 50
const CHARS = "!@#$%^&*():{};|,.<>/?0123456789"

interface EncryptButtonProps extends HTMLMotionProps<"button"> {
    targetText: string
    icon?: React.ElementType
}

export const EncryptButton = ({
    targetText,
    icon: Icon = Lock,
    className,
    ...props
}: EncryptButtonProps) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const [text, setText] = useState(targetText)

    const scramble = () => {
        let pos = 0

        intervalRef.current = setInterval(() => {
            const scrambled = targetText
                .split("")
                .map((char, index) => {
                    if (pos / CYCLES_PER_LETTER > index) {
                        return char
                    }

                    const randomCharIndex = Math.floor(Math.random() * CHARS.length)
                    const randomChar = CHARS[randomCharIndex]

                    return randomChar
                })
                .join("")

            setText(scrambled)
            pos++

            if (pos >= targetText.length * CYCLES_PER_LETTER) {
                stopScramble()
            }
        }, SHUFFLE_TIME)
    }

    const stopScramble = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        setText(targetText)
    }

    return (
        <motion.button
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
            onMouseEnter={scramble}
            onMouseLeave={stopScramble}
            className={cn(
                "group relative flex items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-background px-8 py-3 font-mono font-medium uppercase text-foreground transition-colors hover:text-primary hover:border-primary",
                className
            )}
            {...props}
        >
            <div className="relative z-10 flex items-center justify-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{text}</span>
            </div>
            <motion.span
                initial={{ y: "100%" }}
                animate={{ y: "-100%" }}
                transition={{
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 1,
                    ease: "linear",
                }}
                className="duration-300 absolute inset-0 z-0 scale-125 bg-gradient-to-t from-primary/0 from-40% via-primary/10 to-primary/0 to-60% opacity-0 transition-opacity group-hover:opacity-100"
            />
        </motion.button>
    )
}
