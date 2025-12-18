export type Post = {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: "modern-web-development",
    title: "The State of Modern Web Development",
    excerpt: "Exploring the latest trends in Next.js, Tailwind, and the React ecosystem.",
    date: "2024-03-15",
    content: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <h2>The Rise of Server Components</h2>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    `,
  },
  {
    slug: "designing-better-interfaces",
    title: "Designing Better Interfaces",
    excerpt: "Key principles for creating intuitive and beautiful user experiences.",
    date: "2024-03-10",
    content: `
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
      <h2>Typography Matters</h2>
      <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
    `,
  },
  {
    slug: "why-typescript",
    title: "Why You Should Use TypeScript",
    excerpt: "A deep dive into the benefits of type safety in large JavaScript applications.",
    date: "2024-03-05",
    content: `
      <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
      <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    `,
  },
];

import { sql } from "./db"

export async function getPosts(): Promise<Post[]> {
  try {
    if (!process.env.POSTGRES_URL) {
      return posts;
    }
    const { rows } = await sql`SELECT * FROM blog_posts ORDER BY date DESC`
    if (rows.length > 0) return rows as unknown as Post[]
  } catch (error) {
    console.error("Failed to fetch posts from DB, using fallback data", error)
  }
  return posts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  try {
    if (!process.env.POSTGRES_URL) {
      return posts.find((p) => p.slug === slug);
    }
    const { rows } = await sql`SELECT * FROM blog_posts WHERE slug = ${slug}`
    if (rows.length > 0) return rows[0] as unknown as Post
  } catch (error) {
    console.error(`Failed to fetch post ${slug} from DB, using fallback data`, error)
  }
  return posts.find((p) => p.slug === slug);
}
