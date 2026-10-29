"use client"

import { useState, useMemo, useCallback, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Calendar, Clock, Search, X, Sparkles, BookOpen } from "lucide-react"
import { Post } from "@/lib/blog"
import { estimateReadingTime, formatBlogDate, getPostCategory } from "@/lib/blog-utils"
import { cn } from "@/lib/utils"
import { useDebouncedCallback } from "@/hooks/use-debounce"

interface BlogListProps {
    posts: Post[]
}

export function BlogList({ posts }: BlogListProps) {
    const [displaySearch, setDisplaySearch] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    // Debounce search query updates by 250ms to prevent heavy filtering on every keystroke
    const debouncedSetQuery = useDebouncedCallback((val: string) => {
        setDebouncedSearchQuery(val)
    }, 250)

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setDisplaySearch(val)
        debouncedSetQuery(val)
    }, [debouncedSetQuery])

    // Extract unique categories dynamically
    const categories = useMemo(() => {
        const catSet = new Set<string>()
        posts.forEach((p) => {
            catSet.add(getPostCategory(p))
        })
        return ["All", ...Array.from(catSet)]
    }, [posts])

    // Filter posts by debounced search query and category
    const filteredPosts = useMemo(() => {
        const q = debouncedSearchQuery.toLowerCase().trim()
        return posts.filter((post) => {
            const matchesCategory =
                selectedCategory === "All" || getPostCategory(post) === selectedCategory

            const matchesQuery =
                !q ||
                post.title.toLowerCase().includes(q) ||
                post.excerpt.toLowerCase().includes(q) ||
                (post.content && post.content.toLowerCase().includes(q))

            return matchesCategory && matchesQuery
        })
    }, [posts, selectedCategory, debouncedSearchQuery])

    // Featured post is the first post when no search query and category is "All"
    const hasFeatured = selectedCategory === "All" && !debouncedSearchQuery.trim() && filteredPosts.length > 0
    const featuredPost = hasFeatured ? filteredPosts[0] : null
    const regularPosts = hasFeatured ? filteredPosts.slice(1) : filteredPosts

    const handleClearSearch = useCallback(() => {
        setDisplaySearch("")
        setDebouncedSearchQuery("")
    }, [])

    const handleResetFilters = useCallback(() => {
        setDisplaySearch("")
        setDebouncedSearchQuery("")
        setSelectedCategory("All")
    }, [])

    return (
        <div className="w-full space-y-12">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-8 border-b border-border/60">
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                                }`}
                            >
                                {cat}
                            </button>
                        )
                    })}
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={displaySearch}
                        onChange={handleSearchChange}
                        placeholder="Search articles by title or keyword..."
                        className="w-full bg-card/60 backdrop-blur-md border border-border/80 rounded-xl pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {displaySearch && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Count Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    Showing {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
                    {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
                </span>
                {(debouncedSearchQuery || selectedCategory !== "All") && (
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-primary hover:underline font-medium cursor-pointer"
                    >
                        Reset filters
                    </button>
                )}
            </div>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <div className="py-20 text-center rounded-2xl border border-dashed border-border/80 bg-card/30 backdrop-blur-md">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/60 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                        No articles matched your criteria. Try searching for different keywords or select another category.
                    </p>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                        View all articles
                    </button>
                </div>
            )}

            {/* Featured Post Hero */}
            {featuredPost && <BlogFeaturedHero post={featuredPost} />}

            {/* Grid of Regular Posts */}
            {regularPosts.length > 0 && (
                <div className="space-y-6">
                    {hasFeatured && (
                        <h3 className="text-xl font-bold tracking-tight text-foreground">
                            More Articles
                        </h3>
                    )}
                    <motion.div
                        layout
                        className={cn(
                            "grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8",
                            regularPosts.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
                        )}
                    >
                        <AnimatePresence mode="popLayout">
                            {regularPosts.map((post) => (
                                <BlogCard key={post.slug} post={post} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

const BlogFeaturedHero = memo(function BlogFeaturedHero({ post }: { post: Post }) {
    const readTime = estimateReadingTime(post.content, post.excerpt)
    const category = getPostCategory(post)
    const formattedDate = formatBlogDate(post.date)
    const isDataUri = Boolean(post.cover_image?.startsWith("data:"))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group relative rounded-3xl border border-primary/30 bg-card/75 backdrop-blur-xl p-8 sm:p-12 shadow-2xl transition-all duration-300 hover:border-primary/60 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.2)]"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {post.cover_image && post.cover_image.trim() ? (
                    <div className="relative w-full lg:w-96 aspect-16/10 rounded-2xl overflow-hidden border border-border/80 shrink-0 bg-muted/40 shadow-md">
                        <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            unoptimized={isDataUri}
                            sizes="(max-width: 1024px) 100vw, 384px"
                            priority
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                ) : null}
                <div className="space-y-4 max-w-2xl flex-1">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 font-semibold text-primary">
                            <Sparkles className="w-3 h-3" />
                            Featured Article
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-primary font-semibold">
                            {category}
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                            {post.title}
                        </Link>
                    </h2>

                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed line-clamp-3">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                        {formattedDate && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <time dateTime={post.date}>
                                    {formattedDate}
                                </time>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{readTime}</span>
                        </div>
                    </div>
                </div>

                <div className="lg:pl-4 flex items-center shrink-0">
                    <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 group-hover:translate-x-1 shadow-lg shadow-primary/20 w-full sm:w-auto"
                    >
                        <span>Read Featured Story</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    )
})

const BlogCard = memo(function BlogCard({ post }: { post: Post }) {
    const readTime = estimateReadingTime(post.content, post.excerpt)
    const category = getPostCategory(post)
    const formattedDate = formatBlogDate(post.date)
    const isDataUri = Boolean(post.cover_image?.startsWith("data:"))

    return (
        <motion.article
            layout
            key={post.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/65 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-1"
        >
            <div>
                {post.cover_image && post.cover_image.trim() ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-5 bg-muted/40 border border-border/40">
                        <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            unoptimized={isDataUri}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ) : null}
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                    <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/25 px-2.5 py-0.5 font-medium text-primary">
                        {category}
                    </span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{readTime}</span>
                    </div>
                </div>

                {/* Date */}
                {formattedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mb-2.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <time dateTime={post.date}>{formattedDate}</time>
                    </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none focus-visible:underline">
                        {post.title}
                    </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt}
                </p>
            </div>

            {/* Bottom Link */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                    <span>Read article</span>
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </motion.article>
    )
})
