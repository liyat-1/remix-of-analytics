/**
 * OTA Buster — Phase 1 guest journey model.
 *
 * Mental model:
 *   Guest enters journey → completes a stage sequence → the engine decides when
 *   they are eligible for the next stage → the next stage adapts to their real
 *   timing and state.
 *
 * All values here are deterministic sample data for the prototype.
 */

export type Period = "7d" | "30d" | "90d" | "custom";

export const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
];

export type StageId = "just_booked" | "pre_checkin" | "during_stay" | "post_checkout" | "retain";

export type Channel = "email" | "text" | "both";

export const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Email",
  text: "Text",
  both: "Email + Text",
};

export type Metric = { label: string; value: string };

export type StageMetrics = {
  /** The momentum metric — always first on the card. */
  primary: { label: string; value: string; momentum: number };
  rest: Metric[];
};

export type LandingField = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "rating" | "review";
  required: boolean;
};

export type Offer = {
  enabled: boolean;
  kind: "percent" | "amount" | "inclusion";
  value: string;
  title: string;
  description: string;
  validity: string;
  cta: string;
  /** Which catalogue incentive this offer was picked from. */
  catalogId?: string;
  category?: string;
  /** Short line used inside the email teaser panel. */
  teaser?: string;
  benefits?: string[];
  upgrade?: { from: string; to: string };
  image?: string;
  /** Guest segment the offer is limited to. */
  segment?: string;
  /** Optional cap, e.g. "Max 40 upgrades per week". */
  limit?: string;
};


export type SequenceMessage = {
  id: string;
  name: string;
  channel: Channel;
  timing: string;
  sendWhen: string;
  stopWhen: string;
  skipWhen: string;
  /** Set when this message belongs to a feedback-condition branch. */
  branch?: FeedbackBranch;
  email: {
    subject: string;
    preheader: string;
    heading: string;
    body: string[];
    cta: string;
  };
  /** Which email design this message uses. */
  templateId?: string;
  text: string;

  /** Optional label for the link appended to every text message. */
  textLinkLabel?: string;
  landing: {
    headline: string;
    subtext: string;
    submitLabel: string;
    fields: LandingField[];
    /** Heading above the data-capture form. */
    sectionTitle?: string;
    /** Reservation facts shown in the summary card. */
    stay?: { id: string; label: string; value: string }[];
    /** Whether the form is shown at all. */
    capture?: boolean;
  };

  success: {
    headline: string;
    message: string;
    cta: string;
    /** Reassurance rows shown as ticks on the success screen. */
    checks?: string[];
    footnote?: string;
  };

  offer: Offer;
};

export type Branch = { label: string; tone: "good" | "neutral" | "warn"; steps: string[] };

/* ------------------------- feedback condition ------------------------- */

export type BranchKey = "positive" | "negative" | "none";

export type FeedbackBranch = {
  key: BranchKey;
  /** Short outcome label, e.g. "Positive experience". */
  label: string;
  /** The rating range or timing qualifier, e.g. "4–5 stars". */
  range: string;
  /** One sentence explaining who receives this message. */
  note: string;
  tone: "good" | "warn" | "neutral";
  /** What this follow-up is, in the marketer's words. */
  follow: string;
};

/**
 * A stage whose sequence branches on the guest's feedback. Kept intentionally
 * small: the hotel configures the wait, never the logic.
 */
export type FeedbackCondition = {
  title: string;
  hint: string;
  /** How long the campaign waits for feedback before the reminder. */
  wait: { value: number; unit: "hours" | "days" | "weeks" };
  /** Messages, in branch order. */
  order: BranchKey[];
};

