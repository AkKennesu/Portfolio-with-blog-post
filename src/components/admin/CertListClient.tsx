"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, CheckSquare, Square, Image as ImageIcon } from "lucide-react"
import { type Certificate } from "@/lib/certificates"
import { deleteCertificate, deleteCertificates } from "@/actions/certificates"
import DeleteButton from "@/components/admin/DeleteButton"
import { BatchDeleteToolbar } from "./BatchDeleteToolbar"

export default function CertListClient({ certs }: { certs: Certificate[] }) {
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    const toggleSelectAll = () => {
        if (selectedIds.length === certs.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(certs.map(c => c.id!).filter(Boolean))
        }
    }

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleBatchDelete = async () => {
        const result = await deleteCertificates(selectedIds)
        if (result.success) {
            setSelectedIds([])
            window.location.reload()
        }
    }

    return (
        <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 w-12 text-center">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {selectedIds.length > 0 && selectedIds.length === certs.length ? (
                                        <CheckSquare className="h-4 w-4 text-primary" />
                                    ) : (
                                        <Square className="h-4 w-4" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-semibold text-sm w-20">Preview</th>
                            <th className="px-6 py-4 font-semibold text-sm">Title</th>
                            <th className="px-6 py-4 font-semibold text-sm">Year</th>
                            <th className="px-6 py-4 font-semibold text-sm">Subtitle</th>
                            <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {certs.map((cert) => (
                            <tr
                                key={cert.id}
                                className={`transition-colors cursor-pointer ${selectedIds.includes(cert.id!) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                                    }`}
                                onClick={() => toggleSelect(cert.id!)}
                            >
                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => toggleSelect(cert.id!)}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {selectedIds.includes(cert.id!) ? (
                                            <CheckSquare className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Square className="h-4 w-4" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-10 w-10 min-w-10 rounded-md bg-muted overflow-hidden border border-border relative">
                                        {Boolean(cert.image && cert.image.trim()) ? (
                                            <Image src={cert.image} alt={cert.title} fill unoptimized className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{cert.title}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{cert.year}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{cert.subtitle}</td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/certificates/edit/${cert.id}`}
                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <DeleteButton
                                            action={deleteCertificate}
                                            id={cert.id!}
                                            confirmMessage={`Are you sure you want to delete the certificate "${cert.title}"?`}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {certs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                    No certificates found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <BatchDeleteToolbar
                selectedCount={selectedIds.length}
                onDelete={handleBatchDelete}
                onClear={() => setSelectedIds([])}
                itemName="certificates"
            />
        </div>
    )
}
