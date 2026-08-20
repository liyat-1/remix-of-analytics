/**
 * OTA Buster — domain model.
 *
 * The product concept is a guest-conversion engine, not a campaign builder:
 *   OTA booking → relationship → experience → feedback → direct booking → loyalty
 *
 * Everything here is deterministic sample data for the prototype. Where a real
 * deployment would have no data, use the `hasEnoughData` flags so the UI can
 * show honest empty / low-data states instead of inventing numbers.
 */

export type ProgramStatus = "active" | "draft" | "paused" | "needs_attention";

export type JourneyStageId =
  | "booking"
  | "welcome"
  | "prearrival"
  | "stay"
  | "poststay"
  | "winback"
  | "retention";

export type StageStatus = "active" | "draft" | "paused" | "needs_attention";

export type JourneyStage = {
  id: JourneyStageId;
  index: string;
  name: string;
  purpose: string;
  timing: string;
  status: StageStatus;
  /** Explains a non-active status in plain language. */
  blockedReason?: string;
  guestFacing: string;
  messages: number;
  guestsReached: number;
  engagement: number | null;
  outcomeLabel: string;
  outcomeValue: string;
  metrics: { label: string; value: string; hint?: string }[];
};

export const JOURNEY: JourneyStage[] = [
  {
    id: "booking",
    index: "01",
    name: "Booked",
    purpose: "Detect the OTA reservation and start a guest profile.",
    timing: "The moment the reservation lands",
    status: "active",
    guestFacing: "Nothing yet — Directful is quietly building the guest profile.",
    messages: 0,
    guestsReached: 8420,
    engagement: null,
    outcomeLabel: "Guest profiles captured",
    outcomeValue: "6,182",
    metrics: [
      { label: "OTA source", value: "Booking.com · Expedia · Airbnb" },
      { label: "Reservations", value: "8,420" },
      { label: "Booking value", value: "$3.9M" },
      { label: "Profiles captured", value: "73%", hint: "Guests with a usable direct contact channel." },
    ],
  },
  {
    id: "welcome",
    index: "02",
    name: "Welcome",
    purpose: "Build the first direct relationship. Trust before discounts.",
    timing: "Just after booking",
    status: "active",
    guestFacing: "A warm thank-you with everything they need about the reservation.",
    messages: 1,
    guestsReached: 6182,
    engagement: 0.71,
    outcomeLabel: "Profiles completed",
    outcomeValue: "4,118",
    metrics: [
      { label: "Guests reached", value: "6,182" },
      { label: "Delivered", value: "98.4%" },
      { label: "Opened", value: "71%" },
      { label: "Clicked", value: "38%" },
    ],
  },
  {
    id: "prearrival",
    index: "03",
    name: "Pre-arrival",
    purpose: "Help the guest prepare — and offer what genuinely improves the stay.",
    timing: "7 days and 2 days before arrival",
    status: "active",
    guestFacing: "Arrival details, property info, and a short list of relevant upgrades.",
    messages: 2,
    guestsReached: 1420,
    engagement: 0.68,
    outcomeLabel: "Pre-arrival offer revenue",
    outcomeValue: "$4,200",
    metrics: [
      { label: "Guests reached", value: "1,420" },
      { label: "Engagement", value: "68%" },
      { label: "Check-ins completed", value: "1,061" },
      { label: "Offer revenue", value: "$4,200" },
    ],
  },
  {
    id: "stay",
    index: "04",
    name: "During stay",
    purpose: "Make the stay better. No selling here.",
    timing: "Morning after check-in",
    status: "active",
    guestFacing: "“How is everything?” — a two-way line to the front desk.",
    messages: 1,
    guestsReached: 979,
    engagement: 0.44,
    outcomeLabel: "Issues resolved in-stay",
    outcomeValue: "37",
    metrics: [
      { label: "Guests reached", value: "979" },
      { label: "Replies", value: "431" },
      { label: "Requests handled", value: "212" },
      { label: "Recovered in-stay", value: "37", hint: "Issues resolved before checkout." },
    ],
  },
  {
    id: "poststay",
    index: "05",
    name: "Post-stay",
    purpose: "Listen first. Route happy guests to reviews, unhappy guests to people.",
    timing: "1 day after checkout",
    status: "active",
    guestFacing: "“How was your stay?” then a path that fits their answer.",
    messages: 2,
    guestsReached: 942,
    engagement: 0.52,
    outcomeLabel: "Public reviews collected",
    outcomeValue: "214",
    metrics: [
      { label: "Feedback collected", value: "489" },
      { label: "Positive (4–5★)", value: "402" },
      { label: "Recovery cases", value: "87" },
      { label: "Public reviews", value: "214" },
    ],
  },
  {
    id: "winback",
    index: "06",
    name: "Winback",
    purpose: "Give the guest a reason to book directly next time.",
    timing: "Recommended window: 7–14 days after checkout",
    status: "active",
    guestFacing: "A personal invitation back, with the hotel's direct-booking benefit.",
    messages: 2,
    guestsReached: 3140,
    engagement: 0.41,
    outcomeLabel: "Direct bookings",
    outcomeValue: "1,284",
    metrics: [
      { label: "Guests reached", value: "3,140" },
      { label: "Offer clicks", value: "1,102" },
      { label: "Direct bookings", value: "1,284" },
      { label: "Direct revenue", value: "$184,200" },
    ],
  },
  {
    id: "retention",
    index: "07",
    name: "Retention",
    purpose: "Recognise the relationship so the second direct stay is easier than the first.",
    timing: "Around the guest's typical booking window",
    status: "needs_attention",
    blockedReason: "Retention is paused because no returning-guest recognition is configured yet.",
    guestFacing: "Recognition, remembered preferences, and a reason to return.",
    messages: 1,
    guestsReached: 0,
    engagement: null,
    outcomeLabel: "Repeat direct guests",
    outcomeValue: "Not enough data yet",
    metrics: [
      { label: "Direct guests", value: "1,284" },
      { label: "Returning guests", value: "Building baseline" },
      { label: "VIP guests", value: "Building baseline" },
    ],
  },
];

