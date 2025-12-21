"use client"

import { useState, useTransition, useEffect } from "react"
import { getSettings, updateSettings, type SettingsMap } from "@/actions/settings"
import { Save, Palette, User, Loader2, ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsMap | null>(null)
    const [isPending, startTransition] = useTransition()
    const [localColor, setLocalColor] = useState("#3b82f6")

    useEffect(() => {
        getSettings().then(data => {
            setSettings(data)
            setLocalColor(data.primary_color)
        })
    }, [])

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            await updateSettings(formData)
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
                    <p className="text-muted-foreground mt-1">Customize your bio and brand primary color.</p>
                </div>
                <Link
                    href="/admin/dashboard"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </div>

            <form action={handleSubmit} className="space-y-8">
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

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setLocalColor("#3b82f6") // Reset to default logic could be added here
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
