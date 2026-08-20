/**
 * OTA Buster — visual branching model for the stage campaign editor.
 *
 * A campaign is a list of nodes rendered as one connected canvas:
 *
 *   message → wait → message → rule → [ path → message → wait → message ]
 *
 * A rule never ends the journey: it splits it into paths, and every path is a
 * real mini-sequence that can grow its own follow-ups (and, if the marketer
 * wants it, its own rule).
 */

import type { BranchKey, FeedbackCondition, SequenceMessage, Stage } from "./otaJourney";

export type Wait = FeedbackCondition["wait"];

export type Tone = "good" | "warn" | "neutral";

/* ----------------------------- rule sources ----------------------------- */

export type RuleSource = "feedback" | "rating" | "response" | "booking" | "segment";

export const RULE_SOURCES: {
  value: RuleSource;
  label: string;
  hint: string;
  available: boolean;
}[] = [
  {
    value: "feedback",
    label: "Guest feedback",
    hint: "What happens next depends on how the guest rated their stay.",
    available: true,
  },
  {
    value: "rating",
    label: "Guest rating",
    hint: "Split the journey on the star rating the guest left.",
    available: true,
  },
  {
    value: "response",
    label: "Guest response",
    hint: "Split on whether the guest replied to the message.",
    available: false,
  },
  {
    value: "booking",
    label: "Booking details",
    hint: "Split on room type, length of stay or rate plan.",
    available: false,
  },
  {
    value: "segment",
    label: "Guest segment",
    hint: "Split on returning guests, families or business travellers.",
    available: false,
  },
];

export type PathMeta = {
  key: BranchKey;
  label: string;
  range: string;
  note: string;
  tone: Tone;
  follow: string;
};

/** The three useful outcomes of a feedback rule — created in one click. */
export const FEEDBACK_PATHS: PathMeta[] = [
  {
    key: "positive",
    label: "Positive",
    range: "4–5 stars",
    note: "Sent to guests who give a positive rating.",
    tone: "good",
    follow: "Thank-you + direct-booking offer",
  },
  {
    key: "negative",
    label: "Negative",
    range: "1–3 stars",
    note: "Sent to guests who report a negative experience.",
    tone: "warn",
    follow: "Recovery message",
  },
  {
    key: "none",
    label: "No response",
    range: "No feedback received",
    note: "Sent when the guest hasn't submitted feedback within the waiting period.",
    tone: "neutral",
    follow: "Feedback reminder",
  },
];

export const pathMeta = (key: BranchKey) =>
  FEEDBACK_PATHS.find((p) => p.key === key) ?? FEEDBACK_PATHS[0]!;

/* -------------------------------- nodes -------------------------------- */

export type MessageNode = {
  id: string;
  kind: "message";
  /** Id of the SequenceMessage this card renders. */
  msgId: string;
  /** Wait before this message is sent. Null = sent immediately. */
  wait: Wait | null;
};

export type RulePath = {
  key: BranchKey;
  meta: PathMeta;
  nodes: JourneyNode[];
};

export type RuleNode = {
  id: string;
  kind: "rule";
  source: RuleSource;
  title: string;
  hint: string;
  /** How long the campaign waits for the guest before the "no response" path. */
  wait: Wait;
  paths: RulePath[];
};

export type JourneyNode = MessageNode | RuleNode;

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export const msgNode = (msgId: string, wait: Wait | null = null): MessageNode => ({
  id: uid("n"),
  kind: "message",
  msgId,
  wait,
});

export function makeRule(
  source: RuleSource,
  wait: Wait,
  seed: (meta: PathMeta) => string,
): RuleNode {
  const meta = RULE_SOURCES.find((s) => s.value === source)!;
  return {
    id: uid("rule"),
    kind: "rule",
    source,
    title: meta.label,
    hint: meta.hint,
    wait: { ...wait },
    paths: FEEDBACK_PATHS.map((p) => ({
      key: p.key,
      meta: p,
      nodes: [msgNode(seed(p), p.key === "none" ? { ...wait } : null)],
    })),
  };
}

/* ------------------------------ containers ------------------------------ */

/** "root" or "<ruleId>:<pathKey>" — where a node lives. */
export const ROOT = "root";
export const containerId = (ruleId: string, key: BranchKey) => `${ruleId}:${key}`;

