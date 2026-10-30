"use client"

import { motion } from "framer-motion"
import { ArrowRight, Mail, Download } from "lucide-react"
import { EncryptButton } from "@/components/EncryptButton"
import { scrollToSection } from "@/lib/utils"
import type { SettingsMap } from "@/actions/settings"

interface HeroProps {
    settings?: SettingsMap
}

export function Hero({ settings }: HeroProps) {
    const cvHref = settings?.cv_file || "/cv.pdf"

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
                    <h1 className="text-4xl font-normal tracking-tight sm:text-6xl md:text-7xl">
                        <span>Building digital products that </span>
                        <span className="text-primary block sm:inline font-bold">matter.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                        QA Engineer &amp; Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <EncryptButton
                            href="#projects"
                            onClick={(e) => scrollToSection(e, "/#projects")}
                            targetText="View Work"
                            icon={ArrowRight}
                            className="h-12 border-primary/50 text-primary hover:text-primary hover:border-primary bg-primary/10"
                        />
                        <EncryptButton
                            href="#contact"
                            onClick={(e) => scrollToSection(e, "/#contact")}
                            targetText="Contact Me"
                            icon={Mail}
                            className="h-12 border-input hover:border-primary"
                        />
                        <a
                            href={cvHref}
                            download="Arn_Kenneth_CV"
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
