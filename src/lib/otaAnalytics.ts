/**
 * OTA Analytics — the reporting model behind the OTA Buster analytics page.
 *
 * The model is a single funnel, told in two chapters:
 *
 *   CAPTURED   OTA guest profiles received → what was masked or missing →
 *              how complete they arrived → how many we cleaned into
 *              contactable guest profiles.
 *   CONVERTED  Guests reached → engaged → guest details identified →
 *              completeness after identification → direct bookings → revenue.
 *
 * Every number derives from one authoritative base set, scaled by period, so
 * the two tabs can never contradict each other.
 */

export type AnalyticsPeriod = "7d" | "15d" | "30d" | "90d" | "custom";

export const ANALYTICS_PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "15d", label: "Last 15 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

const FACTOR: Record<AnalyticsPeriod, number> = {
  "7d": 0.24,
  "15d": 0.5,
  "30d": 1,
  "90d": 2.65,
  custom: 1.62,
};

const scale = (n: number, p: AnalyticsPeriod) => Math.round(n * FACTOR[p]);
export const fmt = (n: number) => n.toLocaleString("en-US");
export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const pct = (n: number, of: number) => (of ? (n / of) * 100 : 0);
const pctText = (n: number, of: number) => `${pct(n, of).toFixed(1)}%`;

/* ------------------------------ base values ----------------------------- */

const BASE = {
  /** Chapter 1 — what the OTA booking engines handed us. */
  received: 12483,
  maskedEmail: 4310,
  maskedPhone: 3120,
  maskedAddress: 2480,
  /** Profiles carrying at least one masked contact field. */
  maskedProfiles: 5860,
  missingEmail: 1753,
  missingPhone: 2940,
  missingAddress: 4120,
  /** Profiles missing at least one contact field on arrival. */
  missingProfiles: 4055,
  /** Profiles that arrived with email + phone + address. */
  completeReceived: 8426,
  /** Chapter 1 outcome — usable after cleanup. */
  contactable: 8420,
  completeAfterCleanup: 6938,

  /** Chapter 2 — campaign. */
  reached: 8240,
  engaged: 3820,
  identified: 3410,
  identifiedEmail: 3410,
  identifiedPhone: 2760,
  identifiedAddress: 1980,
  identifiedMissingEmail: 0,
  identifiedMissingPhone: 650,
  identifiedMissingAddress: 1430,
  completeAfterIdentification: 1962,
  bookings: 642,
  revenue: 84200,
  commissionAvoided: 14310,
};

/** Effective commission rate the hotel now pays across converted revenue. */
const EFFECTIVE_COMMISSION = pct(BASE.commissionAvoided, BASE.revenue);

export type Kpi = {
  key: string;
  label: string;
  /** Small stage qualifier shown above the label, e.g. "As received". */
  stage?: string;
  value: string;
  delta: number;
  meta?: string;
  /** Longer explanation, surfaced through the card's info affordance. */
  tooltip?: string;
  /** Relationship to the previous funnel stage, e.g. "67.5% of profiles received". */
  relation?: string;
  /** Optional contact-type breakdown rendered inside the card. */
  breakdown?: { label: string; value: string; share?: string }[];
  /** Visual weight — "primary" cards anchor a category. */
  emphasis?: "primary" | "secondary";
  /** Series metric this card drives when clicked. */
  metric?: SeriesMetric;
};

/* =========================== TAB 1 — CAPTURED ============================ */

export type FunnelCategory = {
  id: string;
  index: string;
  title: string;
  description: string;
  /** Percentage bridge shown above this category. */
  bridge?: string;
  kpis: Kpi[];
};

