import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";

// Dynamically import below-the-fold components for code splitting & lazy loading
const Projects = dynamic(() => import("@/components/Projects").then((mod) => mod.Projects));
const Timeline = dynamic(() => import("@/components/Timeline").then((mod) => mod.Timeline));
const BlogPreview = dynamic(() => import("@/components/BlogPreview").then((mod) => mod.BlogPreview));
const Contact = dynamic(() => import("@/components/Contact").then((mod) => mod.Contact));

import { getPosts } from "@/lib/blog";
import { getCertificates } from "@/lib/certificates";
import { getSettings } from "@/actions/settings";

export default async function Home() {
  const [posts, certificates, settings] = await Promise.all([
    getPosts(),
    getCertificates(),
    getSettings()
  ]);
  const latestPosts = posts.slice(0, 3); // Only show top 3 on home

  return (
    <div className="flex flex-col">
      <Hero />
      <About settings={settings} />
      <Skills />
      <Projects />
      <Timeline certificates={certificates} />
      <BlogPreview posts={latestPosts} />
      <Contact settings={settings} />
    </div>
  );
}
