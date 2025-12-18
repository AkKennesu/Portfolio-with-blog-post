"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { EncryptButton } from "@/components/EncryptButton"
import { type Post } from "@/lib/blog"

export function BlogPreview({ posts }: { posts: Post[] }) {
    const router = useRouter()

    return (
        <section id="blog" className="py-24 sm:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Latest Insights</h2>
                    <p className="text-muted-foreground max-w-[800px]">
                        Thoughts on technology, design, and building digital products.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center mb-12">
                    {posts.map((post, index) => (
                        <div key={index} className={`blog-box card-${index % 3}`}>
                            <span></span>
                            <div className="blog-content">
                                <h2 className="uppercase text-[10px] tracking-widest text-primary font-bold mb-2">Insight</h2>
                                <p>{post.title.substring(0, 50)}...</p>
                                <a href={`/blog/${post.slug}`}>Read More</a>
                            </div>
                        </div>
                    ))}
                </div>

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
