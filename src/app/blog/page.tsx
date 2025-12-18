import { getPosts } from "@/lib/blog"
import { BlogList } from "@/components/BlogList"

export default async function BlogPage() {
    const posts = await getPosts()

    return (
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Blog</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Thoughts on web development, design, and more.
                </p>
            </div>

            <BlogList posts={posts} />
        </div>
    )
}
