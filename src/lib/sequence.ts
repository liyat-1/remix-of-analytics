/**
 * Campaign sequence model.
 *
 * The structure of the sequence (how many steps, and the wait between them) is
 * built in the Preferences step. The *content* of each step — per channel — is
 * configured in the Sequence step. A step is one communication moment; email
 * and text are configurations inside it, never separate steps.
 */

export type DelayUnit = "minutes" | "hours" | "days" | "weeks";

export type ChannelKey = "email" | "text";

export type ChannelConfig = {
  /** Content has been written / a template applied. */
  configured: boolean;
  templateId: string | null;
  templateName: string | null;
  subject: string;
  heading: string;
  body: string;
  /** SMS copy. */
  message: string;
};

import { defaultLanding, defaultSuccess, type PageConfig } from "./experience";

export type SequenceStep = {
  id: string;
  name: string;
  kind: "initial" | "followup";
  /** Wait before this step is sent. Ignored for the initial message. */
  delay: { value: number; unit: DelayUnit };
  email: ChannelConfig;
  text: ChannelConfig;
  /** Guest-facing pages, shared by every channel in this step. */
  landing: PageConfig;
  success: PageConfig;
};

export const INITIAL_STEP_ID = "initial";

export const DELAY_UNITS: { value: DelayUnit; label: string }[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

const sid = () => `step_${Math.random().toString(36).slice(2, 9)}`;

export function delayLabel(d: SequenceStep["delay"]) {
  const unit = d.value === 1 ? d.unit.replace(/s$/, "") : d.unit;
  return `Wait ${d.value} ${unit}`;
}

function emptyChannel(partial?: Partial<ChannelConfig>): ChannelConfig {
  return {
    configured: false,
    templateId: null,
    templateName: null,
    subject: "",
    heading: "",
    body: "",
    message: "",
    ...partial,
  };
}

const FOLLOW_UP_PRESETS = [
  { delay: { value: 2, unit: "days" as DelayUnit } },
  { delay: { value: 3, unit: "days" as DelayUnit } },
  { delay: { value: 5, unit: "days" as DelayUnit } },
];

export function makeFollowUp(index: number): SequenceStep {
  const preset = FOLLOW_UP_PRESETS[Math.min(index, FOLLOW_UP_PRESETS.length - 1)];
  return {
    id: sid(),
    name: `Follow-up ${index + 1}`,
    kind: "followup",
    delay: { ...preset.delay },
    email: emptyChannel(),
    text: emptyChannel(),
    landing: defaultLanding(),
    success: defaultSuccess(),
  };
}

export function makeInitialStep(): SequenceStep {
  return {
    id: INITIAL_STEP_ID,
    name: "Initial message",
    kind: "initial",
    delay: { value: 0, unit: "days" },
    email: emptyChannel(),
    text: emptyChannel(),
    landing: defaultLanding(),
    success: defaultSuccess(),
  };
}

export function duplicateStep(step: SequenceStep, index: number): SequenceStep {
  return {
    ...step,
    id: sid(),
    kind: "followup",
    name: `Follow-up ${index + 1}`,
    email: { ...step.email },
    text: { ...step.text },
    landing: { ...step.landing },
    success: { ...step.success },
  };
}

/** Follow-ups are renumbered so the timeline always reads 1, 2, 3… */
export function renumber(steps: SequenceStep[]): SequenceStep[] {
  let n = 0;
  return steps.map((s) =>
    s.kind === "initial" ? s : { ...s, name: `Follow-up ${++n}` },
  );
}

/** A new campaign starts with just the initial message. */
export function defaultSteps(): SequenceStep[] {
  return [makeInitialStep()];
}

export type ConfigState = "ready" | "needs" | "off";

export function channelState(
  step: SequenceStep,
  key: ChannelKey,
  active: boolean,
): ConfigState {
  if (!active) return "off";
  return step[key].configured ? "ready" : "needs";
}

export function missingChannels(
  steps: SequenceStep[],
  channels: { email: boolean; text: boolean },
): { step: SequenceStep; channel: ChannelKey }[] {
  const out: { step: SequenceStep; channel: ChannelKey }[] = [];
  for (const step of steps) {
    (["email", "text"] as ChannelKey[]).forEach((c) => {
      if (channels[c] && !step[c].configured) out.push({ step, channel: c });
    });
  }
  return out;
}

/* ------------------------- Rules ------------------------- */

export type RuleTrigger =
  | "booked"
  | "opened"
  | "not_opened"
  | "clicked"
  | "not_clicked"
  | "replied"
  | "no_booking_days";

export type RuleAction = "stop" | "continue" | "another_followup";

export type Rule = {
  id: string;
  trigger: RuleTrigger;
  action: RuleAction;
  /** Only used by the "no booking after X days" trigger. */
  days: number;
};

export const RULE_TRIGGERS: { value: RuleTrigger; label: string }[] = [
  { value: "booked", label: "Guest booked" },
  { value: "opened", label: "Guest opened the email" },
  { value: "not_opened", label: "Guest didn't open the email" },
  { value: "clicked", label: "Guest clicked the booking button" },
  { value: "not_clicked", label: "Guest didn't click the booking button" },
  { value: "replied", label: "Guest replied" },
  { value: "no_booking_days", label: "No booking after X days" },
];

export const RULE_ACTIONS: { value: RuleAction; label: string; hint: string }[] = [
  { value: "stop", label: "Stop campaign", hint: "No further messages are sent to that guest." },
  { value: "continue", label: "Continue campaign", hint: "The guest keeps the normal schedule." },
  {
    value: "another_followup",
    label: "Send another follow-up",
    hint: "One extra reminder is added for that guest.",
  },
];

export function ruleSentence(r: Rule) {
  const trigger =
    r.trigger === "no_booking_days"
      ? `No booking after ${r.days} days`
      : (RULE_TRIGGERS.find((t) => t.value === r.trigger)?.label ?? "");
  const action = RULE_ACTIONS.find((a) => a.value === r.action)?.label ?? "";
  return `If ${trigger.toLowerCase()} → ${action}`;
}

export function makeRule(): Rule {
  return {
    id: `rule_${Math.random().toString(36).slice(2, 9)}`,
    trigger: "booked",
    action: "stop",
    days: 3,
  };
}
