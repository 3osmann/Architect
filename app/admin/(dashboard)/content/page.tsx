import { getAllContent } from "@/lib/content";
import ContentForms from "@/components/admin/ContentForms";
import type { ContentKey } from "@/lib/types";

export const dynamic = "force-dynamic";

const KEYS: ContentKey[] = ["hero", "philosophy", "contact", "nav"];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: { section?: string };
}) {
  const content = await getAllContent();
  const initialTab = KEYS.includes(searchParams.section as ContentKey)
    ? (searchParams.section as ContentKey)
    : "hero";

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-white/10 pb-6">
        <span className="admin-label !mb-2">03 — Website content</span>
        <h1 className="text-4xl font-semibold uppercase tracking-[-0.03em] sm:text-5xl">
          Content
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
          Every section of the public site is stored in Postgres (<code className="text-fog">
            settings
          </code>{" "}
          table) and rendered on request — edits here appear on the site immediately, no rebuild
          required.
        </p>
      </div>

      <ContentForms initial={content} initialTab={initialTab} />
    </div>
  );
}
