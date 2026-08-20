/**
 * Guest experience model.
 *
 * A message is never just a message: it is one complete experience made of
 * three parts — the Message (email / text), the Landing page the guest lands
 * on, and the Success page shown once they convert.
 *
 * Landing and Success are shared per step: both channels lead to the same
 * guest-facing pages, so they are never duplicated per channel.
 */

import type { ChannelKey, SequenceStep } from "./sequence";

export type ExperienceState = "ready" | "needs" | "empty";

export type PageConfig = {
  configured: boolean;
  headline: string;
  subheadline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  /** Small supporting line under the CTA (fine print, reassurance). */
  footnote: string;
};

export type PageKey = "landing" | "success";

export type ElementKey = ChannelKey | PageKey;

export function emptyPage(partial?: Partial<PageConfig>): PageConfig {
  return {
    configured: false,
    headline: "",
    subheadline: "",
    body: "",
    ctaLabel: "",
    ctaUrl: "",
    footnote: "",
    ...partial,
  };
}

export function defaultLanding(): PageConfig {
  return emptyPage();
}

export function defaultSuccess(): PageConfig {
  return emptyPage();
}

/** Suggested starting content when the guest opens the editor for the first time. */
export const PAGE_STARTERS: Record<PageKey, PageConfig> = {
  landing: {
    configured: true,
    headline: "Your best rate at {{hotel}}",
    subheadline: "Book direct and skip the booking fees.",
    body: "Welcome back, {{first_name}}. As a returning guest you unlock our lowest available rate, flexible cancellation and a room upgrade when available.",
    ctaLabel: "Check availability",
    ctaUrl: "https://book.directful.com/offer",
    footnote: "No booking fees · Free cancellation up to 24h before arrival",
  },
  success: {
    configured: true,
    headline: "You're all set, {{first_name}}",
    subheadline: "Your booking is confirmed at {{hotel}}.",
    body: "We've sent your confirmation by email. Our team will be in touch before arrival with check-in details.",
    ctaLabel: "View my booking",
    ctaUrl: "https://book.directful.com/booking",
    footnote: "Need to change something? Reply to your confirmation email.",
  },
};

export const ELEMENT_LABELS: Record<ElementKey, string> = {
  email: "Email",
  text: "Text",
  landing: "Landing",
  success: "Success",
};

/** What each element is, in the marketer's words. */
export const ELEMENT_HINTS: Record<ElementKey, string> = {
  email: "The email that lands in the guest's inbox.",
  text: "The SMS the guest receives on their phone.",
  landing: "The page the guest opens from the message.",
  success: "What the guest sees once they convert.",
};

/**
 * Status vocabulary shown everywhere: the sequence card, the editor tabs and
 * the readiness panel all use exactly these words so nothing is ambiguous.
 */
export const STATE_META: Record<
  ExperienceState,
  { label: string; short: string; text: string; bg: string; dot: string }
> = {
  ready: {
    label: "Edited & saved",
    short: "Saved",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  needs: {
    label: "Edited · incomplete",
    short: "Incomplete",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  empty: {
    label: "Not edited yet",
    short: "Not edited",
    text: "text-zinc-500",
    bg: "bg-zinc-50 border-zinc-200",
    dot: "bg-zinc-300",
  },
};

/** Landing and Success are one shared pair for every channel in the step. */
export const SHARED_KEYS: ElementKey[] = ["landing", "success"];
export const isShared = (key: ElementKey) => key === "landing" || key === "success";


export function pageState(p: PageConfig): ExperienceState {
  if (!p.configured) return "empty";
  const complete = Boolean(p.headline.trim() && p.body.trim() && p.ctaLabel.trim());
  return complete ? "ready" : "needs";
}

export function messageState(step: SequenceStep, channel: ChannelKey): ExperienceState {
  const cfg = step[channel];
  if (!cfg.configured) return "empty";
  const complete =
    channel === "email"
      ? Boolean(cfg.subject.trim() && cfg.body.trim())
      : Boolean(cfg.message.trim());
  return complete ? "ready" : "needs";
}

export type ExperienceItem = { key: ElementKey; label: string; state: ExperienceState };

/** The full readiness picture for one step. Landing / Success are shared. */
export function experienceItems(
  step: SequenceStep,
  channels: { email: boolean; text: boolean },
): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  if (channels.email)
    items.push({ key: "email", label: "Email", state: messageState(step, "email") });
  if (channels.text) items.push({ key: "text", label: "Text", state: messageState(step, "text") });
  items.push({ key: "landing", label: "Landing", state: pageState(step.landing) });
  items.push({ key: "success", label: "Success", state: pageState(step.success) });
  return items;
}

export function experienceSummary(
  step: SequenceStep,
  channels: { email: boolean; text: boolean },
) {
  const items = experienceItems(step, channels);
  const ready = items.filter((i) => i.state === "ready").length;
  return { items, ready, total: items.length, complete: ready === items.length };
}

/** Every element across the sequence that still needs attention. */
export function experienceAttention(
  steps: SequenceStep[],
  channels: { email: boolean; text: boolean },
): { step: SequenceStep; item: ExperienceItem }[] {
  const out: { step: SequenceStep; item: ExperienceItem }[] = [];
  for (const step of steps)
    for (const item of experienceItems(step, channels))
      if (item.state !== "ready") out.push({ step, item });
  return out;
}
