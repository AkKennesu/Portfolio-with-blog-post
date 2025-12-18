"use client"

import { useActionState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Mail, Send } from "lucide-react"
import { EncryptButton } from "@/components/EncryptButton"
import { SocialLink } from "@/components/SocialLink"
import { submitContact, type ContactState } from "@/actions/contact"

const initialState: ContactState = {}

export function Contact() {
    const [state, formAction, isPending] = useActionState(submitContact, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
        }
    }, [state.success])

    return (
        <section id="contact" className="py-24 sm:py-32 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Get in Touch</h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            Interested in working together? Have a question? Send me a message and I'll get back to you as soon as possible.
                        </p>

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4 mt-4">
                                <SocialLink href="#" icon={Github} color="#333333" label="GitHub" />
                                <SocialLink href="#" icon={Twitter} color="#1DA1F2" label="Twitter" />
                                <SocialLink href="#" icon={Linkedin} color="#0077b5" label="LinkedIn" />
                                <SocialLink href="mailto:hello@example.com" icon={Mail} color="#EA4335" label="Email" />
                            </div>
                        </div>
                    </div>

                    <motion.form
                        ref={formRef}
                        action={formAction}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="grid gap-6"
                    >
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <input
                                id="name"
                                name="name"
                                required
                                defaultValue={state.fields?.name}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                defaultValue={state.fields?.email}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                defaultValue={state.fields?.message}
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Tell me about your project..."
                            />
                        </div>

                        {state.error && (
                            <p className="text-sm font-medium text-destructive">{state.error}</p>
                        )}

                        <div className="flex justify-end">
                            <EncryptButton
                                type="submit"
                                disabled={isPending || state.success}
                                targetText={state.success ? "Message Sent!" : isPending ? "Sending..." : "Send Message"}
                                icon={Send}
                                className="w-full sm:w-auto"
                            />
                        </div>
                    </motion.form>
                </div>
            </div>
        </section>
    )
}
