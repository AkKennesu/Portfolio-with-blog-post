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
    const heroTitle = settings?.hero_title ?? "Building digital products that"
    const heroHighlight = settings?.hero_highlight ?? "matter."
    const heroDescription =
        settings?.hero_description ??
        "QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship."

    const hasHighlight = Boolean(heroHighlight && heroHighlight.trim())
    const titleNeedsSpace = Boolean(heroTitle && !heroTitle.endsWith(" ") && hasHighlight)

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
                        <span>{heroTitle}{titleNeedsSpace ? " " : ""}</span>
                        {hasHighlight ? (
                            <span className="text-primary block sm:inline font-bold">{heroHighlight}</span>
                        ) : null}
                    </h1>
                    {heroDescription ? (
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                            {heroDescription}
                        </p>
                    ) : null}
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
