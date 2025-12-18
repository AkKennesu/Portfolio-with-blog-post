import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Timeline } from "@/components/Timeline";
import { BlogPreview } from "@/components/BlogPreview";
import { Contact } from "@/components/Contact";

import { getPosts } from "@/lib/blog";
import { getCertificates } from "@/lib/certificates";

export default async function Home() {
  const [posts, certificates] = await Promise.all([
    getPosts(),
    getCertificates()
  ]);
  const latestPosts = posts.slice(0, 3); // Only show top 3 on home

  return (
    <div className="flex flex-col">
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Timeline certificates={certificates} />
      <BlogPreview posts={latestPosts} />
      <Contact />
    </div>
  );
}
