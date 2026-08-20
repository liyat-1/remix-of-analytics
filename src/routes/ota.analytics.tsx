import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleSlash,
  Download,
  EyeOff,
  Home,
  Mail,
  MailPlus,
  MailQuestion,
  MailX,
  MessageSquare,
  MessagesSquare,
  Phone,
  TrendingUp,
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
  SERIES_METRICS,
  captureKpisFor,
  channelRows,
  completenessTable,
  conversionKpis,
  engineLabel,
  engineRows,
  fmt,
  seriesFor,
  seriesFormat,
  seriesLabel,
  stageRows,
  strategyRows,
  type AnalyticsPeriod,
  type EngineId,
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

/* -------------------------------- pieces -------------------------------- */

function Delta({ value }: { value: number }) {
  const up = value >= 0;
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

function SolidDelta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-[12.5px] text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
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
    <td
      className={`px-3 py-3 text-[13px] tabular-nums text-slate-700 ${right ? "text-right" : ""}`}
    >
      {children}
    </td>
  );
}

/** Emphasised numeric cell — the one number a column is really about. */
function TdStrong({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-3 text-right text-[13.5px] font-semibold tabular-nums text-slate-900">
      {children}
    </td>
  );
}

function RowHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <th scope="row" className="px-3 py-3 text-left align-top">
      <span className="block text-[13px] font-semibold text-slate-900">{title}</span>
      {hint ? <span className="mt-0.5 block text-[11.5px] font-normal text-slate-500">{hint}</span> : null}
    </th>
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

/** Count + share, stacked. Keeps big tables readable without progress bars. */
function CountShare({
  count,
  percent,
  tone = "default",
}: {
  count: number | string;
  percent: number | null;
  tone?: "default" | "strong" | "muted";
}) {
  const numberTone =
    tone === "strong"
      ? "text-slate-900 font-semibold"
      : tone === "muted"
        ? "text-slate-500"
        : "text-slate-800";
  return (
    <span className="inline-flex flex-col items-end leading-tight">
      <span className={`text-[13.5px] tabular-nums ${numberTone}`}>
        {typeof count === "number" ? fmt(count) : count}
      </span>
      {percent === null ? (
        <span className="text-[11px] text-slate-300">—</span>
      ) : (
        <span className="text-[11px] tabular-nums text-slate-400">{percent.toFixed(1)}%</span>
      )}
    </span>
  );
}

const KPI_ICON: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
  address: Home,
  masked: MailQuestion,
  missing: MailX,
  profiles: CheckCircle2,
};

/** Solid, editorial KPI colours — one per metric, no gradients. */
const KPI_COLOR: Record<string, string> = {
  ota: "bg-slate-800",
  reached: "bg-indigo-600",
  email: "bg-violet-700",
  phone: "bg-sky-700",
  address: "bg-cyan-800",
  masked: "bg-slate-600",
  missing: "bg-slate-500",
  captureRate: "bg-blue-800",
  profiles: "bg-teal-800",
  conversions: "bg-teal-700",
  revenue: "bg-emerald-700",
  commission: "bg-blue-800",
  conversionRate: "bg-indigo-700",
  repeat: "bg-slate-800",
  lift: "bg-emerald-800",
};

