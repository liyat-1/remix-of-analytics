import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnalyticsShell, FilterBar } from "@/components/analytics/AnalyticsShell";
import { KpiCard, KpiCardSkeleton } from "@/components/analytics/KpiCard";
import { AverageTooltip } from "@/components/analytics/MetricViewToggle";
import { aggregate, formatMetric, KPIS } from "@/lib/portfolio";
import { useAnalyticsFilters } from "@/lib/useAnalyticsFilters";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Portfolio Analytics · Directful" },
      {
        name: "description",
        content:
          "Benchmark hotel portfolio performance: compare total group metrics with average per-property results across any selection of hotels.",
      },
      { property: "og:title", content: "Portfolio Analytics · Directful" },
      {
        property: "og:description",
        content: "Totals and per-property averages side by side for multi-property hotel groups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const f = useAnalyticsFilters();
  const [loading, setLoading] = useState(true);

  // Simulated fetch so loading states are demonstrable on filter change.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [f.selectedIds, f.range, f.scope]);

  const data = aggregate(f.selected);
  const count = f.selected.length;

  return (
    <AnalyticsShell
      title="Analytics"
      subtitle={
        f.scope === "single"
          ? "Performance for your property."
          : "Portfolio performance and per-property benchmarks."
      }
      scope={f.scope}
      onScopeChange={f.setScope}
    >
      <FilterBar
        scope={f.scope}
        selectedIds={f.selectedIds}
        onSelect={f.setSelectedIds}
        view={f.view}
        onView={f.setView}
        range={f.range}
        onRange={f.setRange}
        selectedCount={count}
      />

      {count === 0 ? (
        <EmptyState onReset={() => f.setSelectedIds(["p1"])} />
      ) : (
        <>
          {f.scope === "group" && (
            <PortfolioSummary
              count={count}
              revenueTotal={data.revenue.total}
              revenueAvg={data.revenue.average}
              bookingsAvg={data.directBookings.average}
              invoiceAvg={data.invoice.average}
              loading={loading}
            />
          )}

          <div className="mt-6 flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold tracking-tight text-zinc-900">
              Key performance
            </h2>
            {f.effectiveView !== "total" && count > 1 && (
              <span className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                Averages across {count} selected properties
                <AverageTooltip count={count} />
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? KPIS.map((k) => <KpiCardSkeleton key={k.key} />)
              : KPIS.map((def) => (
                  <KpiCard
                    key={def.key}
                    def={def}
                    result={data[def.key]}
                    view={f.effectiveView}
                    propertyCount={count}
                  />
                ))}
          </div>

          {f.scope === "group" && count > 1 && (
            <BenchmarkTable
              rows={f.selected.map((p) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                revenue: p.revenue.reduce((a, b) => a + b, 0),
              }))}
              average={data.revenue.average}
              loading={loading}
            />
          )}
        </>
      )}
    </AnalyticsShell>
  );
}

function PortfolioSummary({
  count,
  revenueTotal,
  revenueAvg,
  bookingsAvg,
  invoiceAvg,
  loading,
}: {
  count: number;
  revenueTotal: number;
  revenueAvg: number;
  bookingsAvg: number;
  invoiceAvg: number;
  loading: boolean;
}) {
  const items = [
    { label: "Total revenue", value: formatMetric(revenueTotal, "currency"), tone: "primary" },
    { label: "Average revenue / property", value: formatMetric(revenueAvg, "currency") },
    { label: "Average direct bookings", value: formatMetric(bookingsAvg, "decimal") },
    { label: "Average invoice", value: formatMetric(invoiceAvg, "money2") },
  ];
  return (
    <section className="mt-4 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="bg-white px-5 py-4">
          <p className="flex items-center gap-1.5 text-[11.5px] text-zinc-500">
            {i.label}
            {i.label.startsWith("Average") && <AverageTooltip count={count} />}
          </p>
          {loading ? (
            <div className="mt-2 h-6 w-28 animate-pulse rounded bg-zinc-100" />
          ) : (
            <p
              className={`mt-1.5 tabular-nums tracking-tight ${
                i.tone === "primary"
                  ? "text-[24px] font-semibold"
                  : "text-[20px] font-semibold text-zinc-700"
              }`}
            >
              {i.value}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

function BenchmarkTable({
  rows,
  average,
  loading,
}: {
  rows: { id: string; name: string; brand: string; revenue: number }[];
  average: number;
  loading: boolean;
}) {
  const sorted = [...rows].sort((a, b) => b.revenue - a.revenue);
  const max = sorted[0]?.revenue ?? 1;
  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight">Property benchmark</h2>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            Revenue per property versus the group average.
          </p>
        </div>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11.5px] font-medium text-zinc-600 tabular-nums">
          Benchmark {formatMetric(average, "currency")}
        </span>
      </header>
      <ul className="max-h-[26rem] divide-y divide-zinc-100 overflow-y-auto">
        {loading && (
          <li className="px-5 py-8 text-center text-[13px] text-zinc-400">Loading properties…</li>
        )}
        {!loading &&
          sorted.map((r) => {
            const diff = average ? ((r.revenue - average) / average) * 100 : 0;
            const above = diff >= 0;
            return (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-zinc-900">{r.name}</span>
                  <span className="block text-[11px] text-zinc-400">{r.brand}</span>
                </span>
                <span className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-zinc-100 md:block">
                  <span
                    className={`block h-full rounded-full ${above ? "bg-blue-600" : "bg-zinc-400"}`}
                    style={{ width: `${Math.max(2, (r.revenue / max) * 100)}%` }}
                  />
                </span>
                <span className="w-24 text-right text-[13px] font-medium tabular-nums">
                  {formatMetric(r.revenue, "currency")}
                </span>
                <span
                  className={`w-20 text-right text-[12px] font-medium tabular-nums ${
                    above ? "text-emerald-600" : "text-zinc-400"
                  }`}
                >
                  {above ? "+" : ""}
                  {diff.toFixed(0)}%
                </span>
              </li>
            );
          })}
      </ul>
    </section>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
      <h2 className="text-[15px] font-semibold">No properties selected</h2>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-zinc-500">
        Choose at least one property to see totals. Select two or more to unlock per-property
        averages and benchmarking.
      </p>
      <button
        onClick={onReset}
        className="mt-5 h-9 rounded-md bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-700"
      >
        Select a property
      </button>
    </div>
  );
}
