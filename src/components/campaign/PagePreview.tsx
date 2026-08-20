import type { PageConfig, PageKey } from "@/lib/experience";

const SAMPLE: Record<string, string> = {
  "{{first_name}}": "Amelia",
  "{{last_name}}": "Novak",
  "{{hotel}}": "The Harbour House",
  "{{checkout_date}}": "12 June",
  "{{loyalty_tier}}": "Gold",
};

export function fillTags(v: string) {
  return v.replace(/\{\{[a-z_]+\}\}/g, (m) => SAMPLE[m] ?? m);
}

/**
 * Realistic rendering of a guest-facing page (landing or success), used in
 * both the experience editor and the end-to-end preview.
 */
export function PagePreview({
  page,
  kind,
  brand,
  width = 720,
}: {
  page: PageConfig;
  kind: PageKey;
  brand: string;
  width?: number;
}) {
  const success = kind === "success";
  return (
    <div
      style={{ width }}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm shadow-zinc-900/5"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <span className="flex gap-1.5">
          {["#f87171", "#fbbf24", "#34d399"].map((c) => (
            <span key={c} className="size-2 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="ml-2 flex-1 truncate rounded bg-white px-2 py-1 text-[10.5px] text-zinc-400">
          {page.ctaUrl || "https://book.directful.com"}
        </span>
      </div>

      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-3">
        <span className="text-[12px] font-semibold tracking-tight text-zinc-900">{brand}</span>
        <span className="text-[10.5px] uppercase tracking-[0.16em] text-zinc-400">
          {success ? "Confirmed" : "Direct booking"}
        </span>
      </div>

      <div className="px-8 py-10 text-center">
        {success && (
          <span className="mx-auto mb-4 grid size-10 place-items-center rounded-full bg-emerald-50 text-[17px] text-emerald-600">
            ✓
          </span>
        )}
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-zinc-900">
          {fillTags(page.headline) || (
            <span className="text-zinc-300">Add a headline</span>
          )}
        </h1>
        {page.subheadline && (
          <p className="mx-auto mt-2 max-w-md text-[13px] text-zinc-500">
            {fillTags(page.subheadline)}
          </p>
        )}
        {page.body && (
          <p className="mx-auto mt-5 max-w-lg text-[13px] leading-relaxed text-zinc-600">
            {fillTags(page.body)}
          </p>
        )}
        <div className="mt-7">
          <span className="inline-flex h-11 items-center rounded-lg bg-blue-600 px-6 text-[13px] font-semibold text-white">
            {page.ctaLabel || "Add a button"}
          </span>
        </div>
        {page.footnote && (
          <p className="mt-3 text-[11px] text-zinc-400">{fillTags(page.footnote)}</p>
        )}
      </div>

      <div className="border-t border-zinc-100 px-6 py-3 text-center text-[10.5px] text-zinc-400">
        {brand} · Powered by Directful
      </div>
    </div>
  );
}
