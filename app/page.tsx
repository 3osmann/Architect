import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import ProjectGrid from "@/components/ProjectGrid";
import Contact from "@/components/Contact";
import Preloader from "@/components/Preloader";
import { getAllContent, getPublishedProjects } from "@/lib/content";

// Content comes from Postgres on every request — no static caching.
export const dynamic = "force-dynamic";

export default async function Home() {
  // Reads settings + projects; falls back to built-in defaults if the DB is down.
  const [content, projects] = await Promise.all([getAllContent(), getPublishedProjects()]);

  return (
    <main className="relative overflow-clip">
      <Preloader />
      <Navbar content={content.nav} />
      <Hero content={content.hero} />
      <Philosophy content={content.philosophy} />
      <ProjectGrid projects={projects} />
      <Contact content={content.contact} />
    </main>
  );
}
