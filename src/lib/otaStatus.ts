/**
 * Content readiness for one OTA sequence message.
 *
 * Every message is a full guest experience: the message itself (email and/or
 * text), the landing page the guest opens, and the success page shown once they
 * convert. Landing and success are shared by both channels of the message.
 */

import type { Channel, SequenceMessage } from "./otaJourney";

export type ContentState = "ready" | "partial" | "empty";
export type ContentKey = "email" | "text" | "landing" | "success";

export const CONTENT_LABEL: Record<ContentKey, string> = {
  email: "Email content",
  text: "Text content",
  landing: "Landing page",
  success: "Success page",
};

export const CONTENT_HINT: Record<ContentKey, string> = {
  email: "The email that lands in the guest's inbox.",
  text: "The SMS the guest receives on their phone.",
  landing: "The page the guest opens from the message — shared by both channels.",
  success: "What the guest sees once they convert — shared by both channels.",
};

export const STATE_META: Record<
  ContentState,
  { label: string; short: string; text: string; chip: string; dot: string }
> = {
  ready: {
    label: "Edited & saved",
    short: "Saved",
    text: "text-emerald-700",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  partial: {
    label: "Edited · incomplete",
    short: "Incomplete",
    text: "text-amber-700",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  empty: {
    label: "Not edited yet",
    short: "Not edited",
    text: "text-slate-500",
    chip: "border-slate-200 bg-slate-50 text-slate-500",
    dot: "bg-slate-300",
  },
};

export const isShared = (key: ContentKey) => key === "landing" || key === "success";

const has = (v?: string) => Boolean(v && v.trim());

function state(required: (string | undefined)[], optional: (string | undefined)[] = []): ContentState {
  const filled = required.filter(has).length;
  const touched = filled > 0 || optional.some(has);
  if (filled === required.length) return "ready";
  return touched ? "partial" : "empty";
}

export function emailState(m: SequenceMessage): ContentState {
  return state([m.email.subject, m.email.heading, m.email.body.join(" "), m.email.cta], [m.email.preheader]);
}

export function textState(m: SequenceMessage): ContentState {
  return state([m.text], [m.textLinkLabel]);
}

export function landingState(m: SequenceMessage): ContentState {
  return state([m.landing.headline, m.landing.subtext, m.landing.submitLabel], [m.landing.sectionTitle]);
}

export function successState(m: SequenceMessage): ContentState {
  return state([m.success.headline, m.success.message, m.success.cta], [m.success.footnote]);
}

export type ContentItem = { key: ContentKey; label: string; state: ContentState };

/** The editable content of a message, given the campaign's channel strategy. */
export function contentItems(m: SequenceMessage, channel: Channel): ContentItem[] {
  const items: ContentItem[] = [];
  if (channel !== "text") items.push({ key: "email", label: "Email", state: emailState(m) });
  if (channel !== "email") items.push({ key: "text", label: "Text", state: textState(m) });
  items.push({ key: "landing", label: "Landing", state: landingState(m) });
  items.push({ key: "success", label: "Success", state: successState(m) });
  return items;
}

export function contentSummary(m: SequenceMessage, channel: Channel) {
  const items = contentItems(m, channel);
  const ready = items.filter((i) => i.state === "ready").length;
  return { items, ready, total: items.length, complete: ready === items.length };
}
