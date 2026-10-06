/**
 * DB setup + seed:  node scripts/db-setup.mjs
 * Creates tables (idempotent), seeds content/settings, creates the admin user.
 */
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Load .env.local manually (node has no built-in .env loader)
const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@monolith.studio";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "monolith2026";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

const hash = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  location    TEXT NOT NULL DEFAULT '',
  year        TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT '',
  ratio       TEXT NOT NULL DEFAULT 'aspect-[4/5]',
  tone        TEXT NOT NULL DEFAULT 'from-zinc-800 via-zinc-700 to-neutral-900',
  published   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

// Defaults mirrored from lib/defaults.ts so a fresh DB renders identically.
const DEFAULT_PROJECTS = [
  ["Monolith Tower", "Rotterdam, NL", "2025", "Mixed-Use / High-Rise", "aspect-[4/5]", "from-zinc-800 via-zinc-700 to-neutral-900"],
  ["Concrete Pavilion", "Kyoto, JP", "2024", "Cultural", "aspect-square", "from-neutral-700 via-zinc-800 to-black"],
  ["North Atelier", "Oslo, NO", "2024", "Residential", "aspect-[3/4]", "from-slate-700 via-neutral-800 to-zinc-900"],
  ["Grid House", "Lisbon, PT", "2023", "Private Residence", "aspect-[4/5]", "from-zinc-900 via-neutral-700 to-zinc-800"],
  ["Museum of Silence", "Basel, CH", "2023", "Museum / Public", "aspect-square", "from-neutral-800 via-zinc-700 to-black"],
  ["Sector 9 Offices", "Berlin, DE", "2022", "Workplace", "aspect-[3/4]", "from-zinc-800 via-black to-zinc-700"],
  ["Strata Bridge", "Seoul, KR", "2022", "Infrastructure", "aspect-[4/5]", "from-slate-800 via-zinc-900 to-neutral-800"],
  ["Void Chapel", "Marfa, US", "2021", "Sacred / Chapel", "aspect-square", "from-neutral-900 via-slate-700 to-black"],
];

const DEFAULT_SETTINGS = {
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

async function main() {
  const client = await pool.connect();
  try {
    console.log("→ Connecting to Neon…");
    await client.query("SELECT 1");

    console.log("→ Creating tables…");
    await client.query(SCHEMA);

    console.log("→ Seeding projects…");
    const count = await client.query("SELECT count(*)::int AS n FROM projects");
    if (count.rows[0].n === 0) {
      for (let i = 0; i < DEFAULT_PROJECTS.length; i++) {
        const [title, location, year, category, ratio, tone] = DEFAULT_PROJECTS[i];
        await client.query(
          `INSERT INTO projects (title, location, year, category, ratio, tone, published, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,TRUE,$7)`,
          [title, location, year, category, ratio, tone, i + 1]
        );
      }
      console.log(`  seeded ${DEFAULT_PROJECTS.length} projects`);
    } else {
      console.log(`  ${count.rows[0].n} projects already exist — skipped`);
    }

    console.log("→ Seeding settings…");
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO NOTHING`,
        [key, JSON.stringify(value)]
      );
    }

    console.log("→ Ensuring admin user…");
    const existing = await client.query("SELECT id FROM admin_users WHERE email = $1", [
      ADMIN_EMAIL,
    ]);
    if (existing.rowCount === 0) {
      await client.query("INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)", [
        ADMIN_EMAIL,
        hash(ADMIN_PASSWORD),
      ]);
      console.log(`  created ${ADMIN_EMAIL}`);
    } else {
      console.log("  admin already exists — skipped");
    }

    console.log("\n✓ Database ready.");
    console.log(`  login: ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}`);
    console.log("  (change the password from Admin → Account after first login)");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("✗ Setup failed:", err.message);
  process.exit(1);
});