export function capturedFunnel(period: AnalyticsPeriod, engine: EngineId): FunnelCategory[] {
  const e = engineProfile(engine);
  const received = Math.round(scale(BASE.received, period) * e.share);
  const m = (n: number) => Math.round(scale(n, period) * e.share * e.maskedBias);
  const x = (n: number) => Math.round(scale(n, period) * e.share * e.missingBias);
  const c = (n: number) => Math.round(scale(n, period) * e.share * e.captureBias);

  const maskedProfiles = Math.min(m(BASE.maskedProfiles), received);
  const missingProfiles = Math.min(x(BASE.missingProfiles), received);
  const completeReceived = Math.min(c(BASE.completeReceived), received);
  const contactable = Math.min(c(BASE.contactable), received);
  const completeCleaned = Math.min(c(BASE.completeAfterCleanup), contactable);

  return [
    {
      id: "received",
      index: "01",
      title: "OTA profiles received",
      description: "Everything downstream is measured against this baseline.",
      kpis: [
        {
          key: "received",
          label: "OTA Guest Profiles Received",
          value: fmt(received),
          delta: 4.1,
          meta: "Guest profiles received from OTA booking engines.",
          relation: "100% baseline",
          tooltip:
            "Every guest profile handed over by a connected OTA booking engine during the selected period. All percentages on this tab are calculated from this number.",
          emphasis: "primary",
          metric: "received",
        },
      ],
    },
    {
      id: "quality",
      index: "02",
      title: "Data quality",
      description: "What the received profiles actually contain.",
      bridge: `${pctText(maskedProfiles, received)} arrived with masked contact details`,
      kpis: [
        {
          key: "masked",
          label: "Masked Contact Details",
          value: fmt(maskedProfiles),
          delta: -3.4,
          meta: "Profiles where the OTA supplied contact details in a masked form.",
          relation: `${pctText(maskedProfiles, received)} of profiles received`,
          tooltip:
            "Masked means the OTA did supply the information, but obscured it behind a relay value that expires. It exists, but it is not usable as-is.",
          breakdown: [
            {
              label: "Masked Email",
              value: fmt(m(BASE.maskedEmail)),
              share: pctText(m(BASE.maskedEmail), received),
            },
            {
              label: "Masked Phone",
              value: fmt(m(BASE.maskedPhone)),
              share: pctText(m(BASE.maskedPhone), received),
            },
            {
              label: "Masked Address",
              value: fmt(m(BASE.maskedAddress)),
              share: pctText(m(BASE.maskedAddress), received),
            },
          ],
          emphasis: "primary",
          metric: "masked",
        },
        {
          key: "missing",
          label: "Missing Contact Details",
          value: fmt(missingProfiles),
          delta: -7.9,
          meta: "Profiles where the OTA did not provide a contact field at all.",
          relation: `${pctText(missingProfiles, received)} of profiles received`,
          tooltip:
            "Missing is different from masked: the guest profile received from the OTA simply does not contain this contact field in any form.",
          breakdown: [
            {
              label: "Missing Email",
              value: fmt(x(BASE.missingEmail)),
              share: pctText(x(BASE.missingEmail), received),
            },
            {
              label: "Missing Phone",
              value: fmt(x(BASE.missingPhone)),
              share: pctText(x(BASE.missingPhone), received),
            },
            {
              label: "Missing Address",
              value: fmt(x(BASE.missingAddress)),
              share: pctText(x(BASE.missingAddress), received),
            },
          ],
          emphasis: "primary",
          metric: "missing",
        },
      ],
    },
    {
      id: "completeness",
      index: "03",
      title: "Profile completeness",
      description: "How complete the profiles were the moment they arrived.",
      bridge: `${pctText(completeReceived, received)} arrived complete`,
      kpis: [
        {
          key: "completenessReceived",
          label: "Profile Completeness",
          stage: "As received",
          value: `${pct(completeReceived, received).toFixed(1)}%`,
          delta: 3.6,
          meta: "Profiles containing email, phone, and address when received.",
          relation: `${fmt(completeReceived)} of ${fmt(received)} profiles received`,
          tooltip:
            "A profile counts as complete when all three contact fields — email, phone and address — are present and unmasked on arrival.",
          emphasis: "primary",
          metric: "completenessReceived",
        },
      ],
    },
    {
      id: "usable",
      index: "04",
      title: "Cleaned & usable profiles",
      description: "The handoff into Converted.",
      bridge: `${pctText(contactable, received)} became contactable after cleanup`,
      kpis: [
        {
          key: "contactable",
          label: "Contactable Guest Profiles",
          value: fmt(contactable),
          delta: 6.8,
          meta: "Guest profiles with usable contact information after data cleanup.",
          relation: `${pctText(contactable, received)} of profiles received`,
          tooltip:
            "Profiles the hotel can actually reach: at least one verified, unmasked contact channel after the cleanup step.",
          emphasis: "primary",
          metric: "contactable",
        },
        {
          key: "completenessCleaned",
          label: "Profile Completeness",
          stage: "After cleanup",
          value: `${pct(completeCleaned, contactable).toFixed(1)}%`,
          delta: 9.1,
          meta: "Complete guest profiles after identifying and cleaning available contact details.",
          relation: `${fmt(completeCleaned)} of ${fmt(contactable)} contactable profiles`,
          tooltip:
            "Measured against contactable profiles, not the full received population — this is the quality of the data the campaign will actually use.",
          emphasis: "secondary",
          metric: "completenessCleaned",
        },
      ],
    },
  ];
}

