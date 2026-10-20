"use client"

import { useActionState, useState, useRef } from "react"
import { createCertificate, updateCertificate } from "@/actions/certificates"
import { type Certificate } from "@/lib/certificates"
import { Save, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface FormState {
    error?: string
}

export function CertificateForm({ certificate }: { certificate?: Certificate }) {
    const [preview, setPreview] = useState(certificate?.image || "")
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [state, formAction, isPending] = useActionState(
        async (prevState: FormState | null, formData: FormData) => {
            const result = certificate?.id
                ? await updateCertificate(certificate.id, formData)
                : await createCertificate(formData)
            return (result as FormState) || null
        },
        null
    )

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
            setIsUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const clearImage = () => {
        setPreview("")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <form action={formAction} className="space-y-6 max-w-4xl">
            {state?.error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {state.error}
                </div>
            )}
            <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="year" className="text-sm font-medium">Year</label>
                        <input
                            id="year"
                            name="year"
                            required
                            defaultValue={certificate?.year}
                            placeholder="2024"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <input
                            id="title"
                            name="title"
                            required
                            defaultValue={certificate?.title}
                            placeholder="Certified Solutions Architect"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="subtitle" className="text-sm font-medium">Subtitle (Issuer/Event)</label>
                    <input
                        id="subtitle"
                        name="subtitle"
                        required
                        defaultValue={certificate?.subtitle}
                        placeholder="Amazon Web Services"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Certificate Image</label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <p className="text-xs text-muted-foreground">Option 1: Upload a file</p>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm font-medium">Click to upload</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <p className="text-xs text-muted-foreground">Option 2: Paste an image URL</p>
                                <input
                                    id="image"
                                    name="image"
                                    required
                                    value={preview}
                                    onChange={(e) => setPreview(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <p className="text-xs text-muted-foreground">Preview</p>
                            <div className="relative aspect-video rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                ) : preview ? (
                                    <>
                                        <Image
                                            src={preview}
                                            alt="Certificate preview"
                                            fill
                                            unoptimized
                                            className="object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground shadow-sm transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-muted-foreground">No image provided</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        defaultValue={certificate?.description}
                        placeholder="Demonstrated expertise in designing distributed systems..."
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Link
                    href="/admin/dashboard?tab=certificates"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {certificate ? "Update Certificate" : "Add Certificate"}
                </button>
            </div>
        </form>
    )
}
