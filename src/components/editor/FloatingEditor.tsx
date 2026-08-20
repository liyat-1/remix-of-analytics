import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const W = 328;
const MARGIN = 14;

/**
 * A small floating editor card anchored next to the selected block on the
 * live canvas — the same idea as the selection formatting bubble, but for
 * block-level settings.
 */
export function FloatingCard({
  anchor,
  title,
  subtitle,
  onClose,
  children,
}: {
  anchor: DOMRect | null;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return setPos(null);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = Math.min(ref.current?.offsetHeight ?? 420, vh - MARGIN * 2);

    let left = anchor.right + MARGIN;
    if (left + W > vw - MARGIN) left = anchor.left - W - MARGIN;
    left = Math.min(Math.max(MARGIN, left), Math.max(MARGIN, vw - W - MARGIN));

    let top = anchor.top;
    top = Math.min(Math.max(MARGIN, top), Math.max(MARGIN, vh - h - MARGIN));
    setPos({ left, top });
  }, [anchor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!pos) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      className="fixed z-[80] flex max-h-[min(70vh,34rem)] w-[20.5rem] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-2xl shadow-zinc-900/25 backdrop-blur"
      style={{ left: pos.left, top: pos.top }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-zinc-100 px-4 py-3">
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-zinc-900">{title}</span>
          {subtitle && (
            <span className="block truncate text-[11.5px] text-zinc-500">{subtitle}</span>
          )}
        </span>
        <button
          onClick={onClose}
          aria-label="Close block editor"
          className="grid size-7 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X size={15} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}

/** Track the viewport rect of the currently selected block in the preview. */
export function useAnchorRect(selected: string | null, enabled: boolean, deps: unknown[] = []) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled || !selected) {
      setRect(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-block="${selected}"]`);
      setRect((prev) => {
        const next = el ? el.getBoundingClientRect() : null;
        if (!next || !prev) return next;
        const same =
          Math.abs(prev.top - next.top) < 0.5 &&
          Math.abs(prev.left - next.left) < 0.5 &&
          Math.abs(prev.width - next.width) < 0.5 &&
          Math.abs(prev.height - next.height) < 0.5;
        return same ? prev : next;
      });
      raf = window.requestAnimationFrame(measure);
    };
    measure();
    return () => window.cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, enabled, ...deps]);

  return rect;
}