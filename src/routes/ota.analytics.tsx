import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  DollarSign,
  Download,
  EyeOff,
  FileText,
  FileUser,
  Filter,
  Mail,
  MapPin,
  Percent,
  Phone,
  Send,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Select } from "@/components/editor/Select";
import {
  ANALYTICS_PERIODS,
  CAPTURE_METRICS,
  CONVERSION_METRICS,
  OTA_ENGINES,
  capturedFunnel,
  convertedFunnel,
  engineLabel,
  engineRows,
  seriesFor,
  seriesFormat,
  seriesLabel,
  stageRows,
  strategyRows,
  type AnalyticsPeriod,
  type EngineId,
  type FunnelCategory,
  type Kpi,
  type SeriesMetric,
} from "@/lib/otaAnalytics";

export const Route = createFileRoute("/ota/analytics")({
  head: () => ({
    meta: [
      { title: "OTA Analytics — OTA Buster · Directful" },
      {
        name: "description",
        content:
          "Two reports in one: guest data captured from OTA guests, filtered by booking engine, and the direct conversions and revenue that follow.",
      },
      { property: "og:title", content: "OTA Analytics — Directful" },
      {
        property: "og:description",
        content:
          "Captured guest data and direct conversion performance, with trends for every KPI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OtaAnalyticsScreen,
});

/* ------------------------------- palette -------------------------------- */

type Palette = {
  panel: string;
  card: string;
  cardActive: string;
  icon: string;
  chip: string;
  ring: string;
  track: string;
};

/** One saturated colour band per funnel category, in reading order. */
const PALETTES: Palette[] = [
  {
    panel: "bg-[linear-gradient(135deg,#1447e6_0%,#1e40af_55%,#1d4ed8_100%)]",
    card: "bg-white/10 border-white/15 hover:bg-white/15",
    cardActive: "ring-2 ring-white/80",
    icon: "bg-white/20",
    chip: "bg-white/20",
    ring: "#93c5fd",
    track: "rgba(255,255,255,0.22)",
  },
  {
    panel: "bg-[linear-gradient(135deg,#4c1d95_0%,#5b21b6_50%,#6d28d9_100%)]",
    card: "bg-white/10 border-white/15 hover:bg-white/15",
    cardActive: "ring-2 ring-white/80",
    icon: "bg-white/20",
    chip: "bg-white/20",
    ring: "#c4b5fd",
    track: "rgba(255,255,255,0.22)",
  },
  {
    panel: "bg-[linear-gradient(135deg,#064e3b_0%,#065f46_55%,#047857_100%)]",
    card: "bg-white/10 border-white/15 hover:bg-white/15",
    cardActive: "ring-2 ring-white/80",
    icon: "bg-white/20",
    chip: "bg-white/20",
    ring: "#6ee7b7",
    track: "rgba(255,255,255,0.22)",
  },
  {
    panel: "bg-[linear-gradient(135deg,#7c2d12_0%,#9a3412_55%,#c2410c_100%)]",
    card: "bg-white/10 border-white/15 hover:bg-white/15",
    cardActive: "ring-2 ring-white/80",
    icon: "bg-white/20",
    chip: "bg-white/20",
    ring: "#fdba74",
    track: "rgba(255,255,255,0.22)",
  },
];

const paletteFor = (i: number) => PALETTES[i % PALETTES.length]!;

const BREAKDOWN_ICON = (label: string) =>
  /phone/i.test(label) ? Phone : /address/i.test(label) ? MapPin : Mail;

/** Headline icon per funnel KPI, matching the meaning of the metric. */
const KPI_ICON: Record<string, typeof Mail> = {
  received: FileUser,
  masked: EyeOff,
  missing: AlertTriangle,
  contactable: Filter,
  reached: Send,
  engaged: Users,
  identified: FileText,
  identifiedMissing: AlertTriangle,
  bookings: ShoppingCart,
  bookingRate: Percent,
  revenue: DollarSign,
  commissionRate: TrendingUp,
};

/* -------------------------------- pieces -------------------------------- */

function Delta({ value, solid }: { value: number; solid?: boolean }) {
  const up = value >= 0;
  if (solid) {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
        {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums ${
        up ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

/** Percentage donut used for every completeness KPI. */
function Donut({ percent, color, track }: { percent: number; color: string; track: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative grid size-[92px] shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="size-[92px] -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke={track} strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <span className="absolute text-[17px] font-semibold tabular-nums tracking-tight text-white">
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}

function isPercentValue(v: string) {
  return /^\d+(\.\d+)?%$/.test(v.trim());
}

/** A single KPI inside a coloured funnel panel. */
function FunnelKpi({
  kpi,
  order,
  palette,
  active,
  onSelect,
}: {
  kpi: Kpi;
  order: number;
  palette: Palette;
  active: boolean;
  onSelect?: (m: SeriesMetric) => void;
}) {
  const clickable = Boolean(kpi.metric && onSelect);
  const percent = isPercentValue(kpi.value) ? Number.parseFloat(kpi.value) : null;
  const Icon = KPI_ICON[kpi.key] ?? BREAKDOWN_ICON(kpi.label);

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h4 className="min-w-0 text-[13px] font-semibold leading-snug text-white">
          <span className="text-white/60">{order}. </span>
          {kpi.label}
          {kpi.stage ? (
            <span className="block text-[12px] font-medium text-white/70">({kpi.stage})</span>
          ) : null}
        </h4>
        <Delta value={kpi.delta} solid />
      </div>

      {percent === null ? (
        <div className="mt-4 flex items-center gap-3.5">
          <span
            className={`grid size-[56px] shrink-0 place-items-center rounded-full ${palette.icon}`}
          >
            <Icon size={22} className="text-white" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[30px] font-semibold leading-none tabular-nums tracking-tight text-white">
              {kpi.value}
            </p>
            {kpi.relation ? (
              <p className="mt-2">
                <span
                  className={`inline-block rounded-md ${palette.chip} px-1.5 py-0.5 text-[11px] font-semibold text-white`}
                >
                  {kpi.relation}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-4">
          <Donut percent={percent} color={palette.ring} track={palette.track} />
          <div className="min-w-0">
            {kpi.meta ? (
              <p className="text-[12px] leading-relaxed text-white/80">{kpi.meta}</p>
            ) : null}
            {kpi.relation ? (
              <p className="mt-2 text-[12px] font-medium text-white/90">{kpi.relation}</p>
            ) : null}
          </div>
        </div>
      )}

      {percent === null && kpi.meta ? (
        <p className="mt-3 text-[12px] leading-relaxed text-white/75">{kpi.meta}</p>
      ) : null}

      {kpi.breakdown?.length ? (
        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border-t border-white/15 pt-3">
          {kpi.breakdown.map((b) => {
            const BIcon = BREAKDOWN_ICON(b.label);
            return (
              <div key={b.label} className="flex min-w-0 items-center gap-2 px-1">
                <BIcon size={14} className="shrink-0 text-white/70" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[10.5px] leading-tight text-white/65">{b.label}</span>
                  <span className="block text-[13px] font-semibold tabular-nums text-white">
                    {b.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );

  const shell = `relative flex min-w-0 flex-1 flex-col rounded-xl border p-4 text-left transition-colors ${palette.card} ${
    active ? palette.cardActive : ""
  }`;

  if (!clickable) return <article className={shell}>{body}</article>;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect!(kpi.metric!)}
      title={`Show ${kpi.label} over time`}
      className={`${shell} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
    >
      {body}
    </button>
  );
}

/** Coloured, numbered funnel category — the building block of both reports. */
function FunnelPanel({
  category,
  index,
  offset,
  activeMetric,
  onSelect,
}: {
  category: FunnelCategory;
  index: number;
  offset: number;
  activeMetric: SeriesMetric;
  onSelect: (m: SeriesMetric) => void;
}) {
  const palette = paletteFor(index);
  const n = category.kpis.length;
  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl p-4 text-white shadow-sm sm:p-5 ${palette.panel}`}
      style={{ flexGrow: n, flexBasis: `${Math.min(n, 3) * 250}px` }}
      aria-label={category.title}
    >
      <header className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-white/20 text-[12px] font-bold tabular-nums">
          {category.index}
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight">{category.title}</h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-white/75">
            {category.description}
          </p>
        </div>
      </header>

      <div
        className={`mt-4 flex flex-1 flex-col gap-3 ${n > 1 ? "sm:flex-row sm:items-stretch" : ""}`}
      >
        {category.kpis.map((k, i) => (
          <div key={k.key} className="flex min-w-0 flex-1 items-center gap-2">
            {i > 0 ? (
              <ChevronRight
                size={16}
                className="hidden shrink-0 text-white/50 sm:block"
                aria-hidden
              />
            ) : null}
            <FunnelKpi
              kpi={k}
              order={offset + i + 1}
              palette={palette}
              active={k.metric === activeMetric}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>

      {category.bridge ? (
        <p className="mt-4 border-t border-white/15 pt-3 text-[11.5px] font-medium text-white/80">
          {category.bridge}
        </p>
      ) : null}
    </section>
  );
}

function FunnelGrid({
  categories,
  activeMetric,
  onSelect,
}: {
  categories: FunnelCategory[];
  activeMetric: SeriesMetric;
  onSelect: (m: SeriesMetric) => void;
}) {
  let running = 0;
  return (
    <div className="flex flex-wrap gap-4">
      {categories.map((c, i) => {
        const offset = running;
        running += c.kpis.length;
        return (
          <FunnelPanel
            key={c.id}
            category={c}
            index={i}
            offset={offset}
            activeMetric={activeMetric}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------ table bits ------------------------------ */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-[12.5px] text-slate-500">{subtitle}</p> : null}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-3 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-500 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <td className={`px-3 py-3 text-[13px] tabular-nums text-slate-700 ${right ? "text-right" : ""}`}>
      {children}
    </td>
  );
}

function TableFrame({
  minWidth,
  caption,
  children,
}: {
  minWidth: number;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-slate-700" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

function HeadRow({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50/80">{children}</tr>
    </thead>
  );
}

function CoverageBadge({ percent }: { percent: number }) {
  const tone =
    percent >= 70
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : percent >= 45
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold tabular-nums ring-1 ring-inset ${tone}`}
    >
      {percent.toFixed(1)}%
    </span>
  );
}

/* --------------------------------- chart -------------------------------- */

function TrendChart({
  metric,
  metrics,
  onMetric,
  points,
  subtitle,
}: {
  metric: SeriesMetric;
  metrics: SeriesMetric[];
  onMetric: (m: SeriesMetric) => void;
  points: { date: string; current: number }[];
  subtitle: string;
}) {
  const label = seriesLabel(metric);
  const format = seriesFormat(metric);
  const axisFormat = (v: number) =>
    format === "money"
      ? `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`
      : format === "percent"
        ? `${v}%`
        : v >= 1000
          ? `${(v / 1000).toFixed(1)}k`
          : `${v}`;
  const valueFormat = (v: number) =>
    format === "money" ? `$${v.toLocaleString("en-US")}` : format === "percent" ? `${v}%` : v.toLocaleString("en-US");

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
            {label} over time
          </h3>
          <p className="mt-1 text-[12.5px] text-slate-500">{subtitle}</p>
        </div>
        <div className="w-64">
          <Select
            value={metric}
            options={metrics.map((m) => ({ value: m, label: seriesLabel(m) }))}
            onChange={(v) => onMetric(v as SeriesMetric)}
            size="sm"
            align="right"
            ariaLabel="Charted metric"
          />
        </div>
      </header>

      <div className="h-[300px] w-full p-4 sm:p-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={axisFormat}
            />
            <ChartTooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              }}
              formatter={(v: number | string) => [valueFormat(Number(v)), label]}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#trendFill)"
              dot={false}
              activeDot={{ r: 4 }}
              name={label}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/* --------------------------------- tabs --------------------------------- */

type TabId = "captured" | "converted";

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: "captured", label: "Captured", hint: "Guest data we now own" },
  { id: "converted", label: "Converted", hint: "Direct bookings and revenue" },
];

function Tabs({ value, onChange }: { value: TabId; onChange: (t: TabId) => void }) {
  return (
    <div role="tablist" aria-label="Analytics report" className="flex items-center gap-6">
      {TABS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={active}
            aria-controls={`panel-${t.id}`}
            onClick={() => onChange(t.id)}
            className={`-mb-px border-b-2 px-1 pb-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              active
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="block text-[14px] font-semibold">{t.label}</span>
            <span className="block text-[11px] text-slate-400">{t.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

function OtaAnalyticsScreen() {
  const [tab, setTab] = useState<TabId>("captured");
  const [period, setPeriod] = useState<AnalyticsPeriod>("15d");
  const [engine, setEngine] = useState<EngineId>("all");
  const [captureMetric, setCaptureMetric] = useState<SeriesMetric>("received");
  const [conversionMetric, setConversionMetric] = useState<SeriesMetric>("bookings");

  const captured = useMemo(() => capturedFunnel(period, engine), [period, engine]);
  const converted = useMemo(() => convertedFunnel(period), [period]);
  const engines = engineRows(period);
  const stages = stageRows(period);
  const strategies = strategyRows(period);

  const capturePoints = useMemo(
    () => seriesFor(captureMetric, period, engine),
    [captureMetric, period, engine],
  );
  const conversionPoints = useMemo(
    () => seriesFor(conversionMetric, period, "all"),
    [conversionMetric, period],
  );

  const periodLabel = ANALYTICS_PERIODS.find((p) => p.value === period)?.label ?? "Selected period";

  function exportCsv() {
    const rows: (string | number)[][] = [["Report", "Category", "Metric", "Value"]];
    const cats = tab === "captured" ? captured : converted;
    for (const c of cats) {
      for (const k of c.kpis) {
        rows.push([tab, c.title, k.label + (k.stage ? ` (${k.stage})` : ""), k.value]);
        for (const b of k.breakdown ?? []) rows.push([tab, c.title, b.label, b.value]);
      }
    }
    if (tab === "captured") {
      for (const e of engines) {
        rows.push(["captured", "By OTA engine", `${e.engine} — received`, e.received]);
        rows.push(["captured", "By OTA engine", `${e.engine} — masked`, e.masked]);
        rows.push(["captured", "By OTA engine", `${e.engine} — missing`, e.missing]);
        rows.push(["captured", "By OTA engine", `${e.engine} — contactable`, e.contactable]);
        rows.push(["captured", "By OTA engine", `${e.engine} — completeness`, e.completeness]);
      }
    } else {
      for (const s of strategies) {
        rows.push(["converted", "By strategy", `${s.strategy} — reached`, s.reached]);
        rows.push(["converted", "By strategy", `${s.strategy} — conversions`, s.conversions]);
        rows.push(["converted", "By strategy", `${s.strategy} — revenue`, s.revenue]);
      }
      for (const r of stages) {
        rows.push(["converted", "By stage", `${r.stage} — reached`, r.reached]);
        rows.push(["converted", "By stage", `${r.stage} — conversions`, r.conversions]);
        rows.push(["converted", "By stage", `${r.stage} — revenue`, r.revenue]);
      }
    }

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ota-${tab}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white px-4 pt-4 sm:px-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              OTA Buster — Analytics
            </h1>
            <p className="mt-1 text-[12.5px] text-slate-500">
              See how your OTA guests engage, convert, and drive direct revenue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-44">
              <Select
                value={period}
                options={ANALYTICS_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
                onChange={(v) => setPeriod(v)}
                size="sm"
                align="right"
                ariaLabel="Reporting period"
              />
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              <Download size={13} aria-hidden />
              Download CSV
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <Tabs value={tab} onChange={setTab} />
        </div>
      </header>

      {tab === "captured" ? (
        <div role="tabpanel" id="panel-captured" aria-labelledby="tab-captured" className="space-y-6">
          <section className="grid gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">Captured</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                Understand the guest profiles received from OTA booking engines and how much usable
                guest data we can work with. Click any card to chart it below.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] font-medium text-slate-500">Booking engine</span>
              <div className="w-52">
                <Select
                  value={engine}
                  options={OTA_ENGINES.map((e) => ({ value: e.value, label: e.label }))}
                  onChange={(v) => setEngine(v)}
                  size="sm"
                  align="right"
                  ariaLabel="Filter by OTA booking engine"
                />
              </div>
            </div>
          </section>

          {engine !== "all" ? (
            <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-900">
              <EyeOff size={14} className="shrink-0" aria-hidden />
              Showing <strong className="font-semibold">{engineLabel(engine)}</strong> only — every
              number and the chart below are filtered to this engine.
            </p>
          ) : null}

          <FunnelGrid
            categories={captured}
            activeMetric={captureMetric}
            onSelect={setCaptureMetric}
          />

          <TrendChart
            metric={captureMetric}
            metrics={CAPTURE_METRICS}
            onMetric={setCaptureMetric}
            points={capturePoints}
            subtitle={`${periodLabel} · ${engineLabel(engine)}. Click a KPI above or choose a metric here.`}
          />

          <Section
            title="Capture performance by OTA engine"
            subtitle="Which booking engines hand over usable guest data, and which hide it behind a relay."
          >
            <TableFrame minWidth={820} caption="Guest data capture by OTA booking engine">
              <HeadRow>
                <Th>Booking engine</Th>
                <Th right>Share</Th>
                <Th right>Profiles received</Th>
                <Th right>Masked</Th>
                <Th right>Missing</Th>
                <Th right>Contactable</Th>
                <Th right>Completeness</Th>
              </HeadRow>
              <tbody className="divide-y divide-slate-100">
                {engines.map((e) => (
                  <tr
                    key={e.key}
                    className={`transition-colors hover:bg-slate-50/70 ${
                      engine === e.key ? "bg-slate-50" : ""
                    }`}
                  >
                    <th scope="row" className="px-3 py-3 text-left">
                      <button
                        type="button"
                        onClick={() => setEngine(engine === e.key ? "all" : e.key)}
                        className="text-[13px] font-semibold text-slate-900 underline-offset-4 hover:underline"
                        title={`Filter this report to ${e.engine}`}
                      >
                        {e.engine}
                      </button>
                    </th>
                    <Td right>{e.share}</Td>
                    <Td right>{e.received}</Td>
                    <Td right>
                      <span className="text-slate-500">{e.masked}</span>
                    </Td>
                    <Td right>
                      <span className="text-slate-500">{e.missing}</span>
                    </Td>
                    <Td right>
                      <span className="font-semibold text-slate-900">{e.contactable}</span>
                    </Td>
                    <td className="px-3 py-3 text-right">
                      <CoverageBadge percent={e.completenessValue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
            <p className="mt-3 text-[11.5px] text-slate-500">
              Select an engine name to filter the whole Captured report to it.
            </p>
          </Section>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-converted"
          aria-labelledby="tab-converted"
          className="space-y-6"
        >
          <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
            <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">Converted</h2>
            <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-slate-500">
              See how reachable OTA guests engaged, became identifiable, and converted into direct
              bookings and revenue. Click any card to chart it below.
            </p>
          </section>

          <FunnelGrid
            categories={converted}
            activeMetric={conversionMetric}
            onSelect={setConversionMetric}
          />

          <TrendChart
            metric={conversionMetric}
            metrics={CONVERSION_METRICS}
            onMetric={setConversionMetric}
            points={conversionPoints}
            subtitle={`${periodLabel}. Click a KPI above or choose a metric here.`}
          />

          <Section
            title="Performance by contact strategy"
            subtitle="Which communication strategy earns the most direct guests and revenue."
          >
            <TableFrame minWidth={760} caption="Direct conversion performance by contact strategy">
              <HeadRow>
                <Th>Strategy</Th>
                <Th right>Guests reached</Th>
                <Th right>Direct conversions</Th>
                <Th right>Conversion rate</Th>
                <Th right>Direct revenue</Th>
                <Th right>Revenue / conversion</Th>
              </HeadRow>
              <tbody className="divide-y divide-slate-100">
                {strategies.map((s) => (
                  <tr key={s.key} className="transition-colors hover:bg-slate-50/70">
                    <th
                      scope="row"
                      className="px-3 py-3 text-left text-[13px] font-semibold text-slate-900"
                    >
                      {s.strategy}
                    </th>
                    <Td right>{s.reached}</Td>
                    <Td right>
                      <span className="font-semibold text-slate-900">{s.conversions}</span>
                    </Td>
                    <Td right>{s.conversionRate}</Td>
                    <Td right>{s.revenue}</Td>
                    <Td right>{s.revenuePer}</Td>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
          </Section>

          <Section
            title="Performance by journey stage"
            subtitle="Where in the guest journey the direct bookings actually happen."
          >
            <TableFrame minWidth={760} caption="Direct conversion performance by journey stage">
              <HeadRow>
                <Th>Stage</Th>
                <Th right>Guests reached</Th>
                <Th right>Momentum</Th>
                <Th right>Engagement</Th>
                <Th right>Conversions</Th>
                <Th right>Conversion rate</Th>
                <Th right>Revenue</Th>
              </HeadRow>
              <tbody className="divide-y divide-slate-100">
                {stages.map((r) => (
                  <tr key={r.stage} className="transition-colors hover:bg-slate-50/70">
                    <th
                      scope="row"
                      className="px-3 py-3 text-left text-[13px] font-semibold text-slate-900"
                    >
                      {r.stage}
                    </th>
                    <Td right>{r.reached}</Td>
                    <td className="px-3 py-3 text-right">
                      <Delta value={r.momentum} />
                    </td>
                    <Td right>{r.engagement}</Td>
                    <Td right>
                      <span className="font-semibold text-slate-900">{r.conversions}</span>
                    </Td>
                    <Td right>{r.conversionRate}</Td>
                    <Td right>{r.revenue}</Td>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
          </Section>
        </div>
      )}
    </div>
  );
}