/* ------------------------- headline outcome ------------------------- */

export type Kpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: "up" | "down" | "flat";
  hint: string;
  tooltip: string;
};

export const HEADLINE_KPIS: Kpi[] = [
  {
    id: "ota_guests",
    label: "OTA guests",
    value: "8,420",
    delta: "+612 this month",
    tone: "up",
    hint: "Eligible guests entering the program",
    tooltip:
      "Guests whose reservation originated on an OTA channel and who are eligible for OTA Buster communication.",
  },
  {
    id: "guests_won",
    label: "Guests won",
    value: "1,284",
    delta: "+143 this month",
    tone: "up",
    hint: "OTA guests who later booked direct",
    tooltip:
      "An OTA-originated guest who later completed a direct booking attributable to OTA Buster. This is the program's north-star metric.",
  },
  {
    id: "direct_revenue",
    label: "Direct revenue",
    value: "$184,200",
    delta: "+18% vs last month",
    tone: "up",
    hint: "Revenue from converted direct bookings",
    tooltip: "Revenue from direct bookings attributed to an OTA Buster touchpoint within the attribution window.",
  },
  {
    id: "commission_avoided",
    label: "Commission avoided",
    value: "$27,630",
    delta: "Estimate",
    tone: "flat",
    hint: "Estimated, based on a 15% commission rate",
    tooltip:
      "Estimated commission the hotel may have paid if the converted booking had remained on the OTA channel. This is an estimate based on your configured or observed commission rate.",
  },
  {
    id: "conversion",
    label: "Direct conversion",
    value: "15.3%",
    delta: "+1.8 pts",
    tone: "up",
    hint: "Of eligible OTA guests",
    tooltip: "Percentage of eligible OTA guests who subsequently completed a direct booking.",
  },
];

/* ------------------------- opportunity funnel ------------------------- */

export type FunnelStage = {
  id: string;
  label: string;
  count: number;
  note: string;
};

export const FUNNEL: FunnelStage[] = [
  { id: "ota", label: "OTA guests", count: 8420, note: "Eligible reservations detected" },
  { id: "engaged", label: "Engaged guests", count: 5981, note: "Opened or replied at least once" },
  { id: "intent", label: "High-intent guests", count: 2140, note: "Repeat engagement or offer interest" },
  { id: "clicks", label: "Direct booking clicks", count: 1102, note: "Opened the direct booking offer" },
  { id: "direct", label: "Direct bookings", count: 1284, note: "Completed a direct reservation" },
  { id: "repeat", label: "Repeat direct guests", count: 318, note: "Booked direct more than once" },
];

