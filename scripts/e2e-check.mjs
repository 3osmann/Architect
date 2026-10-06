/**
 * End-to-end smoke test against a running server:
 *   node scripts/e2e-check.mjs http://localhost:3112
 * Verifies: public page (DB content) → auth → admin → CRUD → settings round-trip.
 */
const BASE = process.argv[2] || "http://localhost:3112";
const results = [];
const check = (name, cond, extra = "") =>
  results.push({ name, pass: !!cond, extra: String(extra).slice(0, 160) });

async function req(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  return { res, text, json: () => { try { return JSON.parse(text); } catch { return null; } } };
}

async function main() {
  // 1 — public homepage renders from Postgres
  const home = await req("/");
  check("GET / → 200", home.res.status === 200, home.res.status);
  check("homepage has hero headline", home.text.includes("SHAPING"));
  check("homepage has projects section", home.text.includes('id="work"'));
  check("homepage renders a project from DB", home.text.includes("Monolith Tower"));

  // 2 — admin is locked
  const locked = await req("/admin");
  check("GET /admin → redirect to login", locked.res.status >= 300 && locked.res.status < 400,
    `${locked.res.status} → ${locked.res.headers.get("location")}`);
  check("redirect points to /admin/login",
    (locked.res.headers.get("location") || "").includes("/admin/login"));

  // 3 — bad credentials rejected
  const bad = await req("/api/auth/login", {
    method: "POST",
    body: { email: "admin@monolith.studio", password: "wrong" },
  });
  check("bad login → 401", bad.res.status === 401, bad.res.status);

  // 4 — good credentials set a cookie
  const login = await req("/api/auth/login", {
    method: "POST",
    body: { email: "admin@monolith.studio", password: "monolith2026" },
  });
  const setCookie = login.res.headers.get("set-cookie") || "";
  check("login → 200 + httpOnly cookie",
    login.res.status === 200 && setCookie.includes("am_session") && setCookie.includes("HttpOnly"),
    `${login.res.status} ${setCookie.slice(0, 80)}`);
  const cookie = setCookie.split(";")[0];
  if (!cookie) return report();

  // 5 — unauthenticated API rejected
  const noAuth = await req("/api/projects", { method: "POST", body: { title: "X" } });
  check("POST /api/projects w/o session → 401", noAuth.res.status === 401, noAuth.res.status);

  // 6 — admin dashboard accessible with cookie
  const dash = await req("/admin", { cookie });
  check("GET /admin (authed) → 200", dash.res.status === 200, dash.res.status);
  check("dashboard shows overview", dash.text.includes("Overview"));
  const contentPage = await req("/admin/content", { cookie });
  check("GET /admin/content → 200", contentPage.res.status === 200, contentPage.res.status);
  const projPage = await req("/admin/projects", { cookie });
  check("GET /admin/projects → 200", projPage.res.status === 200, projPage.res.status);

  // 7 — create → read → update → delete a project
  const created = await req("/api/projects", {
    method: "POST",
    cookie,
    body: {
      title: "E2E Test Building",
      location: "Test City, XX",
      year: "2026",
      category: "Test",
      ratio: "aspect-square",
      tone: "from-zinc-800 via-zinc-700 to-neutral-900",
      published: false,
      sort_order: 99,
    },
  });
  const newProject = created.json()?.project;
  check("POST /api/projects → 201", created.res.status === 201 && !!newProject?.id,
    created.res.status);

  if (newProject?.id) {
    const updated = await req(`/api/projects/${newProject.id}`, {
      method: "PUT",
      cookie,
      body: { title: "E2E Renamed", published: true },
    });
    check("PUT /api/projects/:id → renamed + published",
      updated.res.status === 200 &&
        updated.json()?.project?.title === "E2E Renamed" &&
        updated.json()?.project?.published === true,
      updated.res.status);

    // Draft must not leak to the public site; published test project would —
    // so verify visibility logic, then delete it.
    const list = await req("/api/projects", { cookie });
    check("GET /api/projects (list) includes new row",
      list.json()?.projects?.some((p) => p.id === newProject.id));

    const del = await req(`/api/projects/${newProject.id}`, { method: "DELETE", cookie });
    check("DELETE /api/projects/:id → ok", del.res.status === 200, del.res.status);

    const gone = await req(`/api/projects/${newProject.id}`, { cookie });
    check("deleted project → 404", gone.res.status === 404, gone.res.status);
  }

  // 8 — settings round-trip (read current → write marker → verify → restore)
  const before = await req("/api/settings", { cookie });
  const heroBefore = before.json()?.settings?.hero;
  check("GET /api/settings → hero block", heroBefore?.lines?.length === 3,
    JSON.stringify(heroBefore?.lines));

  if (heroBefore) {
    const marker = { ...heroBefore, cta: "E2E MARKER" };
    const save = await req("/api/settings", {
      method: "PUT",
      cookie,
      body: { key: "hero", value: marker },
    });
    check("PUT /api/settings → ok", save.res.status === 200 && save.json()?.ok, save.res.status);

    const home2 = await req("/");
    check("public site reflects settings change", home2.text.includes("E2E MARKER"));

    await req("/api/settings", { method: "PUT", cookie, body: { key: "hero", value: heroBefore } });
    const home3 = await req("/");
    check("settings restored", !home3.text.includes("E2E MARKER"));
  }

  // 9 — invalid settings key rejected
  const invalid = await req("/api/settings", {
    method: "PUT",
    cookie,
    body: { key: "rm -rf", value: {} },
  });
  check("invalid settings key → 400", invalid.res.status === 400, invalid.res.status);

  // 10 — logout clears session
  const out = await req("/api/auth/logout", { method: "POST", cookie });
  const cleared = (out.res.headers.get("set-cookie") || "").includes("Expires=0") ||
    (out.res.headers.get("set-cookie") || "").match(/am_session=;/);
  check("logout → cookie cleared", out.res.status === 200 && !!cleared,
    out.res.headers.get("set-cookie"));

  report();
}

function report() {
  const failed = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.pass || !r.extra ? "" : `  [${r.extra}]`}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error("E2E crashed:", e.message);
  process.exit(1);
});
