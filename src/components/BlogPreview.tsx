"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { EncryptButton } from "@/components/EncryptButton"
import { type Post } from "@/lib/blog"
import { estimateReadingTime, formatBlogDate, getPostCategory } from "@/lib/blog-utils"

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
}

export function BlogPreview({ posts }: { posts: Post[] }) {
    const router = useRouter()

    return (
        <section id="blog" className="py-24 sm:py-32 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <span className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
                        Engineering Journal
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4 text-foreground">
                        Latest Insights
                    </h2>
                    <p className="text-muted-foreground max-w-170 text-base sm:text-lg">
                        Thoughts on modern software architecture, interface craftsmanship, and full-stack engineering.
                    </p>
                </div>

                {/* Articles Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-16"
                >
                    {posts.map((post) => {
                        const readTime = estimateReadingTime(post.content, post.excerpt)
                        const category = getPostCategory(post)
                        const formattedDate = formatBlogDate(post.date)

                        return (
                            <motion.article
                                key={post.slug}
                                variants={cardVariants}
                                className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card/65 backdrop-blur-md p-6 sm:p-7 transition-all duration-300 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                            >
                                {/* Card Header: Tag & Read Time */}
                                <div>
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
                                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-3">
                                        <Link href={`/blog/${post.slug}`} className="focus:outline-none focus-visible:underline">
                                            {post.title}
                                        </Link>
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                                        {post.excerpt}
                                    </p>
                                </div>

                                {/* Footer CTA */}
                                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                                        aria-label={`Read article: ${post.title}`}
                                    >
                                        <span>Read article</span>
                                        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </motion.article>
                        )
                    })}
                </motion.div>

                {/* Bottom CTA to Blog Archive */}
                <div className="flex justify-center">
                    <EncryptButton
                        targetText="View All Articles"
                        icon={ArrowRight}
                        onClick={() => router.push("/blog")}
                        className="w-full sm:w-auto"
                    />
                </div>
            </div>
        </section>
    )
}