export const OPPORTUNITY_SUMMARY = [
  { label: "OTA guests available", value: "8,420" },
  { label: "High-intent guests", value: "2,140" },
  { label: "Eligible for winback", value: "3,486" },
  { label: "Already converted", value: "1,284" },
  { label: "Potential direct revenue", value: "$412,000", estimate: true },
  { label: "Potential commission savings", value: "$61,800", estimate: true },
];

export const DEPENDENCY = {
  before: 78,
  current: 56,
  target: 40,
  insight:
    "OTA dependency is down 22 points since OTA Buster was activated. Other channel and rate changes in the same period may also contribute.",
  series: [78, 74, 71, 68, 64, 61, 58, 56],
};

/* ------------------------- direct booking offer ------------------------- */

export type OfferType = {
  id: string;
  name: string;
  category: "rate" | "experience" | "flexibility" | "amenity" | "custom";
  costModel: string;
  estimatedCost: number;
  description: string;
};

export const OFFER_TYPES: OfferType[] = [
  { id: "pct", name: "Percentage discount", category: "rate", costModel: "% of booking", estimatedCost: 50, description: "A straightforward rate cut on the direct rate." },
  { id: "fixed", name: "Fixed discount", category: "rate", costModel: "Flat amount", estimatedCost: 40, description: "A fixed amount off the next direct stay." },
  { id: "breakfast", name: "Free breakfast", category: "experience", costModel: "Cost of covers", estimatedCost: 25, description: "High perceived value, low marginal cost." },
  { id: "upgrade", name: "Room upgrade", category: "experience", costModel: "Opportunity cost", estimatedCost: 30, description: "Best when the next tier is likely to be unsold." },
  { id: "late", name: "Late checkout", category: "flexibility", costModel: "Housekeeping impact", estimatedCost: 8, description: "Almost free on low-occupancy days." },
  { id: "early", name: "Early check-in", category: "flexibility", costModel: "Housekeeping impact", estimatedCost: 8, description: "Popular with business and long-haul travellers." },
  { id: "parking", name: "Free parking", category: "amenity", costModel: "Space opportunity cost", estimatedCost: 18, description: "Strong in city properties with paid parking." },
  { id: "amenity", name: "Welcome amenity", category: "amenity", costModel: "Item cost", estimatedCost: 12, description: "A small in-room gesture on arrival." },
  { id: "experience", name: "Complimentary experience", category: "experience", costModel: "Partner cost", estimatedCost: 35, description: "Tour, tasting, or activity included." },
  { id: "spa", name: "Spa credit", category: "experience", costModel: "Credit value", estimatedCost: 40, description: "Works well for leisure and couples." },
  { id: "dining", name: "Dining credit", category: "experience", costModel: "Credit value", estimatedCost: 30, description: "Drives on-property spend as well as conversion." },
  { id: "package", name: "Exclusive package", category: "custom", costModel: "Bundle cost", estimatedCost: 45, description: "A bundle guests cannot get on an OTA." },
  { id: "bestrate", name: "Best-rate promise", category: "rate", costModel: "Rate parity risk", estimatedCost: 0, description: "No direct cost. Weaker pull on its own." },
  { id: "none", name: "No incentive", category: "custom", costModel: "None", estimatedCost: 0, description: "Relationship only. Lowest conversion, highest margin." },
];

export const OFFER_RECOMMENDATION = {
  offerId: "breakfast",
  title: "Free breakfast",
  confidence: "Based on 3,140 winback sends over the last 90 days",
  reasons: [
    "Guests at this property respond more strongly to experience-based offers than to rate cuts.",
    "Estimated offer cost of $25 is a third of the $75 commission you avoid per converted booking.",
    "Breakfast converted 14% more often than the 10% discount in the current test.",
  ],
  economics: {
    commissionRate: 0.15,
    averageBooking: 500,
    commissionAvoided: 75,
    offerCost: 25,
    netBenefit: 50,
  },
};