/* ========================== TAB 2 — CONVERTED ============================ */

export function convertedFunnel(period: AnalyticsPeriod): FunnelCategory[] {
  const contactable = scale(BASE.contactable, period);
  const reached = scale(BASE.reached, period);
  const engaged = scale(BASE.engaged, period);
  const identified = scale(BASE.identified, period);
  const complete = scale(BASE.completeAfterIdentification, period);
  const bookings = scale(BASE.bookings, period);
  const revenue = scale(BASE.revenue, period);
  const avg = bookings ? Math.round(revenue / bookings) : 0;

  return [
    {
      id: "reach",
      index: "01",
      title: "Campaign reach",
      description: "Picking up where Captured left off.",
      bridge: `${pctText(reached, contactable)} of contactable guest profiles were reached`,
      kpis: [
        {
          key: "reached",
          label: "Guests Reached",
          value: fmt(reached),
          delta: 6.2,
          meta: "OTA guests reached through the OTA Buster journey.",
          relation: `${pctText(reached, contactable)} of contactable guest profiles`,
          tooltip:
            "A guest counts as reached once at least one journey message was successfully delivered on any channel.",
          emphasis: "primary",
          metric: "reached",
        },
        {
          key: "engaged",
          label: "Guests Engaged",
          value: fmt(engaged),
          delta: 11.9,
          meta: "Guests who interacted with the campaign.",
          relation: `${pctText(engaged, reached)} of guests reached`,
          tooltip:
            "Engagement means the guest opened, clicked, replied or completed a step in the journey.",
          emphasis: "primary",
          metric: "engaged",
        },
      ],
    },
    {
      id: "identification",
      index: "02",
      title: "Guest identification",
      description: "What engagement turned into usable guest detail.",
      bridge: `${pctText(identified, engaged)} of engaged guests were identified`,
      kpis: [
        {
          key: "identified",
          label: "Guest Details Identified",
          value: fmt(identified),
          delta: 14.3,
          meta: "Contact details identified through guest engagement.",
          relation: `${pctText(identified, engaged)} of guests engaged`,
          tooltip:
            "Identified contact details were previously masked by the OTA and became usable through guest engagement.",
          breakdown: [
            { label: "Email Identified", value: fmt(scale(BASE.identifiedEmail, period)) },
            { label: "Phone Identified", value: fmt(scale(BASE.identifiedPhone, period)) },
            { label: "Address Identified", value: fmt(scale(BASE.identifiedAddress, period)) },
          ],
          emphasis: "primary",
          metric: "identified",
        },
        {
          key: "identifiedMissing",
          label: "Missing Contact Details",
          value: fmt(
            scale(
              BASE.identifiedMissingEmail +
                BASE.identifiedMissingPhone +
                BASE.identifiedMissingAddress,
              period,
            ),
          ),
          delta: -8.7,
          meta: "Contact fields still absent from identified guest profiles.",
          relation: "Why identified profiles are not yet complete",
          tooltip:
            "These fields were never supplied by the OTA and have not been recovered through engagement, so the identified profile stays partial.",
          breakdown: [
            { label: "Missing Email", value: fmt(scale(BASE.identifiedMissingEmail, period)) },
            { label: "Missing Phone", value: fmt(scale(BASE.identifiedMissingPhone, period)) },
            { label: "Missing Address", value: fmt(scale(BASE.identifiedMissingAddress, period)) },
          ],
          emphasis: "secondary",
        },
        {
          key: "completenessIdentified",
          label: "Profile Completeness",
          stage: "After identification",
          value: `${pct(complete, identified).toFixed(1)}%`,
          delta: 12.4,
          meta: "Identified guest profiles containing email, phone, and address.",
          relation: `${fmt(complete)} of ${fmt(identified)} identified profiles`,
          tooltip:
            "Completeness of the profiles obtained through guest engagement — all three contact fields present and usable.",
          emphasis: "primary",
          metric: "completenessIdentified",
        },
      ],
    },
    {
      id: "conversion",
      index: "03",
      title: "Direct conversion",
      description: "From guest data to commercial outcome.",
      bridge: `${pctText(bookings, reached)} of reached guests booked direct`,
      kpis: [
        {
          key: "bookings",
          label: "Direct Bookings",
          value: fmt(bookings),
          delta: 18.2,
          meta: "OTA guests who booked directly.",
          relation: `${pctText(bookings, reached)} of guests reached`,
          tooltip:
            "Bookings made on the hotel's own channels by guests who originally arrived through an OTA.",
          emphasis: "primary",
          metric: "bookings",
        },
        {
          key: "bookingRate",
          label: "Booking Conversion Rate",
          value: `${pct(bookings, reached).toFixed(1)}%`,
          delta: 11.4,
          meta: "Direct bookings as a percentage of guests reached.",
          relation: `${fmt(bookings)} of ${fmt(reached)} guests reached`,
          tooltip:
            "The headline efficiency measure of the journey: how many reached guests it converts into direct bookings.",
          emphasis: "secondary",
          metric: "bookingRate",
        },
      ],
    },
    {
      id: "financial",
      index: "04",
      title: "Financial impact",
      description: "What the direct bookings were worth.",
      bridge: `${money(avg)} average direct booking value`,
      kpis: [
        {
          key: "revenue",
          label: "Direct Revenue",
          value: money(revenue),
          delta: 18.2,
          meta: "Revenue generated from direct bookings.",
          relation: `${money(avg)} per direct booking`,
          tooltip: "Room revenue booked directly by guests converted through the OTA Buster journey.",
          emphasis: "primary",
          metric: "revenue",
        },
        {
          key: "commissionRate",
          label: "Effective Commission Rate",
          value: `${EFFECTIVE_COMMISSION.toFixed(1)}%`,
          delta: -6.9,
          meta: "Blended commission carried across converted revenue.",
          relation: "Lower is better",
          tooltip:
            "The share of converted revenue still absorbed by distribution cost once the OTA guest books direct — the blended rate across all converted bookings in this period.",
          emphasis: "secondary",
          metric: "commissionRate",
        },
      ],
    },
  ];
}

