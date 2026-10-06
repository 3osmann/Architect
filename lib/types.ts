/* ------------------------------------------------------------------
   Shared content + database types
------------------------------------------------------------------ */

export type Project = {
  id: number;
  title: string;
  location: string;
  year: string;
  category: string;
  /** Tailwind aspect class → masonry rhythm */
  ratio: string;
  /** Tailwind gradient classes → placeholder artwork */
  tone: string;
  published: boolean;
  sort_order: number;
};

/** Shape accepted by create/update APIs (no db id) */
export type ProjectInput = Omit<Project, "id">;

export type NavLink = { label: string; href: string };
export type Stat = { value: string; label: string };
export type Principle = { n: string; title: string; text: string };
export type Social = { label: string; href: string };

export type HeroContent = {
  eyebrow: string;
  /** Three display lines */
  lines: [string, string, string];
  sub: string;
  cta: string;
  coords: string;
  metaLeft: string;
  metaRight: string;
};

export type PhilosophyContent = {
  label: string;
  /** Studio mono block — array of lines */
  studio: string[];
  heading: [string, string, string];
  figCaption: string;
  intro: string;
  body: string;
  stats: Stat[];
  principles: Principle[];
};

export type ContactContent = {
  label: string;
  heading: [string, string, string];
  email: string;
  phone: string;
  address: string;
  hours: string;
  socials: Social[];
  copyright: string;
  coords: string;
};

export type NavContent = {
  brand: string;
  brandMark: string;
  cta: string;
  links: NavLink[];
};

/** One JSON document per key in the `settings` table */
export type SiteContent = {
  hero: HeroContent;
  philosophy: PhilosophyContent;
  contact: ContactContent;
  nav: NavContent;
};

export type ContentKey = keyof SiteContent;
