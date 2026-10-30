import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Timeline } from "@/components/Timeline";
import { BlogPreview } from "@/components/BlogPreview";
import { Contact } from "@/components/Contact";

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
      <Hero settings={settings} />
      <About settings={settings} />
      <Skills />
      <Projects />
      <Timeline certificates={certificates} settings={settings} />
      <BlogPreview posts={latestPosts} />
      <Contact settings={settings} />
    </div>
  );
}
