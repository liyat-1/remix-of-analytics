/**
 * Messaging strategy for OTA Buster.
 *
 * A strategy is configured once and inherited by the stages it is applied to.
 * Individual stages can override it later.
 *
 * Benchmarks below are the validated Directful campaign benchmarks. Only
 * strategies with a benchmark show a number — never invent one.
 */

import type { Channel, StageId } from "@/lib/otaJourney";

export type StrategyId = "email" | "text" | "both" | "text_fallback";

export type Recommendation = "recommended" | "neutral" | "not_advised";

export type Strategy = {
  id: StrategyId;
  label: string;
  summary: string;
  detail: string;
  recommendation: Recommendation;
  /** Validated Directful benchmark. Omitted when no benchmark exists. */
  benchmark?: string;
  /** Which content the guest can receive under this strategy. */
  channel: Channel;
};

export const STRATEGIES: Strategy[] = [
  {
    id: "both",
    label: "Email + Text",
    summary: "Best reach across your guest journey",
    detail:
      "Sends both a text and an email — each with its own content — when the guest relationship allows both channels.",
    recommendation: "recommended",
    benchmark: "+90% reach vs. Email only",
    channel: "both",
  },
  {
    id: "email",
    label: "Email only",
    summary: "Strong, consistent direct communication",
    detail:
      "Sends by email to guests with a valid email address when the guest relationship allows email.",
    recommendation: "recommended",
    channel: "email",
  },
  {
    id: "text_fallback",
    label: "Text with Email fallback",
    summary: "Text first, email when the text can't be sent",
    detail:
      "Sends a text to guests with a valid mobile number. If the text cannot be sent, an email version is sent instead.",
    recommendation: "neutral",
    channel: "both",
  },
  {
    id: "text",
    label: "Text only",
    summary: "Lower engagement compared with email-based campaigns",
    detail: "Sends by text (SMS) only, to guests with a valid mobile number.",
    recommendation: "not_advised",
    benchmark: "−13% engagement vs. Email + Text",
    channel: "text",
  },
];

export const STRATEGY_BY_ID: Record<StrategyId, Strategy> = STRATEGIES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<StrategyId, Strategy>,
);

export const strategyLabel = (id: StrategyId) => STRATEGY_BY_ID[id].label;
export const strategyChannel = (id: StrategyId): Channel => STRATEGY_BY_ID[id].channel;

export const DEFAULT_STRATEGY: Record<StageId, StrategyId> = {
  just_booked: "email",
  pre_checkin: "both",
  during_stay: "both",
  post_checkout: "email",
  retain: "email",
};

export const RECOMMENDATION_LABEL: Record<Recommendation, string | null> = {
  recommended: "Recommended",
  neutral: null,
  not_advised: "Not advised",
};