export const SEGMENT_OFFERS = [
  { segment: "High-value guest", offer: "Room upgrade", basis: "Highest average booking value; upgrade cost is opportunity-only." },
  { segment: "Family", offer: "Breakfast + late checkout", basis: "Two low-cost benefits that remove real travel friction." },
  { segment: "Business traveller", offer: "Flexible checkout", basis: "Flexibility outperformed rate cuts in this segment." },
  { segment: "Price-sensitive traveller", offer: "10% off", basis: "Rate is the deciding factor in this segment's click behaviour." },
  { segment: "Luxury traveller", offer: "Complimentary experience", basis: "Experience offers outperform discounts on premium rates." },
];

export const OFFER_TEST = {
  name: "Direct booking offer test",
  running: true,
  variants: [
    { name: "10% discount", split: 50, sends: 1570, bookings: 178, conversion: 0.113, revenue: 84200, offerCost: 8900 },
    { name: "Free breakfast", split: 50, sends: 1570, bookings: 210, conversion: 0.134, revenue: 100000, offerCost: 5250 },
  ],
  winner: "Free breakfast",
  lift: "+18% conversion",
};

/* ------------------------- guests ------------------------- */

export type GuestStatus = "ota" | "high_intent" | "converted" | "recovery";

export type Guest = {
  id: string;
  name: string;
  email: string;
  status: GuestStatus;
  score: number;
  scoreReasons: string[];
  nextBestAction: string;
  actionTone: "convert" | "recover" | "review";
  segment: string;
  source: string;
  lastStay: string;
  stays: number;
  lifetimeValue: number;
  averageBooking: number;
  room: string;
  feedback: string | null;
  contactWindow: string | null;
  directContact: boolean;
};

export const GUESTS: Guest[] = [
  {
    id: "g_sarah",
    name: "Michelle West",
    email: "s.williams@example.com",
    status: "high_intent",
    score: 82,
    scoreReasons: ["Opened every message", "5-star feedback", "Booking value above property average"],
    nextBestAction: "Send the direct-booking offer now — feedback was positive and engagement is high.",
    actionTone: "convert",
    segment: "High-value · Leisure",
    source: "Booking.com",
    lastStay: "12 Jun 2026",
    stays: 2,
    lifetimeValue: 1240,
    averageBooking: 620,
    room: "Deluxe King",
    feedback: "5★ — “Faultless from arrival to checkout.”",
    contactWindow: null,
    directContact: true,
  },
  {
    id: "g_michael",
    name: "Michael Osei",
    email: "m.osei@example.com",
    status: "recovery",
    score: 34,
    scoreReasons: ["Negative feedback in the last 7 days", "Promotional messaging suppressed"],
    nextBestAction: "Resolve the open issue before any return offer is presented.",
    actionTone: "recover",
    segment: "Business",
    source: "Expedia",
    lastStay: "28 Jun 2026",
    stays: 1,
    lifetimeValue: 410,
    averageBooking: 410,
    room: "Standard Queen",
    feedback: "2★ — “Room wasn't ready at check-in.”",
    contactWindow: null,
    directContact: true,
  },
  {
    id: "g_jessica",
    name: "Jessica Lund",
    email: "j.lund@example.com",
    status: "high_intent",
    score: 76,
    scoreReasons: ["5-star feedback", "Clicked the offer twice", "Approaching typical booking window"],
    nextBestAction: "Ask for a public review, then introduce the direct-booking benefit.",
    actionTone: "review",
    segment: "Leisure · Repeat OTA",
    source: "Airbnb",
    lastStay: "02 Jul 2026",
    stays: 3,
    lifetimeValue: 1580,
    averageBooking: 527,
    room: "Garden Suite",
    feedback: "5★ — “The team remembered our anniversary.”",
    contactWindow: "OTA contact window ends 14 Aug 2026",
    directContact: true,
  },
  {
    id: "g_daniel",
    name: "Daniel Reyes",
    email: "—",
    status: "ota",
    score: 41,
    scoreReasons: ["One stay", "No direct contact channel on file"],
    nextBestAction: "Capture a direct contact at pre-check-in before the OTA window closes.",
    actionTone: "convert",
    segment: "First-time OTA",
    source: "Booking.com",
    lastStay: "05 Jul 2026",
    stays: 1,
    lifetimeValue: 380,
    averageBooking: 380,
    room: "Standard King",
    feedback: null,
    contactWindow: "OTA contact window ends 21 Jul 2026",
    directContact: false,
  },
  {
    id: "g_amelia",
    name: "Amelia Chen",
    email: "a.chen@example.com",
    status: "converted",
    score: 91,
    scoreReasons: ["Booked direct after winback", "Purchased breakfast upsell", "High engagement"],
    nextBestAction: "Move to retention — recognise the second stay and remember her room preference.",
    actionTone: "convert",
    segment: "Direct guest · Repeat",
    source: "Direct (won from Expedia)",
    lastStay: "18 Jun 2026",
    stays: 4,
    lifetimeValue: 2460,
    averageBooking: 615,
    room: "Deluxe King",
    feedback: "5★ — “Booking direct was easier than the app.”",
    contactWindow: null,
    directContact: true,
  },
  {
    id: "g_tomas",
    name: "Tomás Ferreira",
    email: "t.ferreira@example.com",
    status: "ota",
    score: 58,
    scoreReasons: ["Long stay", "Opened pre-arrival message", "No offer interaction yet"],
    nextBestAction: "Include in the next winback wave with the flexibility offer.",
    actionTone: "convert",
    segment: "Long-stay · Business",
    source: "Expedia",
    lastStay: "30 Jun 2026",
    stays: 1,
    lifetimeValue: 890,
    averageBooking: 890,
    room: "Executive Suite",
    feedback: "4★ — “Great desk space.”",
    contactWindow: null,
    directContact: true,
  },
];

