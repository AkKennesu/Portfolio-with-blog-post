import { getPost, getPosts } from "@/lib/blog"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export async function generateStaticParams() {
    const posts = await getPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) {
        notFound()
    }

    return (
        <article className="container mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
            <Link
                href="/blog"
                className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
            </Link>

            <header className="mb-10 text-center">
                <time dateTime={post.date} className="text-sm text-muted-foreground">
                    {post.date}
                </time>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {post.title}
                </h1>
            </header>

            <div
                className="prose prose-lg dark:prose-invert mx-auto"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
    )
}
