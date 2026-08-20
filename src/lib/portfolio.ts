/**
 * Portfolio analytics data layer.
 *
 * Deterministic mock data for a hospitality group so the analytics and ROI
 * surfaces can demonstrate portfolio totals vs. per-property averages without
 * a backend. Every number is derived from the property list, so selecting a
 * subset of properties recalculates totals and averages exactly.
 */

export type MetricView = "both" | "total" | "average";

export type KpiKey =
  | "revenue"
  | "subscribers"
  | "guestsReached"
  | "otaGuests"
  | "directBookings"
  | "outreach"
  | "clicks"
  | "reviews"
  | "conversions"
  | "invoice";

export type Property = {
  id: string;
  name: string;
  brand: string;
  region: string;
  /** Monthly revenue, oldest → newest, aligned with MONTHS. */
  revenue: number[];
  invoice: number[];
  subscribers: number;
  guestsReached: number;
  otaGuests: number;
  directBookings: number;
  outreach: number;
  clicks: number;
  reviews: number;
  conversions: number;
};

export const MONTHS = ["May 2026", "June 2026", "July 2026"] as const;

const NAMES: [string, string, string][] = [
  ["Vespera Resort on Pismo Beach", "Autograph Collection", "West"],
  ["Pismo Lighthouse Suites", "Independent", "West"],
  ["Pacific Point Resort", "Independent", "West"],
  ["Marram Montauk", "Independent", "East"],
  ["The Piccolo Paso Robles", "Independent", "West"],
  ["Paso Robles Inn", "Independent", "West"],
  ["Avila Beach House", "Independent", "West"],
  ["Peregrine Hospitality HQ", "Group", "Central"],
  ["Sheraton San Diego Resort", "Marriott", "West"],
  ["Silverado Resort", "Independent", "West"],
  ["The Tess Hotel", "Autograph Collection", "West"],
  ["Hotel Kallithea", "Independent", "EMEA"],
  ["Valley Lodge", "Independent", "Central"],
  ["Harborview Suites", "Independent", "East"],
  ["Cedar & Pine Inn", "Independent", "Central"],
  ["The Amalfi Grand", "Luxury Collection", "EMEA"],
  ["Northshore Retreat", "Independent", "East"],
  ["Desert Bloom Resort", "Independent", "West"],
  ["Riverbend Hotel", "Independent", "Central"],
  ["Belmont Park Hotel", "Independent", "East"],
  ["Lakeside Chalet", "Independent", "Central"],
  ["Casa Marina Club", "Independent", "East"],
  ["Sundial Beach Resort", "Independent", "East"],
  ["The Oakwell", "Independent", "EMEA"],
  ["Granite Peak Lodge", "Independent", "West"],
  ["Alder House", "Independent", "Central"],
  ["Bayfront Terrace", "Independent", "East"],
  ["Olive Grove Hotel", "Independent", "EMEA"],
  ["Copper Canyon Inn", "Independent", "West"],
  ["Seabird Hotel", "Independent", "West"],
  ["The Wren", "Independent", "East"],
  ["Highland Court", "Independent", "EMEA"],
  ["Palmetto Bay Resort", "Independent", "East"],
  ["Juniper Ridge Lodge", "Independent", "Central"],
  ["Anchorline Hotel", "Independent", "East"],
  ["Solstice Springs", "Independent", "West"],
  ["Foxglove Manor", "Independent", "EMEA"],
  ["Kestrel Bay Inn", "Independent", "West"],
  ["Windrow Hotel", "Independent", "Central"],
  ["Mariner's Rest", "Independent", "East"],
  ["Thornbury House", "Independent", "EMEA"],
  ["Sagebrush Resort", "Independent", "West"],
  ["Lantern Hill Hotel", "Independent", "Central"],
];

