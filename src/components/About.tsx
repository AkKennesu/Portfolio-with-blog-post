"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { motion } from "framer-motion"
import type { SettingsMap } from "@/actions/settings"

// Lazy-load the heavy WebGL / Three.js component
const ProfileTransition = dynamic(() => import("./ProfileTransition"), {
    ssr: false,
    loading: () => (
        <div className="relative aspect-square w-full h-full rounded-xl overflow-hidden bg-muted/20">
            <Image
                src="/profile.webp"
                alt="Profile"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover rounded-xl"
            />
        </div>
    ),
})

interface AboutProps {
    settings?: Partial<SettingsMap>
}

export function About({ settings }: AboutProps) {
    const aboutMe1 = settings?.about_me_1 || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non neque est. Sed vel pretium massa."
    const aboutMe2 = settings?.about_me_2 || "Vivamus at dui mollis, finibus justo vitae, accumsan nullam. Phasellus vestibulum hendrerit ex, ut ullamcorper arcu finibus a."

    return (
        <section id="about" className="py-24 sm:py-32 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-8 items-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.5, delay: 0 }}
                        viewport={{ once: true }}
                        className="relative aspect-square overflow-hidden rounded-xl bg-muted max-w-sm mx-auto w-full"
                    >
                        <ProfileTransition
                            image1="/profile.webp"
                            image2="/profile-hover.webp"
                            width={600}
                            height={600}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-6"
                    >
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">About Me</h2>
                        <p className="text-muted-foreground text-lg">
                            {aboutMe1}
                        </p>
                        <p className="text-muted-foreground text-lg">
                            {aboutMe2}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
