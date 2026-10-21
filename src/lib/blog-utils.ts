/**
 * Utility functions for blog post formatting, reading time estimation, and categorization.
 */

export function estimateReadingTime(content?: string, excerpt?: string): string {
    const textToEstimate = content || excerpt || "";
    if (!textToEstimate) return "4 min read";

    // Strip HTML tags and normalize whitespace
    const plainText = textToEstimate.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = plainText.length > 0 ? plainText.split(/\s+/).filter(Boolean).length : 0;

    // Average reading speed is ~200 words per minute with minimum 4 min baseline for technical writing
    const calculatedMinutes = Math.ceil(words / 200);
    const minutes = Math.max(4, calculatedMinutes);
    return `${minutes} min read`;
}

export function formatBlogDate(dateStr?: string): string {
    if (!dateStr) return "";

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr;
        }
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
        }).format(date);
    } catch {
        return dateStr;
    }
}

export function getPostCategory(post: { title?: string; slug?: string; excerpt?: string }): string {
    const text = `${post.title || ""} ${post.slug || ""} ${post.excerpt || ""}`.toLowerCase();

    if (text.includes("typescript") || text.includes("type-safe") || text.includes("generics")) {
        return "TypeScript";
    }
    if (text.includes("performance") || text.includes("optim") || text.includes("latency") || text.includes("speed")) {
        return "Performance";
    }
    if (text.includes("design") || text.includes("interface") || text.includes("ui") || text.includes("ux")) {
        return "Design Systems";
    }
    if (text.includes("security") || text.includes("auth") || text.includes("rls")) {
        return "Security";
    }
    if (text.includes("next.js") || text.includes("react") || text.includes("server components") || text.includes("framework")) {
        return "Frontend Architecture";
    }
    return "Engineering";
}