/** Small deterministic pseudo-random so the demo data never shifts. */
function seeded(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export const PROPERTIES: Property[] = NAMES.map(([name, brand, region], i) => {
  const scale = 0.25 + seeded(i + 1) * 2.4;
  const base = 42000 * scale;
  return {
    id: `p${i + 1}`,
    name,
    brand,
    region,
    revenue: [base, base * (1.1 + seeded(i + 9) * 0.5), base * (1.3 + seeded(i + 21) * 0.9)].map(
      (v) => Math.round(v),
    ),
    invoice: [349, 398, 464, 695, 1510][i % 5] ? [
      Math.round([349, 398, 464, 695, 1510][i % 5]),
      Math.round([349, 398, 464, 695, 1510][i % 5]),
      Math.round([349, 398, 464, 695, 1510][i % 5] * (i % 7 === 0 ? 0 : 1)),
    ] : [0, 0, 0],
    subscribers: Math.round(120 + seeded(i + 31) * 700),
    guestsReached: Math.round(300 + seeded(i + 41) * 2200),
    otaGuests: Math.round(40 + seeded(i + 51) * 320),
    directBookings: Math.round(4 + seeded(i + 61) * 40),
    outreach: Math.round(500 + seeded(i + 71) * 3400),
    clicks: Math.round(60 + seeded(i + 81) * 640),
    reviews: Math.round(seeded(i + 91) * 24),
    conversions: Math.round(2 + seeded(i + 101) * 28),
  };
});

/* ----------------------------- Aggregation ----------------------------- */

export type KpiDef = {
  key: KpiKey;
  label: string;
  hint: string;
  format: "currency" | "number";
  /** Averages of money are shown with cents-free currency; counts get 1 decimal. */
  averageFormat?: "currency" | "decimal";
};

export const KPIS: KpiDef[] = [
  { key: "revenue", label: "Revenue", hint: "Booking revenue attributed to Directful", format: "currency", averageFormat: "currency" },
  { key: "directBookings", label: "Direct bookings", hint: "Bookings made on your own site", format: "number", averageFormat: "decimal" },
  { key: "subscribers", label: "Subscribers", hint: "Opted-in guest contacts", format: "number", averageFormat: "decimal" },
  { key: "guestsReached", label: "Guests reached", hint: "Unique guests messaged in range", format: "number", averageFormat: "decimal" },
  { key: "otaGuests", label: "OTA guests reached", hint: "Guests acquired via OTA and re-engaged", format: "number", averageFormat: "decimal" },
  { key: "outreach", label: "Outreach sent", hint: "Emails and SMS delivered", format: "number", averageFormat: "decimal" },
  { key: "clicks", label: "Clicks", hint: "Link clicks across all messages", format: "number", averageFormat: "decimal" },
  { key: "conversions", label: "Conversions", hint: "Messages that ended in a booking", format: "number", averageFormat: "decimal" },
  { key: "reviews", label: "Reviews collected", hint: "New reviews attributed to campaigns", format: "number", averageFormat: "decimal" },
];

function kpiValue(p: Property, key: KpiKey) {
  if (key === "revenue") return p.revenue.reduce((a, b) => a + b, 0);
  if (key === "invoice") return p.invoice.reduce((a, b) => a + b, 0);
  return p[key] as number;
}

export type KpiResult = { key: KpiKey; total: number; average: number; delta: number };

export function aggregate(selected: Property[]): Record<KpiKey, KpiResult> {
  const out = {} as Record<KpiKey, KpiResult>;
  for (const def of [...KPIS, { key: "invoice" as KpiKey }]) {
    const total = selected.reduce((a, p) => a + kpiValue(p, def.key), 0);
    out[def.key] = {
      key: def.key,
      total,
      average: selected.length ? total / selected.length : 0,
      // Deterministic period-over-period delta for the demo.
      delta: Math.round((seeded(def.key.length + selected.length) * 34 - 8) * 10) / 10,
    };
  }
  return out;
}

export type MonthlyRow = {
  id: string;
  name: string;
  brand: string;
  revenue: number[];
  invoice: number[];
};

export function monthlyRows(selected: Property[]): MonthlyRow[] {
  return selected.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    revenue: p.revenue,
    invoice: p.invoice,
  }));
}

export function columnTotals(rows: MonthlyRow[], field: "revenue" | "invoice") {
  return MONTHS.map((_, i) => rows.reduce((a, r) => a + (r[field][i] ?? 0), 0));
}

/* ------------------------------ Formatting ----------------------------- */

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const currencyCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const dec = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatMetric(value: number, format: "currency" | "number" | "decimal" | "money2") {
  if (format === "currency") return currency.format(value);
  if (format === "money2") return currencyCents.format(value);
  if (format === "decimal") return dec.format(value);
  return int.format(value);
}