/* --------------------- conversion by journey stage ---------------------- */

const STAGES = [
  { stage: "Just Booked", reached: 8240, momentum: 8.4, engagement: "14.5%", conversions: 0, revenue: 0 },
  { stage: "Pre-Check-In", reached: 6480, momentum: 6.1, engagement: "15.8%", conversions: 0, revenue: 0 },
  { stage: "During Stay", reached: 6120, momentum: 9.3, engagement: "14.2%", conversions: 0, revenue: 0 },
  { stage: "Post-Checkout", reached: 5940, momentum: 7.6, engagement: "13.9%", conversions: 380, revenue: 49800 },
  { stage: "Winback / Retain", reached: 4210, momentum: 5.2, engagement: "12.8%", conversions: 262, revenue: 34400 },
];

export type StageRow = {
  stage: string;
  reached: string;
  momentum: number;
  engagement: string;
  conversions: string;
  conversionRate: string;
  revenue: string;
};

export function stageRows(period: AnalyticsPeriod): StageRow[] {
  return STAGES.map((r) => ({
    stage: r.stage,
    reached: fmt(scale(r.reached, period)),
    momentum: r.momentum,
    engagement: r.engagement,
    conversions: r.conversions ? fmt(scale(r.conversions, period)) : "—",
    conversionRate: r.conversions ? `${pct(r.conversions, r.reached).toFixed(1)}%` : "—",
    revenue: r.revenue ? money(scale(r.revenue, period)) : "—",
  }));
}

