import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react"
import { getPost, getPosts } from "@/lib/blog"
import { sanitizeContent } from "@/lib/sanitize"
import { estimateReadingTime, formatBlogDate, getPostCategory } from "@/lib/blog-utils"
import { BlogShareToolbar } from "@/components/BlogShareToolbar"
import { getSettings } from "@/actions/settings"

export async function generateStaticParams() {
    const posts = await getPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) {
        return {
            title: "Article Not Found | Arn Kenneth",
        }
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            publishedTime: post.date,
            ...(post.cover_image
                ? {
                      images: [
                          {
                              url: post.cover_image,
                              alt: post.title,
                          },
                      ],
                  }
                : {}),
        },
    }
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const [post, allPosts, settings] = await Promise.all([getPost(slug), getPosts(), getSettings()])

    if (!post) {
        notFound()
    }

    const readTime = estimateReadingTime(post.content, post.excerpt)
    const category = getPostCategory(post)
    const formattedDate = formatBlogDate(post.date)

    // Select related articles (excluding the current one)
    const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3)

    return (
        <main className="min-h-screen pt-28 pb-32 sm:pt-36 sm:pb-32 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                {/* Navigation Breadcrumb */}
                <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Link href="/" className="hover:text-primary transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/blog" className="hover:text-primary transition-colors">
                        Journal
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-primary font-medium">{category}</span>
                </nav>

                {/* Back to Blog link */}
                <div className="mb-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Back to all articles</span>
                    </Link>
                </div>

                {/* Article Header */}
                <header className="mb-10 sm:mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
                        <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/30 px-3 py-1 font-semibold text-primary">
                            {category}
                        </span>
                        {formattedDate && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <time dateTime={post.date}>{formattedDate}</time>
                            </div>
                        )}
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{readTime}</span>
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed mb-8">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Author Bar & Share Tools */}
                    <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-linear-to-tr from-primary to-accent p-0.5 flex items-center justify-center">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-bold text-xs text-foreground overflow-hidden">
                                    {settings.logo_image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={settings.logo_image} alt={settings.logo_text || "AK"} className="w-full h-full object-cover" />
                                    ) : (
                                        settings.logo_text || "AK"
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground">Arn Kenneth</h4>
                                <p className="text-xs text-muted-foreground">Software Engineer & Architect</p>
                            </div>
                        </div>

                        <BlogShareToolbar title={post.title} />
                    </div>
                </header>

                {/* Cinematic Article Cover Banner */}
                {post.cover_image && post.cover_image.trim() ? (
                    <div className="relative w-full aspect-video sm:aspect-21/9 rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 shadow-2xl mb-12 bg-muted/40 group">
                        <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            unoptimized={Boolean(post.cover_image?.startsWith("data:"))}
                            sizes="(max-width: 1024px) 100vw, 896px"
                            priority
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                ) : null}

                {/* Reading Surface - Frosted panel ensuring crystal-clear text contrast over 3D particles */}
                <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-6 sm:p-12 md:p-16 shadow-2xl mb-16">
                    <article
                        className="prose prose-invert prose-lg max-w-none 
                            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                            prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6
                            prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                            prose-strong:text-foreground prose-strong:font-semibold
                            prose-code:text-primary prose-code:bg-muted/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/80 prose-pre:rounded-xl prose-pre:p-4
                            prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                            prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:text-foreground/90 prose-li:my-1
                            prose-img:rounded-2xl prose-img:border prose-img:border-border/70 prose-img:shadow-xl prose-img:max-h-145 prose-img:object-cover
                            prose-figure:my-10 prose-figure:mx-auto
                            prose-figcaption:text-center prose-figcaption:text-xs prose-figcaption:text-muted-foreground prose-figcaption:mt-3 prose-figcaption:font-medium"
                        dangerouslySetInnerHTML={{ __html: sanitizeContent(post.content) }}
                    />
                </div>

                {/* Author Bio Card */}
                <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-6 sm:p-8 mb-16 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                        <span className="font-bold text-lg text-primary">AK</span>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-base font-bold text-foreground">Written by Arn Kenneth</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Passionate full-stack developer specializing in scalable cloud architectures, React/Next.js internals, and high-craft UI/UX engineering.
                        </p>
                        <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-primary">
                            <Link href="/#contact" className="hover:underline">
                                Get in touch →
                            </Link>
                            <Link href="/#projects" className="hover:underline">
                                View projects →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                    <div className="pt-12 border-t border-border/60">
                        <h3 className="text-2xl font-bold tracking-tight text-foreground mb-8">
                            Continue Reading
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map((related) => {
                                const relReadTime = estimateReadingTime(related.content, related.excerpt)
                                const relCategory = getPostCategory(related)
                                const relDate = formatBlogDate(related.date)
                                const isDataUri = Boolean(related.cover_image?.startsWith("data:"))

                                return (
                                    <Link
                                        key={related.slug}
                                        href={`/blog/${related.slug}`}
                                        className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:-translate-y-1"
                                    >
                                        <div>
                                            {related.cover_image && related.cover_image.trim() ? (
                                                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4 bg-muted/40 border border-border/40">
                                                    <Image
                                                        src={related.cover_image}
                                                        alt={related.title}
                                                        fill
                                                        unoptimized={isDataUri}
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        loading="lazy"
                                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : null}
                                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                                                <span className="text-primary font-medium">{relCategory}</span>
                                                <div className="flex items-center gap-1.5">
                                                    {relDate && <span>{relDate}</span>}
                                                    <span>•</span>
                                                    <span>{relReadTime}</span>
                                                </div>
                                            </div>
                                            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                                {related.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {related.excerpt}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center text-xs font-semibold text-primary">
                                            <span>Read article</span>
                                            <ArrowRight className="ml-1 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
