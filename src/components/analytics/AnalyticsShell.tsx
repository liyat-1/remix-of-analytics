import { Link } from "@tanstack/react-router";
import { Calendar, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { MetricViewToggle } from "./MetricViewToggle";
import { PropertySelector } from "./PropertySelector";
import type { MetricView } from "@/lib/portfolio";
import type { Scope } from "@/lib/useAnalyticsFilters";

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"];

/** Page chrome shared by Analytics and ROI: brand bar + report nav. */
export function AnalyticsShell({
  title,
  subtitle,
  scope,
  onScopeChange,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  scope: Scope;
  onScopeChange: (s: Scope) => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#fafafa] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-[4px] bg-zinc-900">
                <span className="size-2 rotate-45 bg-white" />
              </span>
              <span className="text-[13px] font-semibold tracking-tight">Directful</span>
            </Link>
            <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
            <nav className="hidden items-center gap-1 sm:flex">
              <ReportLink to="/analytics">Analytics</ReportLink>
              <ReportLink to="/roi">Return on investment</ReportLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <label className="hidden items-center gap-2 text-[12px] text-zinc-500 lg:flex">
              <span>Viewing as</span>
              <select
                value={scope}
                onChange={(e) => onScopeChange(e.target.value as Scope)}
                className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-[12.5px] font-medium text-zinc-900 outline-none transition-colors hover:border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="group">Group user (43 hotels)</option>
                <option value="single">Single-property user</option>
              </select>
            </label>
            {actions}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[88rem] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-[13px] text-zinc-500">{subtitle}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

function ReportLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 [&.active]:bg-zinc-100 [&.active]:text-zinc-900"
      activeProps={{ className: "active" }}
    >
      {children}
    </Link>
  );
}

/** The single filter row: property scope, metric view, date range. */
export function FilterBar({
  scope,
  selectedIds,
  onSelect,
  view,
  onView,
  range,
  onRange,
  selectedCount,
}: {
  scope: Scope;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  view: MetricView;
  onView: (v: MetricView) => void;
  range: string;
  onRange: (r: string) => void;
  selectedCount: number;
}) {
  const group = scope === "group";
  return (
    <section
      aria-label="Report filters"
      className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3"
    >
      {group ? (
        <PropertySelector selectedIds={selectedIds} onChange={onSelect} />
      ) : (
        <span className="flex h-9 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[13px] font-medium text-zinc-500">
          Vespera Resort on Pismo Beach
        </span>
      )}

      {group && (
        <div className="flex items-center gap-2">
          <span className="hidden text-[12px] text-zinc-400 sm:block">Metric view</span>
          <MetricViewToggle value={view} onChange={onView} disabled={selectedCount < 2} />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white pl-3 pr-1 text-[13px] font-medium">
          <Calendar size={14} className="text-zinc-400" />
          <select
            value={range}
            onChange={(e) => onRange(e.target.value)}
            aria-label="Date range"
            className="h-8 appearance-none bg-transparent pr-5 outline-none"
          >
            {RANGES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <ChevronDown size={14} className="-ml-5 pointer-events-none text-zinc-400" />
        </span>
      </div>
    </section>
  );
}
