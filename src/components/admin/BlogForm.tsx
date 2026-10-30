"use client"

import { useActionState, useState, useRef } from "react"
import { createPost, updatePost } from "@/actions/blog"
import { type Post } from "@/lib/blog"
import {
    Save,
    Loader2,
    Upload,
    X,
    Image as ImageIcon,
    ImagePlus,
    Eye,
    Code,
    Quote,
    List
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { compressImageFile } from "@/lib/image-utils"
import { ArticleImageModal } from "./ArticleImageModal"
import { sanitizeContent } from "@/lib/sanitize"
import { useDebouncedCallback } from "@/hooks/use-debounce"

interface FormState {
    error?: string
}

export function BlogForm({ post }: { post?: Post }) {
    // Cover photo state
    const [coverImage, setCoverImage] = useState(post?.cover_image || "")
    const [coverUrlInput, setCoverUrlInput] = useState(
        post?.cover_image && !post.cover_image.startsWith("data:") ? post.cover_image : ""
    )
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const coverInputRef = useRef<HTMLInputElement>(null)

    // Debounce cover image URL input handler for preview to avoid remote image loads on every keystroke
    const debouncedSetCoverImage = useDebouncedCallback((val: string) => {
        setCoverImage(val)
    }, 350)

    const handleCoverUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCoverUrlInput(val)
        debouncedSetCoverImage(val)
    }

    // Content and in-article photo insertion state
    const [previewContent, setPreviewContent] = useState(post?.content || "")
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Debounce content updates for live sanitization & preview
    const debouncedSetPreviewContent = useDebouncedCallback((val: string) => {
        setPreviewContent(val)
    }, 300)

    // Form submission action
    const [state, formAction, isPending] = useActionState(
        async (prevState: FormState | null, formData: FormData) => {
            const result = post?.id
                ? await updatePost(post.id, formData)
                : await createPost(formData)
            return (result as FormState) || null
        },
        null
    )

    // Handle Cover Image upload
    const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingCover(true)
        try {
            const compressed = await compressImageFile(file, 1920, 1080, 0.85)
            setCoverImage(compressed)
            setCoverUrlInput("")
        } catch (err) {
            console.error("Failed to compress cover image:", err)
        } finally {
            setIsUploadingCover(false)
        }
    }

    const clearCoverImage = () => {
        setCoverImage("")
        setCoverUrlInput("")
        if (coverInputRef.current) coverInputRef.current.value = ""
    }

    // Insert formatted text or photo snippet at textarea cursor position
    const insertSnippetAtCursor = (snippet: string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const prevContent = textarea.value
        const nextContent = prevContent.substring(0, start) + snippet + prevContent.substring(end)

        textarea.value = nextContent
        debouncedSetPreviewContent(nextContent)

        // Reset cursor position after insert
        setTimeout(() => {
            textarea.focus()
            const newCursor = start + snippet.length
            textarea.setSelectionRange(newCursor, newCursor)
        }, 50)
    }

    return (
        <>
            <form action={formAction} className="space-y-8 max-w-4xl">
                {state?.error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                        {state.error}
                    </div>
                )}

                {/* 1. Basic Metadata */}
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-semibold text-foreground">
                            Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            required
                            defaultValue={post?.title}
                            placeholder="My Awesome Blog Post"
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="slug" className="text-sm font-semibold text-foreground">
                                Slug (URL identifier)
                            </label>
                            <input
                                id="slug"
                                name="slug"
                                required
                                defaultValue={post?.slug}
                                placeholder="my-awesome-post"
                                className="flex h-10 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="date" className="text-sm font-semibold text-foreground">
                                Publish Date
                            </label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                required
                                defaultValue={post?.date || new Date().toISOString().split("T")[0]}
                                className="flex h-10 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="excerpt" className="text-sm font-semibold text-foreground">
                            Excerpt (Summary for cards & search engines)
                        </label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            required
                            defaultValue={post?.excerpt}
                            rows={3}
                            placeholder="A concise summary of the key insights covered in this article..."
                            className="flex min-h-20 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                        />
                    </div>

                    {/* 2. COVER PHOTO SECTION */}
                    <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-foreground">Article Cover Photo</h3>
                            </div>
                            <span className="text-xs text-muted-foreground">Optional • Displayed as banner & card cover</span>
                        </div>

                        {/* Hidden input to pass to server action */}
                        <input type="hidden" name="cover_image" value={coverImage} />

                        <div className="grid gap-4 sm:grid-cols-2 items-start">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-foreground mb-1.5">Option 1: Upload from computer</p>
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 hover:bg-muted/40 cursor-pointer transition-colors group"
                                    >
                                        <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-foreground">Click to upload cover</span>
                                        <span className="text-[11px] text-muted-foreground">PNG, JPG, WebP (auto-optimized)</span>
                                        <input
                                            type="file"
                                            ref={coverInputRef}
                                            onChange={handleCoverFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-foreground">Option 2: Paste image URL</p>
                                    <input
                                        type="url"
                                        value={coverUrlInput}
                                        onChange={handleCoverUrlChange}
                                        placeholder="https://images.unsplash.com/..."
                                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                    {coverImage.startsWith("data:") && (
                                        <p className="text-[11px] text-emerald-500 font-medium">
                                            ✓ Custom image file attached from device
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Cover Preview */}
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-foreground">Banner Preview</p>
                                <div className="relative aspect-video rounded-xl border border-border bg-muted/40 overflow-hidden flex items-center justify-center group">
                                    {isUploadingCover ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                                            <span className="text-xs text-muted-foreground">Optimizing cover...</span>
                                        </div>
                                    ) : coverImage ? (
                                        <>
                                            <Image
                                                src={coverImage}
                                                alt="Article cover preview"
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={clearCoverImage}
                                                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-background/85 hover:bg-destructive hover:text-destructive-foreground text-foreground shadow-md transition-colors cursor-pointer"
                                                title="Remove cover photo"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-1" />
                                            <span className="text-xs text-muted-foreground">No cover photo set</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. ARTICLE CONTENT WITH IN-ARTICLE PHOTO INSERTION */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <label htmlFor="content" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <span>Article Content</span>
                                <span className="text-xs font-normal text-muted-foreground">(HTML supported)</span>
                            </label>

                            {/* Edit / Preview Tabs */}
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("edit")}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        activeTab === "edit"
                                            ? "bg-background text-foreground shadow-xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Code className="w-3.5 h-3.5" />
                                    <span>Write / Code</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (textareaRef.current) {
                                            setPreviewContent(textareaRef.current.value)
                                        }
                                        setActiveTab("preview")
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        activeTab === "preview"
                                            ? "bg-background text-foreground shadow-xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Live Preview</span>
                                </button>
                            </div>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-card border border-border">
                            {/* In-Article Photo Inserter (Main Highlight) */}
                            <button
                                type="button"
                                onClick={() => setIsImageModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer mr-2"
                                title="Insert photo into the article"
                            >
                                <ImagePlus className="w-4 h-4" />
                                <span>Add Photo to Article</span>
                            </button>

                            <div className="h-4 w-px bg-border mx-1" />

                            {/* Text Quick-Insert Buttons */}
                            <button
                                type="button"
                                onClick={() => insertSnippetAtCursor("\n<h2>Section Heading</h2>\n")}
                                className="p-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Insert H2 Heading"
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => insertSnippetAtCursor("\n<h3>Subheading</h3>\n")}
                                className="p-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Insert H3 Subheading"
                            >
                                H3
                            </button>
                            <button
                                type="button"
                                onClick={() => insertSnippetAtCursor("\n<p>Your paragraph text here...</p>\n")}
                                className="p-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Insert Paragraph"
                            >
                                P
                            </button>
                            <button
                                type="button"
                                onClick={() => insertSnippetAtCursor("<strong>bold text</strong>")}
                                className="p-1.5 text-xs font-bold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Insert Bold"
                            >
                                B
                            </button>
                            <button
                                type="button"
                                onClick={() => insertSnippetAtCursor("\n<blockquote class=\"italic border-l-4 border-primary pl-4 text-muted-foreground\">\n  Important quote or insight...\n</blockquote>\n")}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Insert Quote"
                            >
                                <Quote className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertSnippetAtCursor("\n<ul class=\"list-disc pl-6 space-y-1\">\n  <li>Point one</li>\n  <li>Point two</li>\n</ul>\n")}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Insert Bullet List"
                            >
                                <List className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertSnippetAtCursor("\n<pre><code class=\"language-typescript\">\n// Your code snippet here\n</code></pre>\n")}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Insert Code Block"
                            >
                                <Code className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Editor OR Live Preview */}
                        {activeTab === "edit" ? (
                            <textarea
                                ref={textareaRef}
                                id="content"
                                name="content"
                                required
                                defaultValue={post?.content || ""}
                                onChange={(e) => debouncedSetPreviewContent(e.target.value)}
                                placeholder="<p>Write your article here or use the toolbar above to add photos, headings, and code...</p>"
                                className="flex min-h-95 w-full rounded-2xl border border-input bg-background p-4 text-sm font-mono text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all leading-relaxed"
                            />
                        ) : (
                            <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-10 min-h-95 shadow-inner overflow-y-auto">
                                {previewContent.trim() ? (
                                    <article
                                        className="prose prose-invert prose-lg max-w-none 
                                            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                                            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2
                                            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
                                            prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-5
                                            prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                                            prose-img:rounded-xl prose-img:border prose-img:border-border/80 prose-img:shadow-md prose-img:max-h-125 prose-img:object-cover
                                            prose-figure:my-6
                                            prose-figcaption:text-xs prose-figcaption:text-center prose-figcaption:text-muted-foreground prose-figcaption:mt-2"
                                        dangerouslySetInnerHTML={{ __html: sanitizeContent(previewContent) }}
                                    />
                                ) : (
                                    <div className="py-16 text-center text-muted-foreground text-sm">
                                        Your article preview will appear here once you write content or add photos.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                    <Link
                        href="/admin/dashboard?tab=blog"
                        className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground ring-offset-background transition-colors hover:bg-muted"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending || isUploadingCover}
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground ring-offset-background transition-all hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        <span>{post ? "Update Article" : "Publish Article"}</span>
                    </button>
                </div>
            </form>

            {/* In-Article Image Modal */}
            <ArticleImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onInsert={insertSnippetAtCursor}
            />
        </>
    )
}
