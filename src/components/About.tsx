"use client"

import { motion } from "framer-motion"

import ProfileTransition from "./ProfileTransition"

export function About() {
    return (
        <section id="about" className="py-24 sm:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-8 items-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="relative aspect-square overflow-hidden rounded-xl bg-muted max-w-sm mx-auto w-full"
                    >
                        <ProfileTransition
                            image1="/profile.png"
                            image2="/profile-hover.png"
                            width={600}
                            height={600}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-6"
                    >
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">About Me</h2>
                        <p className="text-muted-foreground text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non neque est. Sed vel pretium massa. Donec eget nibh a magna feugiat rutrum.
                        </p>
                        <p className="text-muted-foreground text-lg">
                            Vivamus at dui mollis, finibus justo vitae, accumsan nullam. Phasellus vestibulum hendrerit ex, ut ullamcorper arcu finibus a. Fusce et nibh quist.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