/* --------------------------- strategy performance ----------------------- */

const STRATEGIES = [
  { key: "email", strategy: "Email", reached: 3860, conversions: 412, revenue: 53400 },
  { key: "text", strategy: "Text", reached: 1640, conversions: 142, revenue: 18200 },
  { key: "text_fallback", strategy: "Text with Email fallback", reached: 1490, conversions: 96, revenue: 8100 },
  { key: "both", strategy: "Email + Text", reached: 1250, conversions: 88, revenue: 4500 },
];

export type StrategyRow = {
  key: string;
  strategy: string;
  reached: string;
  conversions: string;
  conversionRate: string;
  revenue: string;
  revenuePer: string;
};

export function strategyRows(period: AnalyticsPeriod): StrategyRow[] {
  return STRATEGIES.map((c) => ({
    key: c.key,
    strategy: c.strategy,
    reached: fmt(scale(c.reached, period)),
    conversions: fmt(scale(c.conversions, period)),
    conversionRate: `${pct(c.conversions, c.reached).toFixed(1)}%`,
    revenue: money(scale(c.revenue, period)),
    revenuePer: money(Math.round(c.revenue / c.conversions)),
  }));
}

/* ------------------------------ time series ----------------------------- */

export type SeriesMetric =
  | "received"
  | "masked"
  | "missing"
  | "completenessReceived"
  | "contactable"
  | "completenessCleaned"
  | "reached"
  | "engaged"
  | "identified"
  | "completenessIdentified"
  | "bookings"
  | "bookingRate"
  | "revenue"
  | "commissionRate";

