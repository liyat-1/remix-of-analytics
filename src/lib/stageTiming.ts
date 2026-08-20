/**
 * Stage-level timing for the OTA guest journey.
 *
 * Stage timing answers "when does this part of the journey begin?" and is
 * always anchored to a guest milestone (booking, arrival, check-in, checkout).
 * It is deliberately separate from sequence timing, which decides when each
 * individual message inside a stage is sent.
 */

import type { StageId } from "./otaJourney";

export type TimingUnit = "hours" | "days" | "weeks" | "months";

export type TimingAnchor =
  | "after_booking"
  | "before_arrival"
  | "after_arrival"
  | "at_checkin"
  | "after_checkin"
  | "after_checkout";

export type StageTiming = {
  value: number;
  unit: TimingUnit;
  anchor: TimingAnchor;
};

export const UNIT_LABEL: Record<TimingUnit, [string, string]> = {
  hours: ["Hour", "Hours"],
  days: ["Day", "Days"],
  weeks: ["Week", "Weeks"],
  months: ["Month", "Months"],
};

const ANCHOR_LABEL: Record<TimingAnchor, string> = {
  after_booking: "After booking",
  before_arrival: "Before arrival",
  after_arrival: "After arrival",
  at_checkin: "At check-in",
  after_checkin: "After check-in",
  after_checkout: "After checkout",
};

/** Anchor choices offered per stage — kept narrow so the meaning stays obvious. */
const ANCHORS: Record<StageId, TimingAnchor[]> = {
  just_booked: ["after_booking"],
  pre_checkin: ["before_arrival", "after_arrival"],
  during_stay: ["at_checkin", "after_checkin"],
  post_checkout: ["after_checkout"],
  retain: ["after_checkout"],
};

const UNITS: Record<StageId, TimingUnit[]> = {
  just_booked: ["hours", "days"],
  pre_checkin: ["hours", "days", "weeks"],
  during_stay: ["hours", "days"],
  post_checkout: ["hours", "days", "weeks"],
  retain: ["days", "weeks", "months"],
};

export const DEFAULT_STAGE_TIMING: Record<StageId, StageTiming> = {
  just_booked: { value: 0, unit: "hours", anchor: "after_booking" },
  pre_checkin: { value: 3, unit: "days", anchor: "before_arrival" },
  during_stay: { value: 0, unit: "hours", anchor: "at_checkin" },
  post_checkout: { value: 1, unit: "days", anchor: "after_checkout" },
  retain: { value: 14, unit: "days", anchor: "after_checkout" },
};

export function anchorOptions(stageId: StageId) {
  return ANCHORS[stageId].map((a) => ({ value: a, label: ANCHOR_LABEL[a] }));
}

export function unitOptions(stageId: StageId, value: number) {
  return UNITS[stageId].map((u) => ({
    value: u,
    label: UNIT_LABEL[u][value === 1 ? 0 : 1],
  }));
}

/** The natural-language sentence shown above the controls. */
export function timingLabel(t: StageTiming): string {
  if (t.anchor === "at_checkin") return "At check-in";
  if (t.value === 0) {
    if (t.anchor === "after_booking") return "Immediately after booking";
    if (t.anchor === "after_checkin") return "At check-in";
    if (t.anchor === "after_arrival") return "On arrival";
    if (t.anchor === "after_checkout") return "At checkout";
    return "On arrival";
  }
  const unit = UNIT_LABEL[t.unit][t.value === 1 ? 0 : 1].toLowerCase();
  const tail =
    t.anchor === "before_arrival"
      ? "before arrival"
      : t.anchor === "after_arrival"
        ? "after arrival"
        : t.anchor === "after_booking"
          ? "after booking"
          : t.anchor === "after_checkin"
            ? "after check-in"
            : "after checkout";
  return `${t.value} ${unit} ${tail}`;
}