export type Stage = {
  id: StageId;
  name: string;
  subtitle: string;
  guestLine: string;
  channel: Channel;
  campaignType: string;
  purpose: string;
  status: "active" | "paused";
  /** Short "Ask → Respond" line shown above the campaign editor. */
  summary?: { headline: string; lines: string[] };
  /** Present when the sequence branches on guest feedback. */
  condition?: FeedbackCondition;
  accent: string; // tailwind classes for the icon tile only
  icon: "booked" | "prearrival" | "stay" | "checkout" | "retain";
  /** Timing rail shown *above* this stage. */
  transition: {
    target: string;
    startsWhen: string;
    window: string;
    note: string;
    fallback: "send_when_eligible" | "skip";
  };
  eligibility: string[];
  completion: string[];
  branches?: Branch[];
  sequence: SequenceMessage[];
};

/* ------------------------------ metrics ------------------------------ */

const scale = (n: number, p: Period) =>
  Math.round(n * (p === "7d" ? 0.24 : p === "90d" ? 2.65 : p === "custom" ? 1.62 : 1));

const fmt = (n: number) => n.toLocaleString("en-US");

const MOMENTUM: Record<StageId, Record<Period, number>> = {
  just_booked: { "7d": 4.1, "30d": 6.2, "90d": 11.4, custom: 8.3 },
  pre_checkin: { "7d": -1.9, "30d": -3.8, "90d": 5.2, custom: 1.4 },
  during_stay: { "7d": 7.7, "30d": 9.4, "90d": 12.8, custom: 10.1 },
  post_checkout: { "7d": 2.2, "30d": 4.6, "90d": 7.9, custom: 5.5 },
  retain: { "7d": -0.8, "30d": 3.1, "90d": 9.6, custom: 6.0 },
};

const BASE: Record<StageId, { primaryLabel: string; primary: number; rest: (p: Period) => Metric[] }> =
  {
    just_booked: {
      primaryLabel: "Guests reached",
      primary: 8240,
      rest: () => [
        { label: "Click through rate", value: "38%" },
        { label: "Google one-tap attach rate", value: "64%" },
        { label: "Engagement", value: "14.5%" },
      ],
    },
    pre_checkin: {
      primaryLabel: "Guests reached",
      primary: 6480,
      rest: () => [
        { label: "Click through rate", value: "38%" },
        { label: "Google one-tap attach rate", value: "32%" },
        { label: "Engagement", value: "15.8%" },
      ],
    },
    during_stay: {
      primaryLabel: "Guests reached",
      primary: 5920,
      rest: () => [
        { label: "Click through rate", value: "38%" },
        { label: "Google one-tap attach rate", value: "32%" },
        { label: "Engagement", value: "14.5%" },
      ],
    },
    post_checkout: {
      primaryLabel: "Reviews generated",
      primary: 6480,
      rest: () => [
        { label: "Click through rate", value: "38%" },
        { label: "Google one-tap attach rate", value: "32%" },
        { label: "Conversion", value: "3.9%" },
      ],
    },
    retain: {
      primaryLabel: "Direct revenue",
      primary: 30920,
      rest: () => [
        { label: "Click through rate", value: "38%" },
        { label: "Google one-tap attach rate", value: "32%" },
        { label: "Conversion", value: "6.9%" },
      ],
    },
  };

export function stageMetrics(id: StageId, period: Period): StageMetrics {
  const base = BASE[id];
  const n = scale(base.primary, period);
  return {
    primary: {
      label: base.primaryLabel,
      value: id === "retain" ? `$${fmt(n)}` : fmt(n),
      momentum: MOMENTUM[id][period],
    },
    rest: base.rest(period),
  };
}

export function audienceCount(period: Period) {
  return fmt(scale(12483, period));
}

/* ------------------------------ helpers ------------------------------ */

const field = (
  id: string,
  label: string,
  type: LandingField["type"] = "text",
  required = false,
): LandingField => ({ id, label, type, required });

const noOffer: Offer = {
  enabled: false,
  kind: "percent",
  value: "10",
  title: "Make your upcoming stay even better",
  description: "Enjoy 10% off breakfast during your stay.",
  validity: "Valid during this stay",
  cta: "Add to stay",
};

