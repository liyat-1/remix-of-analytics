import { ChevronDown } from "lucide-react";

/** Numbered, collapsible rail section shared across the structured builder and
 * the campaign wizard. Sticky header with a light chevron affordance. */
export function RailSection({
  index,
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  index: number | string;
  title: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-zinc-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="sticky top-0 z-10 flex w-full items-center gap-2.5 border-b border-zinc-100 bg-white/95 px-4 py-2.5 text-left backdrop-blur transition-colors hover:bg-zinc-50"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-zinc-900">{title}</span>
          {hint && (
            <span className="block truncate text-[11.5px] text-zinc-400">{hint}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && children}
    </section>
  );
}
