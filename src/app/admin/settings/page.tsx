"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { getSettings, updateSettings, type SettingsMap } from "@/actions/settings"
import {
    Save, Palette, User, Loader2, ArrowLeft, RotateCcw, Github, Linkedin, Twitter,
    Facebook, Mail, Share2, Plus, Trash2, Instagram, Youtube, Slack, Twitch, Globe, Link as LinkIcon, FileText, Upload, CheckCircle2
} from "lucide-react"
import Link from "next/link"

type CustomLink = {
    label: string
    url: string
    icon: string
}

const ICON_OPTIONS = [
    { label: "GitHub", value: "Github", icon: Github },
    { label: "LinkedIn", value: "Linkedin", icon: Linkedin },
    { label: "Twitter / X", value: "Twitter", icon: Twitter },
    { label: "Facebook", value: "Facebook", icon: Facebook },
    { label: "Instagram", value: "Instagram", icon: Instagram },
    { label: "YouTube", value: "Youtube", icon: Youtube },
    { label: "Discord", value: "Slack", icon: Slack },
    { label: "Twitch", value: "Twitch", icon: Twitch },
    { label: "Public Email", value: "Mail", icon: Mail },
    { label: "Website", value: "Globe", icon: Globe },
    { label: "Generic Link", value: "LinkIcon", icon: LinkIcon },
]

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsMap | null>(null)
    const [isPending, startTransition] = useTransition()
    const [localColor, setLocalColor] = useState("#3b82f6")
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [customLinks, setCustomLinks] = useState<CustomLink[]>([])
    const [cvBase64, setCvBase64] = useState<string>("")
    const [cvName, setCvName] = useState<string>("")
    const [isUploading, setIsUploading] = useState(false)
    const cvInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        getSettings().then(data => {
            setSettings(data)
            setLocalColor(data.primary_color)
            setCvBase64(data.cv_file || "")
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

    const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setCvName(file.name)
        const reader = new FileReader()
        reader.onloadend = () => {
            setCvBase64(reader.result as string)
            setIsUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (formData: FormData) => {
        setStatus(null)
        formData.set("custom_social_links", JSON.stringify(customLinks))
        formData.set("cv_file", cvBase64)

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
                    <h1 className="text-3xl font-bold">Personal Info&apos;s</h1>
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

                {/* Consolidated Social Links Section */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Share2 className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Social Links</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddLink}
                            className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Add Link
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {customLinks.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground italic border-2 border-dashed border-border rounded-xl">
                                No social links added yet. Click &quot;Add Link&quot; to begin.
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
                                                placeholder="e.g. My GitHub"
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
                                        <div className="grid gap-2 w-full sm:w-40">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Platform Icon</label>
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

                {/* CV Upload Section */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Resume / CV</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Curriculum Vitae (CV / Resume)</label>
                                <p className="text-xs text-muted-foreground">Provide a direct URL (e.g. Supabase Storage CDN, public file) or upload a document.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Direct Document URL (Recommended for Performance)</label>
                                <input
                                    type="text"
                                    value={cvBase64.startsWith("data:") ? "" : cvBase64}
                                    onChange={(e) => {
                                        setCvBase64(e.target.value)
                                        setCvName(e.target.value ? "Direct Document URL" : "")
                                    }}
                                    placeholder="https://your-project.supabase.co/storage/v1/object/public/.../cv.pdf or /cv.pdf"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6 pt-2">
                                <div
                                    onClick={() => cvInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors text-center"
                                >
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">Click to upload new CV</p>
                                        <p className="text-xs text-muted-foreground">or drag and drop here</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={cvInputRef}
                                        onChange={handleCvUpload}
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex flex-col justify-center items-center p-6 border border-border rounded-xl bg-muted/10">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Uploading...</p>
                                        </div>
                                    ) : cvBase64 ? (
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                <CheckCircle2 className="h-7 w-7" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-green-600">CV Ready for Save</p>
                                                <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{cvName || "File successfully prepared"}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCvBase64("")}
                                                className="text-[10px] font-bold text-destructive hover:underline uppercase"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-xs font-medium uppercase">No file selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
                        disabled={isPending || isUploading}
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
