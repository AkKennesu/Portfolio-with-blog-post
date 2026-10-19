import { BlogRepository, type BlogPostListItem } from "@/repositories/blog.repo";
import { type Post } from "@/lib/blog";
import { requireAdminAuth } from "@/lib/auth";
import { sanitizeContent } from "@/lib/sanitize";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase letters, numbers, and single hyphens"),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(500, "Excerpt cannot exceed 500 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  content: z.string().min(1, "Content is required"),
});

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;

export class BlogService {
  static async getAllPosts(limit?: number): Promise<BlogPostListItem[]> {
    return await BlogRepository.findAll(limit);
  }

  static async getPostBySlug(slug: string): Promise<Post | undefined> {
    return await BlogRepository.findBySlug(slug);
  }

  static async createPost(rawInput: unknown): Promise<{ id: number; slug: string }> {
    // 1. Enforce authentication
    await requireAdminAuth();

    // 2. Validate input
    const parsed = blogPostInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError("Invalid blog post data", parsed.error.flatten().fieldErrors);
    }

    const { title, slug, excerpt, date, content } = parsed.data;

    // 3. Sanitize HTML content to prevent stored XSS
    const sanitizedHtml = sanitizeContent(content);

    // 4. Persist via repository
    const result = await BlogRepository.create({
      title,
      slug,
      excerpt,
      date,
      content: sanitizedHtml,
    });

    return { id: result.id, slug };
  }

  static async updatePost(id: number, rawInput: unknown): Promise<{ slug: string }> {
    // 1. Enforce authentication
    await requireAdminAuth();

    if (!id || typeof id !== "number") {
      throw new ValidationError("Valid post ID is required for updating");
    }

    // 2. Validate input
    const parsed = blogPostInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError("Invalid blog post data", parsed.error.flatten().fieldErrors);
    }

    const { title, slug, excerpt, date, content } = parsed.data;

    // 3. Sanitize HTML content
    const sanitizedHtml = sanitizeContent(content);

    // 4. Persist update
    await BlogRepository.update(id, {
      title,
      slug,
      excerpt,
      date,
      content: sanitizedHtml,
    });

    return { slug };
  }

  static async deletePost(id: number): Promise<void> {
    await requireAdminAuth();
    if (!id || typeof id !== "number") {
      throw new ValidationError("Valid post ID is required for deletion");
    }
    await BlogRepository.delete(id);
  }

  static async deleteMultiplePosts(ids: number[]): Promise<void> {
    await requireAdminAuth();
    if (!Array.isArray(ids) || ids.length === 0) {
      return;
    }
    await BlogRepository.deleteMany(ids);
  }
}