function KpiCard({
  kpi,
  active,
  onSelect,
}: {
  kpi: Kpi;
  active: boolean;
  onSelect?: (m: SeriesMetric) => void;
}) {
  const Icon = KPI_ICON[kpi.key];
  const clickable = Boolean(kpi.metric && onSelect);
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h4 className="flex min-w-0 items-center gap-2 text-[12.5px] font-medium text-white/80">
          {Icon ? <Icon size={14} className="shrink-0" aria-hidden /> : null}
          <span className="min-w-0 truncate">{kpi.label}</span>
        </h4>
        {clickable ? (
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              active ? "bg-white text-slate-900" : "bg-white/15 text-white/80"
            }`}
          >
            {active ? "On chart" : "Trend"}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-none tabular-nums tracking-tight sm:text-[32px]">
        {kpi.value}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] leading-snug text-white/75">
        <SolidDelta value={kpi.delta} />
        {kpi.meta ? <span className="min-w-0">{kpi.meta}</span> : null}
      </div>
    </>
  );

  const shell = `flex min-w-0 flex-col rounded-xl p-5 text-left text-white transition-shadow ${
    KPI_COLOR[kpi.key] ?? "bg-slate-800"
  } ${active ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-50" : ""}`;

  if (!clickable) return <article className={shell}>{body}</article>;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect!(kpi.metric!)}
      title={`Show ${kpi.label} over time`}
      className={`${shell} cursor-pointer hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2`}
    >
      {body}
    </button>
  );
}

const CHANNEL_ICON: Record<string, typeof Mail> = {
  email: Mail,
  text: MessageSquare,
  text_fallback: MessagesSquare,
  both: MailPlus,
};

