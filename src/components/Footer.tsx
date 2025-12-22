"use client"

import Link from "next/link"
import {
    Github, Twitter, Linkedin, Facebook, Instagram, Youtube,
    Slack, Twitch, Globe, Link as LinkIcon, Mail, LucideIcon
} from "lucide-react"
import { SettingsMap } from "@/actions/settings"

const SOCIAL_PLATFORMS: Record<string, { icon: LucideIcon, color: string }> = {
    Github: { icon: Github, color: "#333333" },
    Linkedin: { icon: Linkedin, color: "#0077b5" },
    Twitter: { icon: Twitter, color: "#1DA1F2" },
    Facebook: { icon: Facebook, color: "#1877F2" },
    Instagram: { icon: Instagram, color: "#E4405F" },
    Youtube: { icon: Youtube, color: "#FF0000" },
    Slack: { icon: Slack, color: "#5865F2" },
    Twitch: { icon: Twitch, color: "#9146FF" },
    Mail: { icon: Mail, color: "#EA4335" },
    Globe: { icon: Globe, color: "var(--primary)" },
    LinkIcon: { icon: LinkIcon, color: "var(--primary)" },
}

export function Footer({ settings }: { settings?: SettingsMap }) {
    const customLinks = settings?.custom_social_links
        ? JSON.parse(settings.custom_social_links) as { label: string, url: string, icon: string }[]
        : []

    return (
        <footer className="border-t border-white/5 bg-background pb-24 md:pb-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by{" "}
                        <span className="font-medium">Arn Kenneth</span>.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {customLinks.map((link, i) => {
                        const config = SOCIAL_PLATFORMS[link.icon] || SOCIAL_PLATFORMS.LinkIcon
                        const Icon = config.icon
                        const href = link.icon === "Mail" ? `mailto:${link.url}` : link.url

                        return (
                            <Link
                                key={i}
                                href={href || "#"}
                                target="_blank"
                                className="text-muted-foreground hover:text-foreground transition-colors group"
                                title={link.label}
                            >
                                <Icon
                                    className="h-5 w-5 transition-colors"
                                    style={{
                                        // We can't easily use tailwind classes for arbitrary colors in a map without Safelist
                                        // So we'll use inline style for the 'group-hover' effect color or just use it on the Icon
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as SVGElement).style.color = config.color
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as SVGElement).style.color = ""
                                    }}
                                />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </footer>
    )
}
