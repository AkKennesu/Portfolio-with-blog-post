import { dbQuery } from "@/lib/db";
import { posts as fallbackPosts, type Post } from "@/lib/blog";

export interface BlogPostListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

export class BlogRepository {
  /**
   * Fetches list of posts. Excludes heavy 'content' column to optimize bandwidth & DB memory.
   */
  static async findAll(limit?: number): Promise<BlogPostListItem[]> {
    if (!process.env.POSTGRES_URL) {
      return (limit ? fallbackPosts.slice(0, limit) : fallbackPosts) as unknown as BlogPostListItem[];
    }

    try {
      const { rows } = limit
        ? await dbQuery`
            SELECT id, slug, title, excerpt, to_char(date, 'YYYY-MM-DD') as date
            FROM blog_posts
            ORDER BY date DESC
            LIMIT ${limit}
          `
        : await dbQuery`
            SELECT id, slug, title, excerpt, to_char(date, 'YYYY-MM-DD') as date
            FROM blog_posts
            ORDER BY date DESC
          `;

      return rows as unknown as BlogPostListItem[];
    } catch (error) {
      console.error("Database query failed in BlogRepository.findAll:", error);
      return (limit ? fallbackPosts.slice(0, limit) : fallbackPosts) as unknown as BlogPostListItem[];
    }
  }

  /**
   * Fetches single post by slug including full HTML content.
   */
  static async findBySlug(slug: string): Promise<Post | undefined> {
    if (!process.env.POSTGRES_URL) {
      return fallbackPosts.find((p) => p.slug === slug);
    }

    try {
      const { rows } = await dbQuery`
        SELECT id, slug, title, excerpt, to_char(date, 'YYYY-MM-DD') as date, content
        FROM blog_posts
        WHERE slug = ${slug}
        LIMIT 1
      `;

      if (rows.length > 0) {
        return rows[0] as unknown as Post;
      }
    } catch (error) {
      console.error(`Database query failed in BlogRepository.findBySlug (${slug}):`, error);
    }

    return fallbackPosts.find((p) => p.slug === slug);
  }

  static async findById(id: number): Promise<Post | undefined> {
    if (!process.env.POSTGRES_URL) return undefined;
    try {
      const { rows } = await dbQuery`
        SELECT id, slug, title, excerpt, to_char(date, 'YYYY-MM-DD') as date, content
        FROM blog_posts
        WHERE id = ${id}
        LIMIT 1
      `;
      if (rows.length > 0) return rows[0] as unknown as Post;
    } catch (error) {
      console.error(`Database query failed in BlogRepository.findById (${id}):`, error);
    }
    return undefined;
  }

  static async create(post: {
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    content: string;
  }): Promise<{ id: number }> {
    const { rows } = await dbQuery`
      INSERT INTO blog_posts (title, slug, excerpt, date, content)
      VALUES (${post.title}, ${post.slug}, ${post.excerpt}, ${post.date}::date, ${post.content})
      RETURNING id
    `;
    return { id: Number(rows[0].id) };
  }

  static async update(
    id: number,
    post: {
      title: string;
      slug: string;
      excerpt: string;
      date: string;
      content: string;
    }
  ): Promise<void> {
    await dbQuery`
      UPDATE blog_posts
      SET 
        title = ${post.title},
        slug = ${post.slug},
        excerpt = ${post.excerpt},
        date = ${post.date}::date,
        content = ${post.content},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  }

  static async delete(id: number): Promise<void> {
    await dbQuery`DELETE FROM blog_posts WHERE id = ${id}`;
  }

  /**
   * Batch deletion using ANY(${ids}) to eliminate N+1 round-trips.
   */
  static async deleteMany(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    await dbQuery`DELETE FROM blog_posts WHERE id = ANY(${ids}::bigint[])`;
  }
}
