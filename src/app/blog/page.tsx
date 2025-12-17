"use client"

import { getPosts, type Post } from "@/lib/blog"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const posts = getPosts()

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

export default function BlogPage() {
    return (
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Blog</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Thoughts on web development, design, and more.
                </p>
            </div>

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
        </div>
    )
}
