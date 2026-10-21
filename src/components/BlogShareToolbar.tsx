"use client"

import { useState, useEffect } from "react"
import { Share2, Check, Copy, Twitter, Linkedin } from "lucide-react"

interface BlogShareToolbarProps {
    title: string
    url?: string
}

export function BlogShareToolbar({ title, url }: BlogShareToolbarProps) {
    const [copied, setCopied] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [currentUrl, setCurrentUrl] = useState(url || "")

    useEffect(() => {
        if (!url && typeof window !== "undefined") {
            setCurrentUrl(window.location.href)
        }

        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop
            const windowHeight =
                document.documentElement.scrollHeight - document.documentElement.clientHeight
            if (windowHeight > 0) {
                const scroll = Number((totalScroll / windowHeight).toFixed(3))
                setScrollProgress(Math.min(100, Math.max(0, scroll * 100)))
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [url])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl || window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback
        }
    }

    const shareTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
        )}&url=${encodeURIComponent(currentUrl || window.location.href)}`
        window.open(twitterUrl, "_blank", "noopener,noreferrer")
    }

    const shareLinkedIn = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            currentUrl || window.location.href
        )}`
        window.open(linkedInUrl, "_blank", "noopener,noreferrer")
    }

    return (
        <>
            {/* Top Reading Progress Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-primary z-60 transition-all duration-75"
                style={{ width: `${scrollProgress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(scrollProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
            />

            {/* Floating or Inline Share Toolbar */}
            <div className="flex items-center gap-2 py-4">
                <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    Share:
                </span>

                <button
                    type="button"
                    onClick={shareTwitter}
                    title="Share on X (Twitter)"
                    aria-label="Share on X (Twitter)"
                    className="p-2 rounded-lg bg-card/80 border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                    <Twitter className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={shareLinkedIn}
                    title="Share on LinkedIn"
                    aria-label="Share on LinkedIn"
                    className="p-2 rounded-lg bg-card/80 border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                    <Linkedin className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={copyToClipboard}
                    title="Copy Article Link"
                    aria-label="Copy Article Link"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        copied
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card/80 border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/50"
                    }`}
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Link copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy link</span>
                        </>
                    )}
                </button>
            </div>
        </>
    )
}
