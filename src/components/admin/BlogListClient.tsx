"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, CheckSquare, Square, Image as ImageIcon } from "lucide-react"
import { type Post } from "@/lib/blog"
import { deletePost, deletePosts } from "@/actions/blog"
import DeleteButton from "@/components/admin/DeleteButton"
import { BatchDeleteToolbar } from "./BatchDeleteToolbar"
import Image from "next/image"

export default function BlogListClient({ posts }: { posts: Post[] }) {
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    const toggleSelectAll = () => {
        if (selectedIds.length === posts.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(posts.map(p => p.id!).filter(Boolean))
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
        const result = await deletePosts(selectedIds)
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
                                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                >
                                    {selectedIds.length > 0 && selectedIds.length === posts.length ? (
                                        <CheckSquare className="h-4 w-4 text-primary" />
                                    ) : (
                                        <Square className="h-4 w-4" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-semibold text-sm w-24">Cover</th>
                            <th className="px-6 py-4 font-semibold text-sm">Title</th>
                            <th className="px-6 py-4 font-semibold text-sm">Date</th>
                            <th className="px-6 py-4 font-semibold text-sm">Slug</th>
                            <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {posts.map((post, idx) => (
                            <tr
                                key={post.id ? `post-${post.id}` : post.slug || `post-${idx}`}
                                className={`transition-colors cursor-pointer ${selectedIds.includes(post.id!) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                                    }`}
                                onClick={() => toggleSelect(post.id!)}
                            >
                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => toggleSelect(post.id!)}
                                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {selectedIds.includes(post.id!) ? (
                                            <CheckSquare className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Square className="h-4 w-4" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="relative h-11 w-16 rounded-lg overflow-hidden bg-muted/60 border border-border/60 shrink-0">
                                        {post.cover_image && post.cover_image.trim() ? (
                                            <Image
                                                src={post.cover_image}
                                                alt={post.title}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                                                <ImageIcon className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{post.title}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{post.date}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{post.slug}</td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/blog/edit/${post.slug}`}
                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <DeleteButton
                                            action={deletePost}
                                            id={post.id!}
                                            confirmMessage={`Are you sure you want to delete "${post.title}"?`}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                    No blog posts found.
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
                itemName="posts"
            />
        </div>
    )
}