export const GUEST_FILTERS: { id: GuestStatus | "all"; label: string }[] = [
  { id: "all", label: "All guests" },
  { id: "ota", label: "OTA guests" },
  { id: "high_intent", label: "High-intent" },
  { id: "converted", label: "Converted" },
  { id: "recovery", label: "Recovery" },
];

export const GUEST_TIMELINE = [
  { label: "OTA booking", detail: "Booking.com · 04 Jun 2026", done: true },
  { label: "Welcome", detail: "Opened · profile completed", done: true },
  { label: "Pre-arrival", detail: "Checked in early, added breakfast", done: true },
  { label: "Stay", detail: "No issues reported", done: true },
  { label: "Feedback", detail: "5★ · public review submitted", done: true },
  { label: "Winback", detail: "Offer clicked, not yet booked", done: false },
  { label: "Direct booking", detail: "Pending", done: false },
];

/* ------------------------- opportunities ------------------------- */

export type Opportunity = {
  id: string;
  headline: string;
  reason: string;
  action: string;
  value: string;
  tone: "convert" | "recover" | "watch";
  guests: number;
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "op_clicked",
    headline: "14 guests clicked your offer but haven't booked",
    reason: "They opened the direct-booking benefit in the last 10 days and returned to the page twice.",
    action: "Send a short reminder with the same benefit",
    value: "Estimated opportunity: $8,400",
    tone: "convert",
    guests: 14,
  },
  {
    id: "op_highvalue",
    headline: "8 high-value guests are approaching their booking window",
    reason: "Each has booked around this time of year in the previous two years.",
    action: "Send the upgrade offer ahead of the window",
    value: "Estimated opportunity: $12,900",
    tone: "convert",
    guests: 8,
  },
  {
    id: "op_recovery",
    headline: "12 guests submitted negative feedback",
    reason: "Promotional messaging is suppressed for these guests until the issue is resolved.",
    action: "Review and respond",
    value: "Protects $6,100 in lifetime value",
    tone: "recover",
    guests: 12,
  },
  {
    id: "op_lapsed",
    headline: "5 previous direct guests returned to OTA",
    reason: "Their most recent reservation came through an OTA channel after booking direct before.",
    action: "Re-introduce the direct benefit",
    value: "Estimated opportunity: $3,200",
    tone: "watch",
    guests: 5,
  },
  {
    id: "op_window",
    headline: "23 guests lose OTA contact eligibility this month",
    reason: "The OTA-mediated channel closes soon and no direct contact has been captured.",
    action: "Prioritise profile capture at pre-check-in",
    value: "Protects future reachability",
    tone: "watch",
    guests: 23,
  },
];