function ChannelCell({ channel, hint, iconKey }: { channel: string; hint: string; iconKey: string }) {
  const Icon = CHANNEL_ICON[iconKey] ?? Mail;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={13} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-slate-900">{channel}</span>
        <span className="block truncate text-[11.5px] text-slate-500">{hint}</span>
      </span>
    </div>
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
    format === "money"
      ? `$${v.toLocaleString("en-US")}`
      : format === "percent"
        ? `${v}%`
        : v.toLocaleString("en-US");

  const values = points.map((p) => p.current);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const change = first ? ((last - first) / first) * 100 : 0;
  const total = values.reduce((a, b) => a + b, 0);
  const peak = values.length ? Math.max(...values) : 0;

  return (
    <Section
      title={`${label} over time`}
      subtitle={subtitle}
      action={
        <div className="w-full sm:w-64">
          <Select
            value={metric}
            options={metrics.map((m) => ({ value: m, label: seriesLabel(m) }))}
            onChange={(v) => onMetric(v as SeriesMetric)}
            size="sm"
            align="right"
            ariaLabel="Chart metric"
          />
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-4">
        <Stat label="Latest" value={valueFormat(last)} />
        <Stat
          label="Change over period"
          value={`${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
          tone={change >= 0 ? "up" : "down"}
        />
        <Stat label="Peak" value={valueFormat(peak)} />
        <Stat
          label={format === "percent" ? "Period average" : "Period total"}
          value={valueFormat(
            format === "percent" ? Number((total / (values.length || 1)).toFixed(1)) : total,
          )}
        />
      </div>

      <div className="h-[300px] w-full">
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
    </Section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="bg-white px-3.5 py-3">
      <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-[16px] font-semibold tabular-nums tracking-tight ${
          tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
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
    <div
      role="tablist"
      aria-label="Analytics report"
      className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 sm:inline-grid sm:auto-cols-max sm:grid-flow-col"
    >
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
            className={`min-w-0 rounded-lg px-4 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="block truncate text-[13.5px] font-semibold">{t.label}</span>
            <span
              className={`block truncate text-[11px] ${active ? "text-white/70" : "text-slate-400"}`}
            >
              {t.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

function OtaAnalyticsScreen() {
  const [tab, setTab] = useState<TabId>("captured");
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [engine, setEngine] = useState<EngineId>("all");
  const [captureMetric, setCaptureMetric] = useState<SeriesMetric>("email");
  const [conversionMetric, setConversionMetric] = useState<SeriesMetric>("conversions");

  const capture = captureKpisFor(period, engine);
  const conversion = conversionKpis(period);
  const quality = completenessTable(period, engine);
  const engines = engineRows(period);
  const stages = stageRows(period);
  const channels = channelRows(period);
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
    const rows: (string | number)[][] = [["Report", "Row", "Metric", "Value"]];
    if (tab === "captured") {
      for (const k of capture) rows.push(["Captured", k.label, "Value", k.value]);
      for (const q of quality) {
        rows.push(["Data completeness", q.field, "Captured", q.complete]);
        rows.push(["Data completeness", q.field, "Masked relay", q.masked ?? "n/a"]);
        rows.push(["Data completeness", q.field, "Not held", q.missing]);
        rows.push(["Data completeness", q.field, "Coverage", `${q.completePct}%`]);
      }
      for (const e of engines) {
        rows.push(["By OTA engine", e.engine, "OTA guests", e.otaGuests]);
        rows.push(["By OTA engine", e.engine, "Emails captured", e.emails]);
        rows.push(["By OTA engine", e.engine, "Masked emails", e.masked]);
        rows.push(["By OTA engine", e.engine, "No email", e.missing]);
        rows.push(["By OTA engine", e.engine, "Capture rate", e.captureRate]);
        rows.push(["By OTA engine", e.engine, "Complete profiles", e.profiles]);
      }
    } else {
      for (const k of conversion) rows.push(["Converted", k.label, "Value", k.value]);
      for (const c of channels) {
        rows.push(["By channel", c.channel, "Sent", c.sent]);
        rows.push(["By channel", c.channel, "Delivered", c.delivered]);
        rows.push(["By channel", c.channel, "Delivery rate", c.deliveryRate]);
        rows.push(["By channel", c.channel, "Click-through rate", c.ctr]);
        rows.push(["By channel", c.channel, "Response rate", c.response]);
        rows.push(["By channel", c.channel, "Direct conversions", c.conversions]);
        rows.push(["By channel", c.channel, "Conversion rate", c.conversionRate]);
        rows.push(["By channel", c.channel, "Direct revenue", c.revenue]);
      }
      for (const s of strategies) {
        rows.push(["By strategy", s.strategy, "Guests reached", s.reached]);
        rows.push(["By strategy", s.strategy, "Direct conversions", s.conversions]);
        rows.push(["By strategy", s.strategy, "Conversion rate", s.conversionRate]);
        rows.push(["By strategy", s.strategy, "Revenue", s.revenue]);
        rows.push(["By strategy", s.strategy, "Revenue / conversion", s.revenuePer]);
      }
      for (const r of stages) {
        rows.push(["By stage", r.stage, "Guests reached", r.reached]);
        rows.push(["By stage", r.stage, "Engagement", r.engagement]);
        rows.push(["By stage", r.stage, "Conversions", r.conversions]);
        rows.push(["By stage", r.stage, "Conversion rate", r.conversionRate]);
        rows.push(["By stage", r.stage, "Revenue", r.revenue]);
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
      {/* Page header */}
      <header className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">
              OTA Buster — Analytics
            </h1>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Two reports: the guest data you captured from OTA guests, and the direct business it
              produced.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-[11.5px] font-medium text-slate-500 sm:inline">
              {periodLabel}
            </span>
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

      {/* ============================= CAPTURED ============================ */}
      {tab === "captured" ? (
        <div
          role="tabpanel"
          id="panel-captured"
          aria-labelledby="tab-captured"
          className="space-y-6"
        >
          <section className="grid gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                Captured guest data
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                Contact details the hotel now owns. Masked OTA relay addresses are reported
                separately and never counted as captured. Click any card to chart it below.
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {capture.map((k) => (
              <KpiCard
                key={k.key}
                kpi={k}
                active={k.metric === captureMetric}
                onSelect={setCaptureMetric}
              />
            ))}
          </div>

          <TrendChart
            metric={captureMetric}
            metrics={CAPTURE_METRICS}
            onMetric={setCaptureMetric}
            points={capturePoints}
            subtitle={`${periodLabel} · ${engineLabel(engine)}. Click a KPI above or choose a metric here.`}
          />

          <Section
            title="Guest data by completeness"
            subtitle={`For every ${fmt(quality[0]?.total ?? 0)} OTA guests in this view: what we hold, what is masked, and what is missing.`}
          >
            <TableFrame minWidth={720} caption="Guest data completeness by field">
              <HeadRow>
                <Th>Data point</Th>
                <Th right>Captured &amp; usable</Th>
                <Th right>Masked relay</Th>
                <Th right>Not held</Th>
                <Th right>Coverage</Th>
              </HeadRow>
              <tbody className="divide-y divide-slate-100">
                {quality.map((q) => (
                  <tr key={q.key} className="transition-colors hover:bg-slate-50/70">
                    <RowHead title={q.field} hint={q.hint} />
                    <td className="px-3 py-3 text-right">
                      <CountShare count={q.complete} percent={q.completePct} tone="strong" />
                    </td>
                    <td className="px-3 py-3 text-right">
                      {q.masked === null ? (
                        <span
                          className="inline-flex items-center gap-1 text-[12px] text-slate-400"
                          title="Booking engines never relay a masked value for this field"
                        >
                          <CircleSlash size={12} aria-hidden />
                          Not applicable
                        </span>
                      ) : (
                        <CountShare count={q.masked} percent={q.maskedPct} tone="muted" />
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <CountShare count={q.missing} percent={q.missingPct} tone="muted" />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <CoverageBadge percent={q.completePct} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/80">
                  <th scope="row" className="px-3 py-2.5 text-left text-[12px] font-semibold text-slate-600">
                    OTA guests in view
                  </th>
                  <td
                    colSpan={4}
                    className="px-3 py-2.5 text-right text-[12px] font-semibold tabular-nums text-slate-600"
                  >
                    {fmt(quality[0]?.total ?? 0)}
                  </td>
                </tr>
              </tfoot>
            </TableFrame>
            <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
              <strong className="font-semibold text-slate-700">Captured &amp; usable</strong> is a real
              value the hotel can contact.{" "}
              <strong className="font-semibold text-slate-700">Masked relay</strong> is an
              OTA-generated forwarding address that expires after the stay.
            </p>
          </Section>

          <Section
            title="Capture performance by OTA engine"
            subtitle="Which booking engines hand over usable guest data, and which hide it behind a relay."
          >
            <TableFrame minWidth={860} caption="Guest data capture by OTA booking engine">
              <HeadRow>
                <Th>Booking engine</Th>
                <Th right>Share of guests</Th>
                <Th right>OTA guests</Th>
                <Th right>Emails captured</Th>
                <Th right>Masked emails</Th>
                <Th right>No email</Th>
                <Th right>Complete profiles</Th>
                <Th right>Capture rate</Th>
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
                    <Td right>{e.otaGuests}</Td>
                    <TdStrong>{e.emails}</TdStrong>
                    <Td right>
                      <span className="text-slate-500">{e.masked}</span>
                    </Td>
                    <Td right>
                      <span className="text-slate-500">{e.missing}</span>
                    </Td>
                    <Td right>{e.profiles}</Td>
                    <td className="px-3 py-3 text-right">
                      <CoverageBadge percent={e.captureRateValue} />
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
        /* ============================ CONVERTED =========================== */
        <div
          role="tabpanel"
          id="panel-converted"
          aria-labelledby="tab-converted"
          className="space-y-6"
        >
          <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-slate-900">
              <TrendingUp size={15} className="shrink-0 text-slate-400" aria-hidden />
              Converted to direct
            </h2>
            <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-slate-500">
              How OTA guests became direct guests, and the revenue and commission impact. Click any
              card to chart it below.
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {conversion.map((k) => (
              <KpiCard
                key={k.key}
                kpi={k}
                active={k.metric === conversionMetric}
                onSelect={setConversionMetric}
              />
            ))}
          </div>

          <TrendChart
            metric={conversionMetric}
            metrics={CONVERSION_METRICS}
            onMetric={setConversionMetric}
            points={conversionPoints}
            subtitle={`${periodLabel}. Click a KPI above or choose a metric here.`}
          />

          <Section
            title="Campaign performance by channel"
            subtitle="Which communication channel earns the most direct guests and revenue."
          >
            <TableFrame minWidth={980} caption="Direct conversion performance by channel">
              <HeadRow>
                <Th>Channel</Th>
                <Th right>Sent</Th>
                <Th right>Delivered</Th>
                <Th right>Delivery rate</Th>
                <Th right>Click-through</Th>
                <Th right>Response rate</Th>
                <Th right>Direct conversions</Th>
                <Th right>Conversion rate</Th>
                <Th right>Direct revenue</Th>
              </HeadRow>
              <tbody className="divide-y divide-slate-100">
                {channels.map((r) => (
                  <tr key={r.key} className="transition-colors hover:bg-slate-50/70">
                    <th scope="row" className="px-3 py-3 text-left font-normal">
                      <ChannelCell channel={r.channel} hint={r.hint} iconKey={r.key} />
                    </th>
                    <Td right>{r.sent}</Td>
                    <Td right>{r.delivered}</Td>
                    <Td right>{r.deliveryRate}</Td>
                    <Td right>{r.ctr}</Td>
                    <Td right>{r.response}</Td>
                    <TdStrong>{r.conversions}</TdStrong>
                    <Td right>{r.conversionRate}</Td>
                    <TdStrong>{r.revenue}</TdStrong>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
          </Section>

          <Section
            title="Strategy performance"
            subtitle="Which messaging strategy actually produces direct guests."
          >
            <TableFrame minWidth={760} caption="Direct conversion performance by messaging strategy">
              <HeadRow>
                <Th>Strategy</Th>
                <Th right>Guests reached</Th>
                <Th right>Direct conversions</Th>
                <Th right>Conversion rate</Th>
                <Th right>Revenue</Th>
                <Th right>Revenue / conversion</Th>
              </HeadRow>
              <tbody className="divide-y divide-slate-100">
                {strategies.map((r) => (
                  <tr key={r.key} className="transition-colors hover:bg-slate-50/70">
                    <RowHead title={r.strategy} />
                    <Td right>{r.reached}</Td>
                    <TdStrong>{r.conversions}</TdStrong>
                    <Td right>{r.conversionRate}</Td>
                    <Td right>{r.revenue}</Td>
                    <Td right>{r.revenuePer}</Td>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
          </Section>

          <Section
            title="Performance by guest journey stage"
            subtitle="How each stage of the OTA Buster journey contributes to direct conversion."
          >
            <TableFrame minWidth={760} caption="Direct conversion performance by journey stage">
              <HeadRow>
                <Th>Stage</Th>
                <Th right>Guests reached</Th>
                <Th right>Engagement</Th>
                <Th right>Conversions</Th>
                <Th right>Conversion rate</Th>
                <Th right>Revenue</Th>
              </HeadRow>
              <tbody className="divide-y divide-slate-100">
                {stages.map((r) => (
                  <tr key={r.stage} className="transition-colors hover:bg-slate-50/70">
                    <RowHead title={r.stage} />
                    <td className="px-3 py-3 text-right">
                      <span className="text-[13.5px] font-semibold tabular-nums text-slate-900">
                        {r.reached}
                      </span>
                      <span className="mt-0.5 block">
                        <Delta value={r.momentum} />
                      </span>
                    </td>
                    <Td right>{r.engagement}</Td>
                    <TdStrong>{r.conversions}</TdStrong>
                    <Td right>{r.conversionRate}</Td>
                    <Td right>{r.revenue}</Td>
                  </tr>
                ))}
              </tbody>
            </TableFrame>
            <p className="mt-3 text-[11.5px] text-slate-500">
              Conversions only occur after checkout, so earlier stages show “—”.
            </p>
          </Section>
        </div>
      )}
    </div>
  );
}

/** Coverage as a labelled badge rather than a bare progress bar. */
function CoverageBadge({ percent }: { percent: number }) {
  const tone =
    percent >= 60
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : percent >= 35
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[12px] font-semibold tabular-nums ${tone}`}
    >
      {percent.toFixed(1)}%
    </span>
  );
}

export { SERIES_METRICS };