const SERIES: Record<SeriesMetric, { label: string; chartTitle: string; format: SeriesFormat; daily: number }> = {
  received: {
    label: "OTA Guest Profiles Received",
    chartTitle: "OTA Guest Profiles Received Over Time",
    format: "number",
    daily: BASE.received / 30,
  },
  masked: {
    label: "Masked Contact Details",
    chartTitle: "Masked Contact Details Over Time",
    format: "number",
    daily: BASE.maskedProfiles / 30,
  },
  missing: {
    label: "Missing Contact Details",
    chartTitle: "Missing Contact Details Over Time",
    format: "number",
    daily: BASE.missingProfiles / 30,
  },
  completenessReceived: {
    label: "Profile Completeness — As Received",
    chartTitle: "Profile Completeness Over Time",
    format: "percent",
    daily: pct(BASE.completeReceived, BASE.received),
  },
  contactable: {
    label: "Contactable Guest Profiles",
    chartTitle: "Contactable Guest Profiles Over Time",
    format: "number",
    daily: BASE.contactable / 30,
  },
  completenessCleaned: {
    label: "Profile Completeness — After Cleanup",
    chartTitle: "Profile Completeness After Cleanup Over Time",
    format: "percent",
    daily: pct(BASE.completeAfterCleanup, BASE.contactable),
  },
  reached: {
    label: "Guests Reached",
    chartTitle: "Guests Reached Over Time",
    format: "number",
    daily: BASE.reached / 30,
  },
  engaged: {
    label: "Guests Engaged",
    chartTitle: "Guests Engaged Over Time",
    format: "number",
    daily: BASE.engaged / 30,
  },
  identified: {
    label: "Guest Details Identified",
    chartTitle: "Guest Details Identified Over Time",
    format: "number",
    daily: BASE.identified / 30,
  },
  completenessIdentified: {
    label: "Profile Completeness — After Identification",
    chartTitle: "Identified Profile Completeness Over Time",
    format: "percent",
    daily: pct(BASE.completeAfterIdentification, BASE.identified),
  },
  bookings: {
    label: "Direct Bookings",
    chartTitle: "Direct Bookings Over Time",
    format: "number",
    daily: BASE.bookings / 30,
  },
  bookingRate: {
    label: "Booking Conversion Rate",
    chartTitle: "Booking Conversion Rate Over Time",
    format: "percent",
    daily: pct(BASE.bookings, BASE.reached),
  },
  revenue: {
    label: "Direct Revenue",
    chartTitle: "Direct Revenue Over Time",
    format: "money",
    daily: BASE.revenue / 30,
  },
  commissionRate: {
    label: "Effective Commission Rate",
    chartTitle: "Effective Commission Rate Over Time",
    format: "percent",
    daily: EFFECTIVE_COMMISSION,
  },
};

export type SeriesFormat = "number" | "money" | "percent";

export const CAPTURE_METRICS: SeriesMetric[] = [
  "received",
  "masked",
  "missing",
  "completenessReceived",
  "contactable",
  "completenessCleaned",
];

export const CONVERSION_METRICS: SeriesMetric[] = [
  "reached",
  "engaged",
  "identified",
  "completenessIdentified",
  "bookings",
  "bookingRate",
  "revenue",
  "commissionRate",
];

export const seriesLabel = (m: SeriesMetric) => SERIES[m].label;
export const seriesChartTitle = (m: SeriesMetric) => SERIES[m].chartTitle;
export const seriesFormat = (m: SeriesMetric): SeriesFormat => SERIES[m].format;

const DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "15d": 15,
  "30d": 30,
  "90d": 90,
  custom: 45,
};

/** Stable pseudo-random wobble so the chart reads like real traffic. */
function wobble(i: number, seed: number) {
  const x = Math.sin((i + 1) * (12.9898 + seed)) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 0.34;
}

export type SeriesPoint = { date: string; current: number };

export function series(metric: SeriesMetric, period: AnalyticsPeriod): SeriesPoint[] {
  const days = DAYS[period];
  const step = days > 45 ? 3 : 1;
  const rate = SERIES[metric].format === "percent";
  const base = rate ? SERIES[metric].daily : SERIES[metric].daily * step;
  const seed = metric.length;
  const points: SeriesPoint[] = [];
  const end = new Date(Date.UTC(2026, 7, 17));

  for (let i = days - 1; i >= 0; i -= step) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    const trend = 1 + ((days - i) / days) * (rate ? 0.08 : 0.22);
    const value = base * trend * (1 + wobble(i, seed) * (rate ? 0.25 : 1));
    points.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      current: rate ? Math.max(0, Number(value.toFixed(1))) : Math.max(0, Math.round(value)),
    });
  }
  return points;
}

/* ------------------------------ OTA engines ----------------------------- */

/**
 * Booking engines the guest profiles arrived from. Data quality differs a lot
 * by engine, so the Captured tab can be filtered to a single engine as a
 * supporting analytical view.
 */