function mapContainer(
  nodes: JourneyNode[],
  target: string,
  fn: (list: JourneyNode[]) => JourneyNode[],
  self: string = ROOT,
): JourneyNode[] {
  const next = self === target ? fn(nodes) : nodes;
  return next.map((n) =>
    n.kind === "rule"
      ? {
          ...n,
          paths: n.paths.map((p) => ({
            ...p,
            nodes: mapContainer(p.nodes, target, fn, containerId(n.id, p.key)),
          })),
        }
      : n,
  );
}

export const addToContainer = (nodes: JourneyNode[], target: string, node: JourneyNode) =>
  mapContainer(nodes, target, (list) => [...list, node]);

export function removeNode(nodes: JourneyNode[], id: string): JourneyNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) =>
      n.kind === "rule"
        ? { ...n, paths: n.paths.map((p) => ({ ...p, nodes: removeNode(p.nodes, id) })) }
        : n,
    );
}

export function patchNode<T extends JourneyNode>(
  nodes: JourneyNode[],
  id: string,
  patch: Partial<T>,
): JourneyNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch } as JourneyNode;
    return n.kind === "rule"
      ? { ...n, paths: n.paths.map((p) => ({ ...p, nodes: patchNode(p.nodes, id, patch) })) }
      : n;
  });
}

/** True when the container (or anything under it) already holds a rule. */
export function hasRule(nodes: JourneyNode[]): boolean {
  return nodes.some((n) => n.kind === "rule");
}

export function countMessages(nodes: JourneyNode[]): number {
  return nodes.reduce(
    (n, node) =>
      node.kind === "message"
        ? n + 1
        : n + node.paths.reduce((a, p) => a + countMessages(p.nodes), 0),
    0,
  );
}

/* ------------------------------- building ------------------------------- */

/**
 * Turn a stage's flat sequence into the visual journey: trunk messages stay
 * linear, and a stage that already branches on feedback gets its rule node
 * with one path per outcome.
 */
export function buildJourney(stage: Stage, messages: SequenceMessage[]): JourneyNode[] {
  const trunk = messages.filter((m) => !m.branch);
  const nodes: JourneyNode[] = trunk.map((m, i) =>
    msgNode(m.id, i === 0 ? null : { value: 2, unit: "days" }),
  );

  if (!stage.condition) return nodes;

  const wait = stage.condition.wait;
  const paths: RulePath[] = FEEDBACK_PATHS.map((meta) => {
    const branchMsg = messages.find((m) => m.branch?.key === meta.key);
    return {
      key: meta.key,
      meta,
      nodes: branchMsg ? [msgNode(branchMsg.id, meta.key === "none" ? { ...wait } : null)] : [],
    };
  });

  nodes.push({
    id: "rule_feedback",
    kind: "rule",
    source: "feedback",
    title: stage.condition.title,
    hint: stage.condition.hint,
    wait: { ...wait },
    paths,
  });
  return nodes;
}

/** A new follow-up cloned from an existing message, kept editable everywhere. */
export function newFollowUp(
  base: SequenceMessage,
  name: string,
  branch?: SequenceMessage["branch"],
): SequenceMessage {
  return {
    ...base,
    id: uid("msg"),
    name,
    timing: "Sent after the previous message",
    branch,
    email: { ...base.email },
    landing: { ...base.landing, fields: base.landing.fields.map((f) => ({ ...f })) },
    success: { ...base.success },
    offer: { ...base.offer },
  };
}

export function waitText(w: Wait) {
  const unit = w.value === 1 ? w.unit.replace(/s$/, "") : w.unit;
  return `${w.value} ${unit}`;
}

/** The node list living in a container ("root" or "<ruleId>:<pathKey>"). */
export function getContainer(
  nodes: JourneyNode[],
  target: string,
  self: string = ROOT,
): JourneyNode[] {
  if (self === target) return nodes;
  for (const n of nodes) {
    if (n.kind !== "rule") continue;
    for (const p of n.paths) {
      const found = getContainer(p.nodes, target, containerId(n.id, p.key));
      if (found.length || containerId(n.id, p.key) === target) return found;
    }
  }
  return [];
}

/** The branch metadata for a container, so new follow-ups keep their label. */
export function containerBranch(target: string): PathMeta | undefined {
  if (target === ROOT) return undefined;
  const key = target.split(":")[1] as BranchKey;
  return FEEDBACK_PATHS.find((p) => p.key === key);
}