const baseLanding = (headline: string, subtext: string, extra: LandingField[] = []) => ({
  headline,
  subtext,
  submitLabel: "Continue",
  fields: [
    field("full_name", "Full name", "text", true),
    field("email", "Email", "email", true),
    field("phone", "Phone", "tel"),
    ...extra,
  ],
});

/* ------------------------------- journey ------------------------------ */

export const STAGES: Stage[] = [
  {
    id: "just_booked",
    name: "Just Booked",
    subtitle: "Booking confirmed",
    guestLine: "Your stay at Wyndham Grand Istanbul Levent is confirmed.",
    channel: "email",
    campaignType: "3-message sequence",
    purpose: "Welcome guests after their OTA booking and begin the relationship.",
    status: "active",
    accent: "bg-blue-50 text-blue-600 ring-blue-100",
    icon: "booked",
    transition: {
      target: "Immediately after booking",
      startsWhen: "The OTA reservation is received",
      window: "0–24 hours after booking",
      note: "Every eligible guest enters as soon as their reservation lands.",
      fallback: "send_when_eligible",
    },
    eligibility: [
      "Reservation is valid",
      "Guest has a usable contact channel",
      "Guest has not already confirmed their booking experience",
    ],
    completion: [
      "Guest completes the booking confirmation experience",
      "or the sequence reaches its final message without a response",
    ],
    sequence: [
      {
        id: "jb-1",
        name: "Initial message",
        channel: "email",
        timing: "Immediately after booking",
        sendWhen: "Guest enters the stage",
        stopWhen: "Guest completes the confirmation experience",
        skipWhen: "Guest has already confirmed through the OTA",
        email: {
          subject: "Your stay at Wyndham Grand Istanbul Levent is confirmed",
          preheader: "A few details to make your arrival effortless.",
          heading: "Your stay is confirmed",
          body: [
            "Hello {{first_name}},",
            "We're delighted to welcome you to Wyndham Grand Istanbul Levent. Confirm a few details now and your arrival will take under a minute.",
          ],
          cta: "Confirm my details",
        },
        text: "Hi {{first_name}} — your stay at Wyndham Grand is confirmed. Confirm your details here:",
        landing: baseLanding(
          "Confirm your booking details",
          "It takes a minute and makes your arrival effortless.",
          [field("purpose", "Purpose of stay", "select")],
        ),
        success: {
          headline: "You're all set",
          message: "Thank you — your details are confirmed. We'll be in touch closer to your arrival.",
          cta: "View your stay",
        },
        offer: { ...noOffer },
      },
      {
        id: "jb-2",
        name: "Follow-up",
        channel: "email",
        timing: "2 days after the initial message",
        sendWhen: "Guest hasn't completed the confirmation experience",
        stopWhen: "Guest completes the confirmation experience",
        skipWhen: "Guest has already checked in",
        email: {
          subject: "One quick step before your stay",
          preheader: "Confirm your details in under a minute.",
          heading: "One quick step",
          body: [
            "Hello {{first_name}},",
            "We still need a couple of details to prepare your room exactly the way you like it.",
          ],
          cta: "Complete my details",
        },
        text: "{{first_name}}, one quick step before your stay — confirm your details:",
        landing: baseLanding("Confirm your booking details", "One minute, and your arrival is ready."),
        success: {
          headline: "Thank you",
          message: "Your details are confirmed. Everything is ready for your arrival.",
          cta: "View your stay",
        },
        offer: { ...noOffer },
      },
      {
        id: "jb-3",
        name: "Final follow-up",
        channel: "email",
        timing: "4 days after the initial message",
        sendWhen: "Guest still hasn't completed the experience",
        stopWhen: "Guest completes the confirmation experience",
        skipWhen: "Guest is within 24 hours of arrival",
        email: {
          subject: "Still time to prepare your arrival",
          preheader: "Last reminder before we hand over to the front desk.",
          heading: "Still time to prepare",
          body: [
            "Hello {{first_name}},",
            "If it's easier, our front desk can take care of this on arrival. Otherwise, one tap saves you time at check-in.",
          ],
          cta: "Finish in one tap",
        },
        text: "Last reminder {{first_name}} — finish your check-in details in one tap:",
        landing: baseLanding("Finish your details", "One tap now saves time at the desk."),
        success: {
          headline: "All done",
          message: "Thank you — see you soon in Istanbul.",
          cta: "View your stay",
        },
        offer: { ...noOffer },
      },
    ],
  },
  {
    id: "pre_checkin",
    name: "Pre-Check-in",
    subtitle: "Your stay is coming up",
    guestLine: "Your stay is coming up, {{first_name}}.",
    channel: "both",
    campaignType: "3-message sequence",
    purpose: "Prepare the guest for arrival and offer what genuinely improves the stay.",
    status: "active",
    accent: "bg-teal-50 text-teal-600 ring-teal-100",
    icon: "prearrival",
    transition: {
      target: "3 days before arrival",
      startsWhen: "Just Booked is completed",
      window: "3–5 days before arrival",
      note: "Timing adjusts to the guest's actual progress.",
      fallback: "send_when_eligible",
    },
    eligibility: [
      "Reservation is valid",
      "Guest is still eligible",
      "Just Booked requirements are met",
      "Guest has not already completed pre-check-in",
      "Guest is within the relevant arrival window",
    ],
    completion: [
      "Guest completes pre-check-in",
      "or the guest checks in at the property",
    ],
    sequence: [
      {
        id: "pc-1",
        name: "Pre-check-in",
        channel: "email",
        timing: "3 days before arrival",
        sendWhen: "Guest becomes eligible for the stage",
        stopWhen: "Guest completes pre-check-in",
        skipWhen: "Guest has already checked in",
        email: {
          subject: "Your stay is coming up — check in online",
          preheader: "Skip the desk. Check in before you arrive.",
          heading: "Your stay is coming up",
          body: [
            "Hello {{first_name}},",
            "Check in online and pick anything that would make the stay better — we'll have it ready before you arrive.",
          ],
          cta: "Check in online",
        },
        text: "Your stay is coming up {{first_name}} — check in online here:",
        landing: baseLanding(
          "Check in before you arrive",
          "Confirm your details and choose what would make your stay better.",
          [field("gov_id", "Government ID", "text", true), field("arrival_time", "Estimated arrival time")],
        ),
        success: {
          headline: "You're checked in",
          message: "Your room will be ready when you arrive. Your upgrade is confirmed.",
          cta: "See your stay details",
        },
        offer: {
          enabled: true,
          kind: "amount",
          value: "79",
          title: "Make your upcoming stay even better",
          description: "Upgrade from Deluxe King to a Suite for the whole stay.",
          validity: "Valid until check-in",
          cta: "Add to stay",
        },
      },
      {
        id: "pc-2",
        name: "Follow-up",
        channel: "both",
        timing: "1 day before arrival",
        sendWhen: "Guest hasn't completed pre-check-in",
        stopWhen: "Guest completes pre-check-in",
        skipWhen: "Guest has already checked in",
        email: {
          subject: "Ready for tomorrow?",
          preheader: "Check in online and walk straight to your room.",
          heading: "Ready for tomorrow?",
          body: [
            "Hello {{first_name}},",
            "Check in online and walk straight to your room when you arrive.",
          ],
          cta: "Check in online",
        },
        text: "{{first_name}}, check in online for tomorrow and skip the desk:",
        landing: baseLanding("Check in before you arrive", "It takes a minute.", [
          field("gov_id", "Government ID", "text", true),
        ]),
        success: {
          headline: "You're checked in",
          message: "See you tomorrow — your room will be ready.",
          cta: "See your stay details",
        },
        offer: { ...noOffer },
      },
      {
        id: "pc-3",
        name: "Reminder",
        channel: "text",
        timing: "3 hours before arrival",
        sendWhen: "Guest still hasn't completed pre-check-in",
        stopWhen: "Guest completes pre-check-in or checks in",
        skipWhen: "Guest has already checked in",
        email: {
          subject: "One step left before you arrive",
          preheader: "Finish check-in on your phone.",
          heading: "One step left",
          body: ["Hi {{first_name}}, your stay starts today — one step left before you arrive."],
          cta: "Finish check-in",
        },
        text: "Hi {{first_name}}, your stay at Wyndham Grand starts today. One step left — finish check-in:",
        landing: baseLanding("Finish check-in", "Last step before you arrive."),
        success: {
          headline: "All set",
          message: "Head straight up when you arrive — we have everything we need.",
          cta: "Open your stay",
        },
        offer: { ...noOffer },
      },
    ],
  },
  {
    id: "during_stay",
    name: "During Stay",
    subtitle: "In house",
    guestLine: "Good morning {{first_name}} — how's everything in Deluxe King?",
    channel: "both",
    campaignType: "2-message sequence",
    purpose: "Make the stay better and keep a two-way line open with the front desk.",
    status: "active",
    accent: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    icon: "stay",
    transition: {
      target: "During guest stay",
      startsWhen: "The guest actually checks in",
      window: "First morning of the stay",
      note: "Event-driven: the stay timeline, not the previous message, starts this stage.",
      fallback: "skip",
    },
    eligibility: [
      "Guest has checked in",
      "Reservation is in house",
      "No open service recovery case",
    ],
    completion: ["Guest replies or checks out"],
    sequence: [
      {
        id: "ds-1",
        name: "In-stay check-in",
        channel: "text",
        timing: "First morning of the stay",
        sendWhen: "Guest has checked in",
        stopWhen: "Guest replies",
        skipWhen: "A service recovery case is open",
        email: {
          subject: "How's everything so far?",
          preheader: "We're one message away.",
          heading: "How's everything?",
          body: ["Good morning {{first_name}} — anything you need is one message away."],
          cta: "Message the front desk",
        },
        text: "Good morning {{first_name}} — how's everything in Deluxe King? Anything you need is one message away.",
        landing: baseLanding("Anything we can arrange?", "Housekeeping, dining, spa or concierge."),
        success: {
          headline: "We're on it",
          message: "The front desk has your request and will reply in this thread.",
          cta: "Back to your stay",
        },
        offer: { ...noOffer },
      },
      {
        id: "ds-2",
        name: "Late checkout offer",
        channel: "email",
        timing: "Day before checkout",
        sendWhen: "Guest is still in house",
        stopWhen: "Guest adds late checkout",
        skipWhen: "The room is already resold for the next night",
        email: {
          subject: "Would a later checkout help?",
          preheader: "Stay until 15:00 tomorrow.",
          heading: "A slower morning?",
          body: ["Hello {{first_name}}, we can hold your room until 15:00 tomorrow."],
          cta: "Add late checkout",
        },
        text: "{{first_name}}, would a later checkout help? We can hold your room until 15:00.",
        landing: baseLanding("Add late checkout", "Keep your room until 15:00 tomorrow."),
        success: {
          headline: "Late checkout confirmed",
          message: "Your room is yours until 15:00 tomorrow.",
          cta: "Back to your stay",
        },
        offer: {
          enabled: true,
          kind: "amount",
          value: "25",
          title: "A slower morning",
          description: "Keep your room until 15:00 on your checkout day.",
          validity: "Valid until checkout",
          cta: "Add to stay",
        },
      },
    ],
  },
  {
    id: "post_checkout",
    name: "Post-Checkout",
    subtitle: "After the stay",
    guestLine: "How was your stay, {{first_name}}?",
    channel: "email",
    campaignType: "Conditional campaign",
    purpose: "Listen first, then route each guest by how their stay actually went.",
    status: "active",
    summary: {
      headline: "Ask for feedback → Respond based on experience",
      lines: [
        "Positive: Direct-booking offer",
        "Negative: Recovery message",
        "No response: Feedback reminder",
      ],
    },
    condition: {
      title: "Guest feedback",
      hint: "Choose the next message based on the guest's response.",
      wait: { value: 2, unit: "days" },
      order: ["positive", "negative", "none"],
    },
    accent: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: "checkout",
    transition: {
      target: "1 day after checkout",
      startsWhen: "The actual checkout event",
      window: "1–3 days after checkout",
      note: "The timer starts at checkout, not when the previous message was sent.",
      fallback: "send_when_eligible",
    },
    eligibility: ["Guest has checked out", "Stay was completed", "Guest is contactable"],
    completion: ["Guest gives feedback", "or the sequence reaches its final message"],
    branches: [
      {
        label: "Positive · 4–5★",
        tone: "good",
        steps: ["Thank the guest", "Direct-booking offer", "Continue to Retain"],
      },
      {
        label: "Negative · 1–3★",
        tone: "warn",
        steps: ["Recovery message", "No promotional offer", "Hold retention"],
      },
      {
        label: "No response",
        tone: "neutral",
        steps: ["Gentle reminder", "Re-open the feedback page", "Evaluate the rating"],
      },
    ],
    sequence: [
      {
        id: "pk-1",
        name: "Initial message — ask for feedback",
        channel: "email",
        timing: "1 day after checkout",
        sendWhen: "Guest has checked out",
        stopWhen: "Guest gives feedback",
        skipWhen: "A recovery case is already open",
        email: {
          subject: "How was your stay, {{first_name}}?",
          preheader: "We'd love to hear how your experience was.",
          heading: "How was your stay?",
          body: [
            "Thanks for staying with us, {{first_name}}.",
            "We'd love to hear how your experience was.",
          ],
          cta: "Share your feedback",
        },
        text: "How was your stay {{first_name}}? We'd love to hear how it went:",
        landing: {
          headline: "How was your stay?",
          subtext: "Your answer only goes to the hotel.",
          submitLabel: "Send feedback",
          fields: [
            field("rating", "How was your stay?", "rating", true),
            field("comments", "Tell us more", "textarea"),
            field("review", "Share this publicly", "review"),
          ],
        },
        success: {
          headline: "Thank you, {{first_name}}",
          message: "We've shared your feedback with the team who looked after you.",
          cta: "Back to the hotel",
        },
        offer: { ...noOffer },
      },
      {
        id: "pk-positive",
        name: "Follow-up — Direct-booking offer",
        channel: "email",
        timing: "As soon as positive feedback arrives",
        sendWhen: "Guest rates the stay 4–5 stars",
        stopWhen: "Guest books direct",
        skipWhen: "Feedback is negative or missing",
        branch: {
          key: "positive",
          label: "Positive experience",
          range: "4–5 stars",
          note: "This message is sent to guests who give positive feedback.",
          tone: "good",
          follow: "Direct-booking offer",
        },
        email: {
          subject: "We're so glad you enjoyed your stay!",
          preheader: "10% off when you book directly with us.",
          heading: "We're so glad you enjoyed your stay!",
          body: [
            "Thank you for sharing your feedback, {{first_name}}.",
            "We'd love to welcome you back next time. When you book directly with us, enjoy **10% off** your next stay.",
          ],
          cta: "Book direct",
        },
        text: "So glad you enjoyed your stay {{first_name}} — 10% off when you book direct:",
        landing: baseLanding(
          "Come back and stay with us again",
          "Enjoy 10% off your next stay when you book directly with us.",
          [field("dates", "Preferred dates")],
        ),
        success: {
          headline: "Thank you, {{first_name}}!",
          message:
            "We're so happy you enjoyed your stay. We'd love to welcome you back.",
          cta: "Book direct",
        },
        offer: {
          enabled: true,
          kind: "percent",
          value: "10",
          title: "Come back and stay with us again",
          description: "10% off your next direct booking",
          validity: "Valid for 90 days",
          cta: "Book direct",
        },
      },
      {
        id: "pk-negative",
        name: "Follow-up — Recovery message",
        channel: "email",
        timing: "As soon as negative feedback arrives",
        sendWhen: "Guest rates the stay 1–3 stars",
        stopWhen: "The duty manager closes the case",
        skipWhen: "Feedback is positive or missing",
        branch: {
          key: "negative",
          label: "Needs attention",
          range: "1–3 stars",
          note: "This message is sent to guests who report a negative experience.",
          tone: "warn",
          follow: "Recovery message",
        },
        email: {
          subject: "We're sorry we missed the mark",
          preheader: "Our duty manager is reading this personally.",
          heading: "We're sorry we missed the mark",
          body: [
            "We're sorry your stay didn't meet expectations, {{first_name}}.",
            "We'd really appreciate the opportunity to understand what went wrong and make things better.",
          ],
          cta: "Tell us more",
        },
        text: "{{first_name}}, we're sorry we missed the mark. We'd like to understand what went wrong.",
        landing: {
          headline: "We're listening",
          subtext: "We'd like to understand what we could have done better.",
          submitLabel: "Submit feedback",
          fields: [
            field("improve", "What could we improve?", "textarea", true),
            field("wrong", "What went wrong?", "textarea"),
            field("different", "What could we have done differently?", "textarea"),
            field("contact", "Would you like someone from the hotel to contact you?", "select"),
          ],
        },
        success: {
          headline: "Thank you for telling us.",
          message:
            "Your feedback has been shared with our team. We appreciate you giving us the opportunity to improve.",
          cta: "Close",
        },
        offer: { ...noOffer },
      },
      {
        id: "pk-none",
        name: "Follow-up — Feedback reminder",
        channel: "email",
        timing: "If no feedback within the configured wait",
        sendWhen: "Guest hasn't submitted feedback in time",
        stopWhen: "Guest submits feedback",
        skipWhen: "Feedback has already arrived",
        branch: {
          key: "none",
          label: "No feedback",
          range: "No response within 2 days",
          note: "This message is sent when the guest hasn't submitted feedback within the configured time.",
          tone: "neutral",
          follow: "Feedback reminder",
        },
        email: {
          subject: "We'd still love to hear from you",
          preheader: "A moment of your time would mean a lot.",
          heading: "We'd still love to hear from you",
          body: [
            "Hello {{first_name}},",
            "If you have a moment, we'd really appreciate hearing how your stay went.",
          ],
          cta: "Share feedback",
        },
        text: "{{first_name}}, we'd still love to hear how your stay went:",
        landing: {
          headline: "How was your stay?",
          subtext: "It only takes a moment, and it goes straight to the hotel.",
          submitLabel: "Send feedback",
          fields: [
            field("rating", "How was your stay?", "rating", true),
            field("comments", "Tell us more", "textarea"),
          ],
        },
        success: {
          headline: "Thank you, {{first_name}}",
          message: "Your feedback is with the team who looked after you.",
          cta: "Back to the hotel",
        },
        offer: { ...noOffer },
      },
    ],
  },
  {
    id: "retain",
    name: "Retain",
    subtitle: "Book direct next time",
    guestLine: "Come back to Wyndham Grand Istanbul Levent — 10% off when you book direct.",
    channel: "both",
    campaignType: "Conditional Email campaign",
    purpose: "Turn a good stay into a direct relationship.",
    status: "active",
    accent: "bg-violet-50 text-violet-600 ring-violet-100",
    icon: "retain",
    transition: {
      target: "14 days after checkout",
      startsWhen: "Post-Checkout is completed",
      window: "14–21 days after checkout",
      note: "The 14 days count from the actual checkout, not from the previous message.",
      fallback: "send_when_eligible",
    },
    eligibility: [
      "Feedback was not negative",
      "No open recovery case",
      "Guest has not already booked direct",
      "Guest is contactable",
    ],
    completion: ["Guest books direct", "or the sequence reaches its final message"],
    branches: [
      {
        label: "Positive feedback",
        tone: "good",
        steps: ["Send direct-booking invitation", "Follow up once if not engaged"],
      },
      {
        label: "Already booked direct",
        tone: "neutral",
        steps: ["Skip the direct-booking campaign", "Move to returning-guest segment"],
      },
      {
        label: "Negative feedback",
        tone: "warn",
        steps: ["Suppress retention promotion", "Hold until the case is closed"],
      },
    ],
    sequence: [
      {
        id: "rt-1",
        name: "Direct booking invitation",
        channel: "email",
        timing: "14 days after checkout",
        sendWhen: "Guest becomes eligible for the stage",
        stopWhen: "Guest books direct",
        skipWhen: "Guest has already booked direct",
        email: {
          subject: "Come back — 10% off when you book direct",
          preheader: "Your rate, without the middleman.",
          heading: "Come back and stay with us",
          body: [
            "Hello {{first_name}},",
            "Book directly with us and enjoy **10% off** your next stay, plus your preferences already remembered.",
          ],
          cta: "Book direct",
        },
        text: "{{first_name}} — come back to Wyndham Grand with 10% off when you book direct:",
        landing: baseLanding("Book direct and save 10%", "Your preferences are already saved.", [
          field("dates", "Preferred dates"),
        ]),
        success: {
          headline: "Your 10% is saved",
          message: "We've applied your direct-booking benefit — we look forward to welcoming you back.",
          cta: "Choose your dates",
        },
        offer: {
          enabled: true,
          kind: "percent",
          value: "10",
          title: "Come back on better terms",
          description: "10% off your next stay when you book direct with us.",
          validity: "Valid for 90 days",
          cta: "Book direct",
        },
      },
      {
        id: "rt-2",
        name: "Gentle reminder",
        channel: "text",
        timing: "10 days later",
        sendWhen: "Guest hasn't engaged with the invitation",
        stopWhen: "Guest books direct",
        skipWhen: "Guest has booked direct or opted out",
        email: {
          subject: "Your 10% direct rate is still here",
          preheader: "Whenever you're ready.",
          heading: "Still here whenever you are",
          body: ["Hello {{first_name}}, your direct-booking benefit is still available."],
          cta: "Book direct",
        },
        text: "{{first_name}}, your 10% direct rate is still here whenever you're ready:",
        landing: baseLanding("Book direct and save 10%", "Your benefit is still available."),
        success: {
          headline: "See you soon",
          message: "Your direct rate is applied at checkout.",
          cta: "Choose your dates",
        },
        offer: {
          enabled: true,
          kind: "percent",
          value: "10",
          title: "Still yours",
          description: "10% off your next direct stay.",
          validity: "Valid for 90 days",
          cta: "Book direct",
        },
      },
    ],
  },
];

export const getStage = (id: string) => STAGES.find((s) => s.id === id);

export function offerHeadlineValue(o: Offer) {
  if (o.kind === "percent") return `${o.value}% off`;
  if (o.kind === "amount") return `$${o.value}`;
  return o.value;
}

/** "2 days" / "1 day" — used in the wait control and its explanation. */
export function waitLabel(wait: FeedbackCondition["wait"]) {
  const unit = wait.value === 1 ? wait.unit.replace(/s$/, "") : wait.unit;
  return `${wait.value} ${unit}`;
}

/** The branch messages of a conditional stage, in the configured order. */
export function branchMessages(stage: Stage, messages: SequenceMessage[] = stage.sequence) {
  if (!stage.condition) return [];
  return stage.condition.order
    .map((key) => messages.find((m) => m.branch?.key === key))
    .filter((m): m is SequenceMessage => Boolean(m));
}

/** The initial (non-branch) messages of a conditional stage. */
export function trunkMessages(messages: SequenceMessage[]) {
  return messages.filter((m) => !m.branch);
}
