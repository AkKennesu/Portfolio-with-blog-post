"use client"

import { createCertificate, updateCertificate } from "@/actions/certificates"
import { type Certificate } from "@/lib/certificates"
import { Save } from "lucide-react"
import Link from "next/link"

export function CertificateForm({ certificate }: { certificate?: Certificate }) {
    const action = certificate?.id
        ? updateCertificate.bind(null, certificate.id)
        : createCertificate

    return (
        <form action={action} className="space-y-6 max-w-4xl">
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
                    <label htmlFor="image" className="text-sm font-medium">Image URL</label>
                    <input
                        id="image"
                        name="image"
                        required
                        defaultValue={certificate?.image}
                        placeholder="https://images.unsplash.com/..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
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

            <div className="flex justify-end gap-3 pt-4">
                <Link
                    href="/admin/certificates"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {certificate ? "Update Certificate" : "Add Certificate"}
                </button>
            </div>
        </form>
    )
}