export const INSIGHTS = [
  {
    title: "Free breakfast is outperforming discounts",
    body: "Guests who received the breakfast offer converted 14% more often than the 10% discount group this month, at a third of the cost.",
    basis: "3,140 sends · 90 days",
  },
  {
    title: "Earlier winback converts better",
    body: "Guests who received a direct-booking offer within 7 days of checkout converted 22% more often than those who received it later.",
    basis: "Two full quarters of winback sends",
  },
  {
    title: "Profile capture is your constraint",
    body: "27% of OTA reservations still have no usable direct contact. Pre-check-in is where that gap closes fastest.",
    basis: "8,420 reservations",
  },
];

export const NOTIFICATIONS = [
  { tone: "opportunity", text: "38 high-value OTA guests are ready for winback." },
  { tone: "performance", text: "Your direct conversion rate increased 18% this month." },
  { tone: "issue", text: "Retention has no returning-guest recognition configured." },
  { tone: "recovery", text: "12 guests submitted negative feedback requiring attention." },
];

/* ------------------------- performance ------------------------- */

export const PERFORMANCE_OVERVIEW = [
  { label: "OTA guests", value: "8,420" },
  { label: "Guests reached", value: "6,182" },
  { label: "Engaged guests", value: "5,981" },
  { label: "Direct conversions", value: "1,284" },
  { label: "Conversion rate", value: "15.3%" },
  { label: "Direct revenue", value: "$184,200" },
  { label: "Commission avoided", value: "$27,630" },
  { label: "Offer cost", value: "$32,100" },
  { label: "Net impact", value: "$179,730" },
];

export const SEGMENT_PERFORMANCE = [
  { segment: "First-time OTA", guests: 4210, conversion: 0.112, revenue: 62400, offer: "Free breakfast" },
  { segment: "Repeat OTA", guests: 1980, conversion: 0.186, revenue: 51200, offer: "Room upgrade" },
  { segment: "High-value", guests: 940, conversion: 0.224, revenue: 46800, offer: "Room upgrade" },
  { segment: "Leisure", guests: 3120, conversion: 0.158, revenue: 58900, offer: "Complimentary experience" },
  { segment: "Business", guests: 1170, conversion: 0.131, revenue: 24900, offer: "Flexible checkout" },
];

export const OFFER_PERFORMANCE = [
  { offer: "Free breakfast", bookings: 512, conversion: 0.134, revenue: 78400, cost: 12800, net: 65600 },
  { offer: "10% discount", bookings: 402, conversion: 0.113, revenue: 61200, cost: 14100, net: 47100 },
  { offer: "Room upgrade", bookings: 218, conversion: 0.176, revenue: 33100, cost: 4200, net: 28900 },
  { offer: "Late checkout", bookings: 96, conversion: 0.081, revenue: 8900, cost: 620, net: 8280 },
  { offer: "Custom package", bookings: 56, conversion: 0.142, revenue: 12600, cost: 2380, net: 10220 },
];

export const CHANNEL_PERFORMANCE = [
  { channel: "Email", reached: 6182, engaged: 4389, bookings: 1042 },
  { channel: "SMS", reached: 1840, engaged: 894, bookings: 242 },
];

export const PROPERTY_PERFORMANCE = [
  { property: "Wyndham Grand Istanbul Levent", guests: 2140, conversion: 0.124, revenue: 62400 },
  { property: "The Harbour House", guests: 1480, conversion: 0.178, revenue: 48900 },
  { property: "Casa Miramar", guests: 1210, conversion: 0.101, revenue: 31200 },
  { property: "Nordic Lodge", guests: 980, conversion: 0.146, revenue: 24800 },
  { property: "Aurora Bay Resort", guests: 2610, conversion: 0.093, revenue: 16900 },
];

export const BENCHMARK = { property: 0.124, portfolio: 0.101, top: 0.178 };

/* ------------------------- helpers ------------------------- */

export const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export const STATUS_COPY: Record<StageStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  draft: { label: "Draft", className: "border-zinc-200 bg-zinc-50 text-zinc-600" },
  paused: { label: "Paused", className: "border-amber-200 bg-amber-50 text-amber-700" },
  needs_attention: { label: "Needs attention", className: "border-amber-300 bg-amber-50 text-amber-800" },
};
