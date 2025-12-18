"use client"

import { Post } from "@/lib/blog"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export function BlogList({ posts }: { posts: Post[] }) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
            {posts.map((post) => (
                <motion.article
                    key={post.slug}
                    variants={item}
                    className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                    <div>
                        <div className="flex items-center gap-x-4 text-xs">
                            <time dateTime={post.date} className="text-muted-foreground">
                                {post.date}
                            </time>
                        </div>
                        <div className="group relative">
                            <h3 className="mt-3 text-xl font-semibold leading-6 text-card-foreground group-hover:text-primary transition-colors">
                                <Link href={`/blog/${post.slug}`}>
                                    <span className="absolute inset-0" />
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                {post.excerpt}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-x-2 text-sm font-medium text-primary">
                        Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </motion.article>
            ))}
        </motion.div>
    )
}
