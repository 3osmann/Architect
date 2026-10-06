import type { SiteContent, Project } from "./types";

/**
 * Built-in fallback content.
 * Used when the database is unreachable or a settings key has never been saved,
 * so the public site can never render empty.
 */
export const defaultContent: SiteContent = {
  hero: {
    eyebrow: "Est. 1998 — Architecture & Urbanism",
    lines: ["SHAPING", "SILENCE", "INTO FORM"],
    sub: "A studio working in mass, light and negative space — buildings that hold their silence.",
    cta: "View Portfolio",
    coords: "51.9244° N / 4.4777° E",
    metaLeft: "Scroll",
    metaRight: "WebGL / Real-time",
  },
  philosophy: {
    label: "01 — Philosophy",
    studio: ["ATELIER MONOLITH", "ROTTERDAM · TOKYO", "EST. MCMXCVIII"],
    heading: ["Architecture is", "the discipline of", "restraint."],
    figCaption: "Fig. 01 — Section study",
    intro:
      "We design buildings the way a sculptor approaches stone: by removal. Every project begins with a site, a climate and a constraint — and ends when nothing else can be taken away without breaking the idea.",
    body:
      "Since 1998 the studio has worked across housing, cultural and civic architecture, pursuing a single goal — structures that age with dignity and ask for nothing they cannot give back.",
    stats: [
      { value: "27", label: "Years in practice" },
      { value: "64", label: "Completed works" },
      { value: "11", label: "International awards" },
    ],
    principles: [
      { n: "01", title: "Mass", text: "Volume before ornament. Weight is the first language of a building." },
      { n: "02", title: "Light", text: "Daylight is treated as a structural material — carved, not added." },
      { n: "03", title: "Void", text: "What we leave unbuilt defines what we build." },
    ],
  },
  contact: {
    label: "03 — Contact",
    heading: ["Let's build", "something", "permanent."],
    email: "studio@ateliermonolith.com",
    phone: "+31 10 240 8812",
    address: "Keileweg 18\n3029 BS Rotterdam, NL",
    hours: "Mon—Fri\n09:00—18:00 CET",
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
      { label: "Behance", href: "https://behance.net" },
      { label: "Are.na", href: "https://are.na" },
    ],
    copyright: "© 2026 Atelier Monolith",
    coords: "51.9244° N / 4.4777° E",
  },
  nav: {
    brand: "Atelier",
    brandMark: "MONOLITH",
    cta: "Start a project",
    links: [
      { label: "Studio", href: "#philosophy" },
      { label: "Work", href: "#work" },
      { label: "Contact", href: "#contact" },
    ],
  },
};

/** Seed projects — identical to the original hard-coded gallery. */
export const defaultProjects: Omit<Project, "id">[] = [
  { title: "Monolith Tower", location: "Rotterdam, NL", year: "2025", category: "Mixed-Use / High-Rise", ratio: "aspect-[4/5]", tone: "from-zinc-800 via-zinc-700 to-neutral-900", published: true, sort_order: 1 },
  { title: "Concrete Pavilion", location: "Kyoto, JP", year: "2024", category: "Cultural", ratio: "aspect-square", tone: "from-neutral-700 via-zinc-800 to-black", published: true, sort_order: 2 },
  { title: "North Atelier", location: "Oslo, NO", year: "2024", category: "Residential", ratio: "aspect-[3/4]", tone: "from-slate-700 via-neutral-800 to-zinc-900", published: true, sort_order: 3 },
  { title: "Grid House", location: "Lisbon, PT", year: "2023", category: "Private Residence", ratio: "aspect-[4/5]", tone: "from-zinc-900 via-neutral-700 to-zinc-800", published: true, sort_order: 4 },
  { title: "Museum of Silence", location: "Basel, CH", year: "2023", category: "Museum / Public", ratio: "aspect-square", tone: "from-neutral-800 via-zinc-700 to-black", published: true, sort_order: 5 },
  { title: "Sector 9 Offices", location: "Berlin, DE", year: "2022", category: "Workplace", ratio: "aspect-[3/4]", tone: "from-zinc-800 via-black to-zinc-700", published: true, sort_order: 6 },
  { title: "Strata Bridge", location: "Seoul, KR", year: "2022", category: "Infrastructure", ratio: "aspect-[4/5]", tone: "from-slate-800 via-zinc-900 to-neutral-800", published: true, sort_order: 7 },
  { title: "Void Chapel", location: "Marfa, US", year: "2021", category: "Sacred / Chapel", ratio: "aspect-square", tone: "from-neutral-900 via-slate-700 to-black", published: true, sort_order: 8 },
];

/** Presets offered in the admin project form */
export const RATIO_OPTIONS = [
  { value: "aspect-[4/5]", label: "Portrait 4:5" },
  { value: "aspect-[3/4]", label: "Portrait 3:4" },
  { value: "aspect-square", label: "Square 1:1" },
] as const;

export const TONE_OPTIONS = [
  { value: "from-zinc-800 via-zinc-700 to-neutral-900", label: "Zinc" },
  { value: "from-neutral-700 via-zinc-800 to-black", label: "Neutral" },
  { value: "from-slate-700 via-neutral-800 to-zinc-900", label: "Slate" },
  { value: "from-zinc-900 via-neutral-700 to-zinc-800", label: "Graphite" },
  { value: "from-neutral-800 via-zinc-700 to-black", label: "Carbon" },
  { value: "from-slate-800 via-zinc-900 to-neutral-800", label: "Steel" },
] as const;
