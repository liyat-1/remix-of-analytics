import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatMetric, type KpiDef, type KpiResult, type MetricView } from "@/lib/portfolio";
import { AverageTooltip } from "./MetricViewToggle";

/**
 * Executive KPI card.
 *
 * Hierarchy: label → primary metric → delta → a hairline-separated benchmark
 * strip carrying the per-property average. The average never competes with the
 * total: it lives in a tinted footer at a smaller type scale.
 */
export function KpiCard({
  def,
  result,
  view,
  propertyCount,
}: {
  def: KpiDef;
  result: KpiResult;
  view: MetricView;
  propertyCount: number;
}) {
  const showTotal = view !== "average";
  const showAvg = view !== "total" && propertyCount > 1;
  const up = result.delta >= 0;

  const totalText = formatMetric(result.total, def.format);
  const avgText = formatMetric(result.average, def.averageFormat ?? "decimal");

  return (
    <article className="group flex flex-col rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300">
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[12.5px] font-medium text-zinc-500">{def.label}</h3>
          <span
            className={`inline-flex items-center gap-0.5 text-[11.5px] font-medium tabular-nums ${
              up ? "text-emerald-600" : "text-rose-600"
            }`}
            aria-label={`${up ? "up" : "down"} ${Math.abs(result.delta)} percent versus previous period`}
          >
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(result.delta)}%
          </span>
        </div>

        {showTotal ? (
          <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-zinc-900 tabular-nums">
            {totalText}
          </p>
        ) : (
          <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-zinc-900 tabular-nums">
            {avgText}
          </p>
        )}
        <p className="mt-2 text-[11.5px] uppercase tracking-[0.08em] text-zinc-400">
          {showTotal ? "Total portfolio" : "Average / property"}
        </p>
      </div>

      {showAvg && showTotal && (
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/70 px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11.5px] text-zinc-500">
            Average / property
            <AverageTooltip count={propertyCount} />
          </span>
          <span className="text-[14px] font-semibold text-zinc-900 tabular-nums">{avgText}</span>
        </div>
      )}
      {!showTotal && (
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/70 px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11.5px] text-zinc-500">
            Across {propertyCount} properties
            <AverageTooltip count={propertyCount} />
          </span>
          <span className="text-[14px] font-semibold text-zinc-900 tabular-nums">
            {formatMetric(result.total, def.format)} total
          </span>
        </div>
      )}
    </article>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
      <div className="mt-4 h-7 w-32 animate-pulse rounded bg-zinc-100" />
      <div className="mt-3 h-3 w-20 animate-pulse rounded bg-zinc-100" />
    </div>
  );
}
