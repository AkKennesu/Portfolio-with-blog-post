"use client"

import { useState, useRef } from "react"
import { X, Upload, Image as ImageIcon, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { compressImageFile } from "@/lib/image-utils"

interface ArticleImageModalProps {
    isOpen: boolean
    onClose: () => void
    onInsert: (snippet: string) => void
}

type AlignmentOption = "full" | "center" | "float-left" | "float-right"

export function ArticleImageModal({ isOpen, onClose, onInsert }: ArticleImageModalProps) {
    const [sourceMode, setSourceMode] = useState<"upload" | "url">("upload")
    const [imageUrl, setImageUrl] = useState("")
    const [caption, setCaption] = useState("")
    const [altText, setAltText] = useState("")
    const [alignment, setAlignment] = useState<AlignmentOption>("full")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setIsProcessing(true)

        try {
            const compressed = await compressImageFile(file, 1600, 1600, 0.85)
            setImageUrl(compressed)
            if (!altText) {
                // Auto fill alt text with clean file name
                const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                setAltText(cleanName)
            }
        } catch (err) {
            console.error("Failed to process image:", err)
            setError("Failed to process image file. Please try another image or use a URL.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleInsert = () => {
        if (!imageUrl.trim()) {
            setError("Please upload an image or provide a valid image URL.")
            return
        }

        const safeAlt = altText.trim() || caption.trim() || "Article illustration"
        const safeCaption = caption.trim()

        let figureClass = "my-8"
        let imgClass = "rounded-xl border border-border/80 shadow-md transition-all object-cover"

        switch (alignment) {
            case "full":
                figureClass += " w-full text-center"
                imgClass += " w-full max-h-[550px] mx-auto"
                break
            case "center":
                figureClass += " max-w-2xl mx-auto text-center"
                imgClass += " w-full max-h-[450px] mx-auto"
                break
            case "float-left":
                figureClass += " sm:float-left sm:mr-6 mb-4 max-w-sm"
                imgClass += " w-full"
                break
            case "float-right":
                figureClass += " sm:float-right sm:ml-6 mb-4 max-w-sm"
                imgClass += " w-full"
                break
        }

        const snippet = safeCaption
            ? `\n<figure class="${figureClass}">\n  <img src="${imageUrl}" alt="${safeAlt}" class="${imgClass}" loading="lazy" />\n  <figcaption class="text-xs text-center text-muted-foreground mt-2.5 italic">${safeCaption}</figcaption>\n</figure>\n`
            : `\n<figure class="${figureClass}">\n  <img src="${imageUrl}" alt="${safeAlt}" class="${imgClass}" loading="lazy" />\n</figure>\n`

        onInsert(snippet)
        resetAndClose()
    }

    const resetAndClose = () => {
        setImageUrl("")
        setCaption("")
        setAltText("")
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Insert Photo into Article</h3>
                            <p className="text-xs text-muted-foreground">Add illustrations, charts, or screenshots inside your content</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={resetAndClose}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                        {error}
                    </div>
                )}

                {/* Source Selection Tabs */}
                <div className="mt-6 flex items-center gap-2 p-1 rounded-xl bg-muted/60 border border-border/60">
                    <button
                        type="button"
                        onClick={() => setSourceMode("upload")}
                        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            sourceMode === "upload"
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Upload from Device
                    </button>
                    <button
                        type="button"
                        onClick={() => setSourceMode("url")}
                        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            sourceMode === "url"
                                ? "bg-background text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Image URL / Web Link
                    </button>
                </div>

                {/* Source Input */}
                <div className="mt-4">
                    {sourceMode === "upload" ? (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/40 cursor-pointer transition-colors group"
                            >
                                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold text-foreground">Click or drop image to upload</span>
                                <span className="text-xs text-muted-foreground">PNG, JPG, WebP, SVG (automatically optimized)</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">Image URL</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>
                    )}
                </div>

                {/* Live Preview If Image Loaded */}
                {imageUrl && (
                    <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Image Preview</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setImageUrl("")
                                    if (fileInputRef.current) fileInputRef.current.value = ""
                                }}
                                className="text-destructive hover:underline cursor-pointer"
                            >
                                Clear image
                            </button>
                        </div>
                        <div className="relative aspect-video rounded-xl border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                            {isProcessing ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            ) : (
                                <Image
                                    src={imageUrl}
                                    alt={altText || "Preview"}
                                    fill
                                    unoptimized
                                    className="object-contain"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Caption and Alt Text */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Caption (Optional)</label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Figure 1: Architectural diagram"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Alt Text (Accessibility & SEO)</label>
                        <input
                            type="text"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="Brief description of the image"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>
                </div>

                {/* Sizing & Alignment */}
                <div className="mt-5 space-y-2">
                    <label className="text-xs font-medium text-foreground">Layout & Sizing Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { id: "full", label: "Full Width" },
                            { id: "center", label: "Medium Centered" },
                            { id: "float-left", label: "Float Left" },
                            { id: "float-right", label: "Float Right" },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setAlignment(opt.id as AlignmentOption)}
                                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                                    alignment === opt.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={resetAndClose}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleInsert}
                        disabled={!imageUrl || isProcessing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                        {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Insert Photo</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
