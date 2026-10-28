"use client"

import { memo, useMemo } from "react"
import Link from "next/link"
import {
    Github, Linkedin, Mail, LucideIcon, Link as LinkIcon,
    Twitter, Facebook, Instagram, Youtube, Slack, Twitch, Globe
} from "lucide-react"
import { SettingsMap } from "@/actions/settings"
import { cn } from "@/lib/utils"

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

export const Footer = memo(function Footer({ settings }: { settings?: SettingsMap }) {
    const allLinks = useMemo(() => {
        let customLinks: { label?: string; url: string; icon: string }[] = []
        try {
            if (settings?.custom_social_links) {
                const parsed = JSON.parse(settings.custom_social_links)
                if (Array.isArray(parsed)) customLinks = parsed
            }
        } catch {
            customLinks = []
        }

        const customMap = new Map<string, { label?: string; url: string }>()
        customLinks.forEach((item) => {
            if (item.icon && item.url) {
                customMap.set(item.icon.toLowerCase(), item)
            }
        })

        const defaultSocials = [
            {
                label: customMap.get("github")?.label || "GitHub",
                icon: Github,
                url: customMap.get("github")?.url || "https://github.com/AkKennesu",
                hoverClasses: "hover:bg-white/10 hover:border-white/30 hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.18)]",
            },
            {
                label: customMap.get("linkedin")?.label || "LinkedIn",
                icon: Linkedin,
                url: customMap.get("linkedin")?.url || "https://linkedin.com",
                hoverClasses: "hover:bg-[#0077b5]/10 hover:border-[#0077b5]/40 hover:text-[#0077b5] hover:shadow-[0_0_12px_rgba(0,119,181,0.25)]",
            },
            {
                label: customMap.get("mail")?.label || "Email",
                icon: Mail,
                url: customMap.get("mail")
                    ? (customMap.get("mail")!.url.startsWith("mailto:")
                        ? customMap.get("mail")!.url
                        : `mailto:${customMap.get("mail")!.url}`)
                    : "mailto:akcatabay26@gmail.com",
                hoverClasses: "hover:bg-[#ea4335]/10 hover:border-[#ea4335]/40 hover:text-[#ea4335] hover:shadow-[0_0_12px_rgba(234,67,53,0.25)]",
            },
        ]

        // Include any additional custom links added via admin that aren't the standard three
        const extraLinks = customLinks
            .filter((l) => !["github", "linkedin", "mail"].includes(l.icon.toLowerCase()))
            .map((link) => {
                const config = SOCIAL_PLATFORMS[link.icon] || SOCIAL_PLATFORMS.LinkIcon
                const isEmail = link.icon.toLowerCase() === "mail"
                const url = isEmail && !link.url.startsWith("mailto:") ? `mailto:${link.url}` : link.url
                return {
                    label: link.label || link.icon,
                    icon: config.icon,
                    url,
                    hoverClasses: "hover:bg-primary/10 hover:border-primary/40 hover:text-primary hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]",
                }
            })

        return [...defaultSocials, ...extraLinks]
    }, [settings?.custom_social_links])

    return (
        <footer className="border-t border-white/5 bg-background pb-20 md:pb-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-2.5 py-4 md:py-0 md:h-20 md:flex-row px-4">
                {/* Social icons: on top in mobile (order-1), right in desktop (md:order-2) */}
                <div className="order-1 md:order-2 flex items-center gap-2 md:gap-3">
                    {allLinks.map((link) => {
                        const Icon = link.icon
                        const isMail = link.url.startsWith("mailto:")

                        return (
                            <Link
                                key={link.label}
                                href={link.url || "#"}
                                target={isMail ? undefined : "_blank"}
                                rel={isMail ? undefined : "noopener noreferrer"}
                                aria-label={link.label}
                                title={link.label}
                                className={cn(
                                    "group relative flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full",
                                    "border border-white/10 bg-white/3 backdrop-blur-sm",
                                    "text-muted-foreground transition-all duration-300",
                                    "hover:scale-110 active:scale-95 shadow-sm",
                                    link.hoverClasses
                                )}
                            >
                                <Icon className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110" />
                                <span className="sr-only">{link.label}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* Built by text: below icons in mobile (order-2), left in desktop (md:order-1) */}
                <div className="order-2 md:order-1 flex items-center">
                    <p className="text-center text-xs md:text-sm text-muted-foreground md:text-left">
                        Built by{" "}
                        <span className="font-medium text-foreground">Arn Kenneth</span>.
                    </p>
                </div>
            </div>
        </footer>
    )
})
