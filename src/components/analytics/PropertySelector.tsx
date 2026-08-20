import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { PROPERTIES } from "@/lib/portfolio";

/**
 * Scalable multi-property selector: searchable, checkbox based, with
 * select-all / clear-all and a compact "N selected" summary trigger.
 * Designed to stay usable at 500+ properties (virtual-free but windowed list
 * with a fixed max height and cheap filtering).
 */
export function PropertySelector({
  selectedIds,
  onChange,
  disabled,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => setDraft(selectedIds), [selectedIds, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROPERTIES;
    return PROPERTIES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q),
    );
  }, [query]);

  const all = draft.length === PROPERTIES.length;
  const label =
    selectedIds.length === PROPERTIES.length
      ? `All ${PROPERTIES.length} properties`
      : `${selectedIds.length} ${selectedIds.length === 1 ? "property" : "properties"}`;

  const toggle = (id: string) =>
    setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-900 transition-colors hover:border-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 sm:w-[15rem]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-zinc-400">Properties</span>
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown size={14} className="shrink-0 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-[min(22rem,90vw)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-900/5">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3">
            <Search size={14} className="text-zinc-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search properties, brands, regions…"
              aria-label="Search properties"
              className="h-10 w-full bg-transparent text-[13px] outline-none placeholder:text-zinc-400"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="text-zinc-400 hover:text-zinc-700">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 text-[12px]">
            <span className="text-zinc-500">
              {draft.length} of {PROPERTIES.length} selected
            </span>
            <span className="flex gap-3">
              <button
                onClick={() => setDraft(all ? [] : PROPERTIES.map((p) => p.id))}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {all ? "Clear all" : "Select all"}
              </button>
            </span>
          </div>

          <ul role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-8 text-center text-[13px] text-zinc-500">
                No properties match “{query}”.
              </li>
            )}
            {results.map((p) => {
              const on = draft.includes(p.id);
              return (
                <li key={p.id}>
                  <button
                    role="option"
                    aria-selected={on}
                    onClick={() => toggle(p.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-zinc-50"
                  >
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded-[3px] border ${
                        on ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 bg-white"
                      }`}
                    >
                      {on && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-zinc-900">{p.name}</span>
                      <span className="block truncate text-[11px] text-zinc-400">
                        {p.brand} · {p.region}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-3 py-2">
            <button
              onClick={() => setOpen(false)}
              className="h-8 rounded-md px-3 text-[13px] font-medium text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
              className="h-8 rounded-md bg-blue-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
