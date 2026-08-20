/**
 * Guest data captured by the OTA Buster journey.
 *
 * Every automated campaign contributes to guest-data enrichment, so each stage
 * and each individual message reports how much email, phone and address data
 * it captured. During Stay additionally breaks the capture down by source.
 *
 * Deterministic sample data for the prototype.
 */

import type { Period, StageId } from "@/lib/otaJourney";

const scale = (n: number, p: Period) =>
  Math.round(n * (p === "7d" ? 0.24 : p === "90d" ? 2.65 : p === "custom" ? 1.62 : 1));

const fmt = (n: number) => n.toLocaleString("en-US");

export type CaptureKind = "email" | "phone" | "address";

export type CaptureRow = { key: CaptureKind; label: string; value: string; raw: number };

const CAPTURE: Record<StageId, Record<CaptureKind, number>> = {
  just_booked: { email: 6420, phone: 5180, address: 3940 },
  pre_checkin: { email: 4980, phone: 4120, address: 3060 },
  during_stay: { email: 4310, phone: 3860, address: 2940 },
  post_checkout: { email: 3720, phone: 2980, address: 2110 },
  retain: { email: 2480, phone: 1940, address: 1520 },
};

const LABEL: Record<CaptureKind, string> = {
  email: "Email",
  phone: "Phone",
  address: "Address",
};

/** Full label used where there is room for it. */
export const CAPTURE_LABEL_LONG: Record<CaptureKind, string> = {
  email: "Email addresses",
  phone: "Phone numbers",
  address: "Home addresses",
};

/** Stable per-stage, per-kind momentum so every tile can show direction. */
const CAPTURE_MOMENTUM: Record<StageId, Record<CaptureKind, number>> = {
  just_booked: { email: 8.4, phone: 6.1, address: 4.2 },
  pre_checkin: { email: 6.1, phone: 4.8, address: 3.1 },
  during_stay: { email: 9.3, phone: 7.4, address: 5.6 },
  post_checkout: { email: 7.6, phone: 5.2, address: -1.8 },
  retain: { email: 5.2, phone: 3.4, address: 2.1 },
};

export function captureMomentum(id: StageId, kind: CaptureKind) {
  return CAPTURE_MOMENTUM[id][kind];
}

export function stageCapture(id: StageId, period: Period): CaptureRow[] {
  const base = CAPTURE[id];
  return (Object.keys(LABEL) as CaptureKind[]).map((key) => {
    const raw = scale(base[key], period);
    return { key, label: LABEL[key], value: fmt(raw), raw };
  });
}

/** Stable 0–1 weight per message so each message reports its own contribution. */
function weight(msgId: string) {
  let h = 0;
  for (let i = 0; i < msgId.length; i += 1) h = (h * 31 + msgId.charCodeAt(i)) % 997;
  return 0.16 + (h % 30) / 100; // 0.16 – 0.45
}

export function messageCapture(id: StageId, msgId: string, period: Period): CaptureRow[] {
  const w = weight(msgId);
  return stageCapture(id, period).map((row) => {
    const raw = Math.round(row.raw * w);
    return { ...row, raw, value: fmt(raw) };
  });
}

/* --------------------------- capture by source --------------------------- */

export type CaptureSource = {
  key: "campaign" | "staff" | "id_scan";
  label: string;
  hint: string;
  /** Guests whose profile was completed through this source. */
  guests: number;
  rate: number;
  momentum: number;
  counts: Record<CaptureKind, number>;
};

const SOURCES: CaptureSource[] = [
  {
    key: "campaign",
    label: "Automated campaign",
    hint: "Guest completed a Directful capture experience",
    guests: 3126,
    rate: 49,
    momentum: 12,
    counts: { email: 2840, phone: 1920, address: 1140 },
  },
  {
    key: "staff",
    label: "Staff collected",
    hint: "Entered by hotel staff at the desk",
    guests: 1840,
    rate: 28,
    momentum: 6,
    counts: { email: 1420, phone: 980, address: 460 },
  },
  {
    key: "id_scan",
    label: "ID scanned",
    hint: "Read from the guest's ID at check-in",
    guests: 3180,
    rate: 53,
    momentum: 18,
    counts: { email: 2160, phone: 1580, address: 1280 },
  },
];

export type CaptureSourceRow = Omit<CaptureSource, "guests" | "counts"> & {
  guests: string;
  counts: Record<CaptureKind, string>;
};

export function captureBySource(period: Period): CaptureSourceRow[] {
  return SOURCES.map((s) => ({
    ...s,
    guests: fmt(scale(s.guests, period)),
    counts: {
      email: fmt(scale(s.counts.email, period)),
      phone: fmt(scale(s.counts.phone, period)),
      address: fmt(scale(s.counts.address, period)),
    },
  }));
}

export const CAPTURE_KINDS: CaptureKind[] = ["email", "phone", "address"];
export const CAPTURE_LABEL = LABEL;

/* ------------------------ Post-Checkout outcomes ----------------------- */

export type FeedbackOutcome = {
  key: string;
  label: string;
  value: string;
  share: number;
  hint: string;
  tone: "good" | "warn" | "neutral";
};

export function feedbackOutcomes(period: Period): FeedbackOutcome[] {
  const raw = [
    {
      key: "positive",
      label: "Positive feedback",
      n: 3960,
      hint: "Guests routed to a public review",
      tone: "good" as const,
    },
    {
      key: "negative",
      label: "Negative feedback",
      n: 640,
      hint: "Routed privately to the hotel team",
      tone: "warn" as const,
    },
    {
      key: "none",
      label: "No response",
      n: 1880,
      hint: "Reminder sent, still no answer",
      tone: "neutral" as const,
    },
  ];
  const total = raw.reduce((a, r) => a + r.n, 0);
  return raw.map((r) => ({
    key: r.key,
    label: r.label,
    value: fmt(scale(r.n, period)),
    share: Math.round((r.n / total) * 100),
    hint: r.hint,
    tone: r.tone,
  }));
}

/* --------------------------- Retain outcomes --------------------------- */

export type RetainKpi = { key: string; label: string; value: string; hint: string; momentum: number };

export function retainOutcomes(period: Period): RetainKpi[] {
  return [
    {
      key: "direct",
      label: "Booked directly",
      value: fmt(scale(642, period)),
      hint: "Returned through your own booking flow",
      momentum: 18.2,
    },
    {
      key: "repeat",
      label: "Repeat direct guests",
      value: fmt(scale(214, period)),
      hint: "Two or more direct stays",
      momentum: 15.7,
    },
    {
      key: "revenue",
      label: "Direct revenue",
      value: `$${fmt(scale(84200, period))}`,
      hint: "$131 average per conversion",
      momentum: 18.2,
    },
  ];
}
