import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  hint?: string;
};

/**
 * Polished listbox dropdown. Replaces native <select> so options can carry
 * descriptions, previews and check marks while staying keyboard accessible.
 */
export function Select<T extends string | number>({
  value,
  options,
  onChange,
  placeholder = "Select…",
  ariaLabel,
  size = "md",
  align = "left",
  renderValue,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  ariaLabel?: string;
  size?: "sm" | "md";
  align?: "left" | "right";
  renderValue?: (o: SelectOption<T> | undefined) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  const commit = (v: T) => {
    onChange(v);
    setOpen(false);
  };

  const h = size === "sm" ? "h-8 text-[12px]" : "h-10 text-[13px]";

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex ${h} w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left font-medium text-zinc-900 transition-colors ${
          open
            ? "border-zinc-900 ring-2 ring-zinc-900/10"
            : "border-zinc-200 hover:border-zinc-300"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {renderValue ? renderValue(current) : (current?.label ?? <span className="text-zinc-400">{placeholder}</span>)}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") setActive((i) => Math.min(options.length - 1, i + 1));
            if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
            if (e.key === "Enter") commit(options[active].value);
          }}
          className={`absolute z-[80] mt-1.5 max-h-72 w-full min-w-[13rem] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl shadow-zinc-900/10 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <button
                key={String(o.value)}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(o.value)}
                className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  i === active ? "bg-zinc-100" : ""
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-zinc-900">
                    {o.label}
                  </span>
                  {o.hint && (
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-zinc-500">
                      {o.hint}
                    </span>
                  )}
                </span>
                {selected && <Check size={15} className="mt-0.5 shrink-0 text-zinc-900" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
