import { Metadata } from "next"
import { getPosts } from "@/lib/blog"
import { BlogList } from "@/components/BlogList"

export const metadata: Metadata = {
    title: "Engineering Journal & Articles | Arn Kenneth",
    description: "Insights on full-stack architecture, high-performance web applications, interface craftsmanship, and modern software design.",
}

export default async function BlogPage() {
    const posts = await getPosts()

    return (
        <main className="min-h-screen pt-28 pb-24 sm:pt-36 sm:pb-32 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Page Header */}
                <header className="mb-14 sm:mb-16">
                    <span className="text-xs font-semibold tracking-widest text-primary uppercase mb-3 block">
                        Writing & Research
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-5">
                        Engineering Journal
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                        Reflections, technical deep-dives, and practical architectural patterns from building scalable web applications.
                    </p>
                </header>

                {/* Interactive Blog List Component */}
                <BlogList posts={posts} />
            </div>
        </main>
    )
}
