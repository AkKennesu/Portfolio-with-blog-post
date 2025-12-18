"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Mail, Download } from "lucide-react"
import { EncryptButton } from "@/components/EncryptButton"
import BubbleText from "./BubbleText"

export function Hero() {
    return (
        <div
            id="hero"
            className="group relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
        >
            <div className="relative z-10 mx-auto max-w-4xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="mb-4 inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                        Available for hire
                    </span>
                    <div className="text-4xl font-normal tracking-tight sm:text-6xl md:text-7xl">
                        <BubbleText text="Building digital products that" className="font-normal" />
                        <span className="text-primary block sm:inline font-bold">matter.</span>
                    </div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="#projects" tabIndex={-1}>
                            <EncryptButton
                                targetText="View Work"
                                icon={ArrowRight}
                                className="h-12 border-primary/50 text-primary hover:text-primary hover:border-primary bg-primary/10"
                            />
                        </Link>
                        <Link href="#contact" tabIndex={-1}>
                            <EncryptButton
                                targetText="Contact Me"
                                icon={Mail}
                                className="h-12 border-input hover:border-primary"
                            />
                        </Link>
                        <a
                            href="/cv.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex h-12 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-background px-8 font-mono font-medium uppercase text-foreground transition-colors hover:text-primary hover:border-primary md:hidden"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download CV</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
