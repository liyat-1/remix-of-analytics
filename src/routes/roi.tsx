import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { AnalyticsShell, FilterBar } from "@/components/analytics/AnalyticsShell";
import { AverageTooltip } from "@/components/analytics/MetricViewToggle";
import { columnTotals, formatMetric, monthlyRows, MONTHS } from "@/lib/portfolio";
import { useAnalyticsFilters } from "@/lib/useAnalyticsFilters";

export const Route = createFileRoute("/roi")({
  head: () => ({
    meta: [
      { title: "Return on Investment · Directful" },
      {
        name: "description",
        content:
          "Monthly revenue and invoice amounts per hotel, with sticky portfolio total and average-per-property benchmark rows.",
      },
      { property: "og:title", content: "Return on Investment · Directful" },
      {
        property: "og:description",
        content: "Portfolio totals, per-property averages and hotel-level ROI in one table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoiPage,
});

function RoiPage() {
  const f = useAnalyticsFilters();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, [f.selectedIds, f.range, f.scope]);

  const rows = monthlyRows(f.selected);
  const revTotals = columnTotals(rows, "revenue");
  const invTotals = columnTotals(rows, "invoice");
  const n = rows.length || 1;
  const showAvg = f.scope === "group" && rows.length > 1 && f.effectiveView !== "total";

  return (
    <AnalyticsShell
      title="Return on investment"
      subtitle="For Peregrine Hospitality"
      scope={f.scope}
      onScopeChange={f.setScope}
      actions={
        <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-medium transition-colors hover:border-zinc-300">
          <Download size={14} className="text-zinc-400" />
          <span className="hidden sm:inline">Download CSV</span>
        </button>
      }
    >
      <FilterBar
        scope={f.scope}
        selectedIds={f.selectedIds}
        onSelect={f.setSelectedIds}
        view={f.view}
        onView={f.setView}
        range={f.range}
        onRange={f.setRange}
        selectedCount={rows.length}
      />

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
          <h2 className="text-[15px] font-semibold">Nothing to report</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-zinc-500">
            Select properties to see revenue and invoice amounts by month.
          </p>
        </div>
      ) : (
        <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead className="sticky top-0 z-30 bg-white">
                <tr className="border-b border-zinc-200">
                  <th className="sticky left-0 z-30 bg-white px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                    Property
                  </th>
                  {MONTHS.map((m) => (
                    <th key={m} colSpan={2} className="px-5 py-3">
                      <span className="block text-[12.5px] font-semibold text-blue-600">{m}</span>
                      <span className="mt-0.5 flex gap-8 text-[11px] font-normal text-zinc-400">
                        <span className="w-24">Revenue</span>
                        <span>Invoice</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Sticky summary block: total, then the average benchmark. */}
                <tr className="sticky top-[62px] z-20 bg-blue-600 text-white">
                  <th
                    scope="row"
                    className="sticky left-0 z-20 bg-blue-600 px-5 py-3 text-left text-[13px] font-semibold"
                  >
                    Total portfolio
                    <span className="block text-[11px] font-normal text-blue-100">
                      {rows.length} {rows.length === 1 ? "hotel" : "hotels"}
                    </span>
                  </th>
                  {MONTHS.map((m, i) => (
                    <Cells
                      key={m}
                      a={formatMetric(revTotals[i], "money2")}
                      b={formatMetric(invTotals[i], "money2")}
                      strong
                    />
                  ))}
                </tr>

                {showAvg && (
                  <tr className="sticky top-[110px] z-20 border-b border-zinc-200 bg-blue-50 text-zinc-900">
                    <th
                      scope="row"
                      className="sticky left-0 z-20 bg-blue-50 px-5 py-3 text-left text-[13px] font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        Average / property
                        <AverageTooltip count={rows.length} />
                      </span>
                      <span className="block text-[11px] font-normal text-zinc-500">
                        Benchmark across selection
                      </span>
                    </th>
                    {MONTHS.map((m, i) => (
                      <Cells
                        key={m}
                        a={formatMetric(revTotals[i] / n, "money2")}
                        b={formatMetric(invTotals[i] / n, "money2")}
                      />
                    ))}
                  </tr>
                )}

                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-zinc-100">
                        <td className="px-5 py-4" colSpan={7}>
                          <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
                        </td>
                      </tr>
                    ))
                  : rows.map((r) => {
                      return (
                        <tr key={r.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                          <th
                            scope="row"
                            className="sticky left-0 z-10 bg-white px-5 py-3.5 text-left text-[13px] font-medium text-zinc-900"
                          >
                            <span className="block truncate">{r.name}</span>
                            <span className="block text-[11px] font-normal text-zinc-400">
                              {r.brand}
                            </span>
                          </th>
                          {MONTHS.map((m, i) => {
                            const avg = revTotals[i] / n;
                            const above = r.revenue[i] >= avg;
                            return (
                              <Cells
                                key={m}
                                a={formatMetric(r.revenue[i], "money2")}
                                b={r.invoice[i] ? formatMetric(r.invoice[i], "money2") : "—"}
                                link
                                marker={showAvg ? (above ? "above" : "below") : undefined}
                              />
                            );
                          })}
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showAvg && (
        <p className="mt-3 text-[12px] text-zinc-500">
          Averages divide each month's portfolio total by the {rows.length} selected properties.
          Dots mark properties above or below the monthly benchmark.
        </p>
      )}
    </AnalyticsShell>
  );
}

function Cells({
  a,
  b,
  strong,
  link,
  marker,
}: {
  a: string;
  b: string;
  strong?: boolean;
  link?: boolean;
  marker?: "above" | "below";
}) {
  return (
    <>
      <td
        className={`whitespace-nowrap px-5 py-3 text-[13px] tabular-nums ${
          strong ? "font-semibold" : link ? "font-medium text-blue-600" : "font-semibold"
        }`}
      >
        <span className="flex items-center gap-1.5">
          {marker && (
            <span
              aria-label={marker === "above" ? "Above benchmark" : "Below benchmark"}
              className={`size-1.5 rounded-full ${
                marker === "above" ? "bg-emerald-500" : "bg-zinc-300"
              }`}
            />
          )}
          {a}
        </span>
      </td>
      <td
        className={`whitespace-nowrap px-5 py-3 text-[13px] tabular-nums ${
          strong ? "font-medium" : "text-zinc-500"
        }`}
      >
        {b}
      </td>
    </>
  );
}
