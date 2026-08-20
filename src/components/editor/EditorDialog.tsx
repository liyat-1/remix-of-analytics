import { X } from "lucide-react";

/**
 * Section editor docked to the right edge of the workspace. It is a real
 * column (not an overlay) so the live preview stays fully visible while
 * you type.
 */
export function EditorPanel({
  title,
  subtitle,
  open,
  onClose,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <aside
      aria-label={title}
      className="absolute inset-y-0 right-0 z-40 flex w-[min(92vw,26rem)] shrink-0 flex-col border-l border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10 lg:relative lg:w-[24rem] lg:shadow-none"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-zinc-900">{title}</p>
          {subtitle && <p className="mt-0.5 truncate text-[12px] text-zinc-500">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Close section editor"
          title="Close"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="shrink-0 border-t border-zinc-100 bg-white p-4">{footer}</div>}
    </aside>
  );
}
