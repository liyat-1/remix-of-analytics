import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export type MenuItem = {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separated?: boolean;
};

/** Subtle three-dot action menu used across the campaign builder. */
export function StepMenu({ items, label = "Step actions" }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`grid size-7 place-items-center text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 ${
          open ? "bg-zinc-100 text-zinc-700" : ""
        }`}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {items.map((it) => (
            <div key={it.label}>
              {it.separated && <div className="my-1 h-px bg-zinc-100" />}
              <button
                role="menuitem"
                disabled={it.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  it.onSelect();
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  it.destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {it.icon && <it.icon size={14} />}
                {it.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
