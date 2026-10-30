export type Post = {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string;
  cover_image?: string | null;
};

export const posts: Post[] = [
  {
    slug: "modern-web-development",
    title: "The State of Modern Web Development",
    excerpt: "Exploring the latest trends in Next.js, Tailwind, and the React ecosystem.",
    date: "2024-03-15",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      
      <figure>
        <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80" alt="Code workstation with modern display" />
        <figcaption>A modern developer workflow leveraging high-speed compilers and edge infrastructure</figcaption>
      </figure>

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
    cover_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
      
      <figure>
        <img src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80" alt="Interface design sketches and prototypes" />
        <figcaption>Wireframing visual hierarchy and deliberate typography before implementation</figcaption>
      </figure>

      <h2>Typography Matters</h2>
      <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
    `,
  },
  {
    slug: "why-typescript",
    title: "Why You Should Use TypeScript",
    excerpt: "A deep dive into the benefits of type safety in large JavaScript applications.",
    date: "2024-03-05",
    cover_image: "https://images.unsplash.com/photo-1516116211227-bbc0748b64e5?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
      <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    `,
  },
];

import { BlogRepository } from "@/repositories/blog.repo";
import { unstable_cache } from "next/cache";

export const getPosts = unstable_cache(
  async (): Promise<Post[]> => {
    const list = await BlogRepository.findAll();
    return list as unknown as Post[];
  },
  ["blog-posts-list"],
  {
    tags: ["blog-posts", "admin-unified-data"],
    revalidate: 300,
  }
);

export const getPost = unstable_cache(
  async (slug: string): Promise<Post | undefined> => {
    return await BlogRepository.findBySlug(slug);
  },
  ["blog-post-by-slug"],
  {
    tags: ["blog-posts", "admin-unified-data"],
    revalidate: 300,
  }
);