export type EngineId = "all" | "booking" | "expedia" | "airbnb" | "agoda" | "hotels" | "other";

type EngineProfile = {
  value: EngineId;
  label: string;
  share: number;
  captureBias: number;
  maskedBias: number;
  missingBias: number;
};

const ENGINE_PROFILES: EngineProfile[] = [
  { value: "booking", label: "Booking.com", share: 0.38, captureBias: 0.94, maskedBias: 1.28, missingBias: 0.86 },
  { value: "expedia", label: "Expedia", share: 0.22, captureBias: 1.12, maskedBias: 0.72, missingBias: 0.74 },
  { value: "airbnb", label: "Airbnb", share: 0.14, captureBias: 0.71, maskedBias: 1.64, missingBias: 1.42 },
  { value: "agoda", label: "Agoda", share: 0.11, captureBias: 0.88, maskedBias: 1.06, missingBias: 1.18 },
  { value: "hotels", label: "Hotels.com", share: 0.09, captureBias: 1.05, maskedBias: 0.81, missingBias: 0.9 },
  { value: "other", label: "Other engines", share: 0.06, captureBias: 0.97, maskedBias: 0.95, missingBias: 1.1 },
];

export const OTA_ENGINES: { value: EngineId; label: string }[] = [
  { value: "all", label: "All OTA engines" },
  ...ENGINE_PROFILES.map((e) => ({ value: e.value, label: e.label })),
];

export const engineLabel = (id: EngineId) =>
  OTA_ENGINES.find((e) => e.value === id)?.label ?? "All OTA engines";

const ALL_ENGINES: EngineProfile = {
  value: "all",
  label: "All OTA engines",
  share: 1,
  captureBias: 1,
  maskedBias: 1,
  missingBias: 1,
};

function engineProfile(id: EngineId) {
  return id === "all" ? ALL_ENGINES : (ENGINE_PROFILES.find((e) => e.value === id) ?? ALL_ENGINES);
}

/* --------------- supporting view — quality by booking engine ------------- */

export type EngineRow = {
  key: EngineId;
  engine: string;
  share: string;
  received: string;
  masked: string;
  missing: string;
  contactable: string;
  completeness: string;
  completenessValue: number;
};

export function engineRows(period: AnalyticsPeriod): EngineRow[] {
  return ENGINE_PROFILES.map((e) => {
    const received = Math.round(scale(BASE.received, period) * e.share);
    const contactable = Math.round(scale(BASE.contactable, period) * e.share * e.captureBias);
    const complete = Math.round(scale(BASE.completeReceived, period) * e.share * e.captureBias);
    return {
      key: e.value,
      engine: e.label,
      share: `${Math.round(e.share * 100)}%`,
      received: fmt(received),
      masked: fmt(Math.round(scale(BASE.maskedProfiles, period) * e.share * e.maskedBias)),
      missing: fmt(Math.round(scale(BASE.missingProfiles, period) * e.share * e.missingBias)),
      contactable: fmt(contactable),
      completeness: `${pct(complete, received).toFixed(1)}%`,
      completenessValue: pct(complete, received),
    };
  }).sort((a, b) => b.completenessValue - a.completenessValue);
}

/** Engine-aware series: capture metrics respond to the OTA engine filter. */
export function seriesFor(
  metric: SeriesMetric,
  period: AnalyticsPeriod,
  engine: EngineId,
): SeriesPoint[] {
  const base = series(metric, period);
  if (engine === "all" || SERIES[metric].format === "percent") return base;
  const e = engineProfile(engine);
  const bias =
    metric === "masked" ? e.maskedBias : metric === "missing" ? e.missingBias : e.captureBias;
  const f = e.share * (metric === "received" ? 1 : bias);
  return base.map((p) => ({ ...p, current: Math.max(0, Math.round(p.current * f)) }));
}
