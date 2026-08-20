import { Info } from "lucide-react";
import type { MetricView } from "@/lib/portfolio";

const OPTIONS: { value: MetricView; label: string }[] = [
  { value: "both", label: "Both" },
  { value: "total", label: "Total" },
  { value: "average", label: "Average" },
];

/** Segmented metric-view switcher. Hidden logic: disabled for single property. */
export function MetricViewToggle({
  value,
  onChange,
  disabled,
}: {
  value: MetricView;
  onChange: (v: MetricView) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Metric view"
      className={`inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white p-0.5 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {OPTIONS.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`h-8 rounded-[4px] px-3 text-[13px] font-medium transition-colors ${
              on ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
            } disabled:cursor-not-allowed`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Small inline explainer used next to average values. */
export function AverageTooltip({ count }: { count: number }) {
  return (
    <span className="group relative inline-flex items-center">
      <Info size={12} className="text-zinc-300 transition-colors group-hover:text-zinc-500" aria-hidden />
      <span className="sr-only">
        Average is calculated across the {count} selected properties.
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-56 -translate-x-1/2 rounded-md bg-zinc-900 px-3 py-2 text-[11.5px] leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        Average is calculated across the {count} selected properties.
      </span>
    </span>
  );
}
