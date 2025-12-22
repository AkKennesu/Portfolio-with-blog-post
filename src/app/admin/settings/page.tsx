"use client"

import { useState, useTransition, useEffect } from "react"
import { getSettings, updateSettings, type SettingsMap } from "@/actions/settings"
import {
    Save, Palette, User, Loader2, ArrowLeft, RotateCcw, Github, Linkedin, Twitter,
    Facebook, Mail, Share2, Plus, Trash2, Instagram, Youtube, Slack, Twitch, Globe, Link as LinkIcon
} from "lucide-react"
import Link from "next/link"

type CustomLink = {
    label: string
    url: string
    icon: string
}

const ICON_OPTIONS = [
    { label: "Instagram", value: "Instagram", icon: Instagram },
    { label: "YouTube", value: "Youtube", icon: Youtube },
    { label: "Discord", value: "Slack", icon: Slack }, // Using Slack as a proxy for social chat if Discord not available, but let's see
    { label: "Twitch", value: "Twitch", icon: Twitch },
    { label: "Website", value: "Globe", icon: Globe },
    { label: "Generic Link", value: "LinkIcon", icon: LinkIcon },
]

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsMap | null>(null)
    const [isPending, startTransition] = useTransition()
    const [localColor, setLocalColor] = useState("#3b82f6")
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [customLinks, setCustomLinks] = useState<CustomLink[]>([])

    useEffect(() => {
        getSettings().then(data => {
            setSettings(data)
            setLocalColor(data.primary_color)
            try {
                const parsed = JSON.parse(data.custom_social_links || "[]")
                setCustomLinks(parsed)
            } catch {
                setCustomLinks([])
            }
        })
    }, [])

    const handleAddLink = () => {
        setCustomLinks([...customLinks, { label: "", url: "", icon: "LinkIcon" }])
    }

    const handleRemoveLink = (index: number) => {
        setCustomLinks(customLinks.filter((_, i) => i !== index))
    }

    const handleUpdateLink = (index: number, updates: Partial<CustomLink>) => {
        const newLinks = [...customLinks]
        newLinks[index] = { ...newLinks[index], ...updates }
        setCustomLinks(newLinks)
    }

    const handleSubmit = async (formData: FormData) => {
        setStatus(null)
        // Add custom links as JSON to the formData
        formData.set("custom_social_links", JSON.stringify(customLinks))

        startTransition(async () => {
            const result = await updateSettings(formData)
            if (result.success) {
                setStatus({ type: 'success', msg: 'Settings updated successfully!' })
                setTimeout(() => setStatus(null), 3000)
            } else {
                setStatus({ type: 'error', msg: result.error || 'Failed to update' })
            }
        })
    }

    if (!settings) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Site Settings</h1>
                    <p className="text-muted-foreground mt-1">Customize your bio, brand colors, and social presence.</p>
                </div>
                <Link
                    href="/admin/dashboard"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </div>

            <form action={handleSubmit} className="space-y-8 pb-12">
                {/* Branding Section */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            <Palette className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Branding & Identity</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-4">
                                <label className="text-sm font-medium">Primary Brand Color</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <input
                                            type="color"
                                            name="primary_color"
                                            value={localColor}
                                            onChange={(e) => setLocalColor(e.target.value)}
                                            className="h-14 w-14 rounded-lg cursor-pointer border-2 border-border p-1 bg-background"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="text"
                                            value={localColor}
                                            onChange={(e) => setLocalColor(e.target.value)}
                                            placeholder="#HEXCODE"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Drag the box or type HEX code</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/10">
                                <div className="text-center">
                                    <div
                                        className="h-12 w-12 rounded-full mx-auto mb-3 shadow-lg"
                                        style={{ backgroundColor: localColor }}
                                    />
                                    <p className="text-xs font-medium">Live Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Me Section */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">About Me Content</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid gap-4">
                            <label className="text-sm font-medium">Bio Paragraph 1</label>
                            <textarea
                                name="about_me_1"
                                defaultValue={settings.about_me_1}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        <div className="grid gap-4">
                            <label className="text-sm font-medium">Bio Paragraph 2</label>
                            <textarea
                                name="about_me_2"
                                defaultValue={settings.about_me_2}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                                placeholder="Add more details..."
                            />
                        </div>
                    </div>
                </div>

                {/* Essential Social Links */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            <Share2 className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Essential Social Links</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Github className="h-4 w-4" /> GitHub
                                </label>
                                <input
                                    name="social_github"
                                    defaultValue={settings.social_github}
                                    placeholder="https://github.com/..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Linkedin className="h-4 w-4" /> LinkedIn
                                </label>
                                <input
                                    name="social_linkedin"
                                    defaultValue={settings.social_linkedin}
                                    placeholder="https://linkedin.com/..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Twitter className="h-4 w-4" /> Twitter / X
                                </label>
                                <input
                                    name="social_twitter"
                                    defaultValue={settings.social_twitter}
                                    placeholder="https://twitter.com/..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Facebook className="h-4 w-4" /> Facebook
                                </label>
                                <input
                                    name="social_facebook"
                                    defaultValue={settings.social_facebook}
                                    placeholder="https://facebook.com/..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Public Email
                                </label>
                                <input
                                    name="social_email"
                                    defaultValue={settings.social_email}
                                    placeholder="your@email.com"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Social Buttons */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Plus className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Custom Buttons</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddLink}
                            className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Add Custom Button
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {customLinks.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground italic border-2 border-dashed border-border rounded-xl">
                                No custom buttons added yet. Click &quot;Add Custom Button&quot; to begin.
                            </p>
                        ) : (
                            <div className="grid gap-4">
                                {customLinks.map((link, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-end gap-3 p-4 border border-border rounded-xl bg-muted/20">
                                        <div className="grid gap-2 flex-1 w-full">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Label</label>
                                            <input
                                                value={link.label}
                                                onChange={(e) => handleUpdateLink(index, { label: e.target.value })}
                                                placeholder="My Channel / Portfolio"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-2 flex-1 w-full">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">URL</label>
                                            <input
                                                value={link.url}
                                                onChange={(e) => handleUpdateLink(index, { url: e.target.value })}
                                                placeholder="https://..."
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-2 w-full sm:w-32">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Icon</label>
                                            <select
                                                value={link.icon}
                                                onChange={(e) => handleUpdateLink(index, { icon: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                                            >
                                                {ICON_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLink(index)}
                                            className="h-10 w-10 flex items-center justify-center rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                                            title="Remove Link"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                        {status.type === 'success' ? <Save className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                        <p className="text-sm font-medium">{status.msg}</p>
                    </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setLocalColor("#3b82f6")
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset Defaults
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save All Changes
                    </button>
                </div>
            </form>
        </div>
    )
}
