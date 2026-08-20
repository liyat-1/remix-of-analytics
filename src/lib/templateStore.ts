import { createCanvasCampaign, createStructuredCampaign, type Campaign } from "./campaign";

/**
 * Tiny in-browser template library. Templates are shared assets: campaigns
 * point at one, the Template Studio edits them. Persisted to localStorage so
 * the Studio (opened in its own tab) and the campaign picker stay in sync.
 */

export type StoredTemplate = {
  id: string;
  name: string;
  desc: string;
  shared: boolean;
  owner: string;
  createdBy: string;
  campaigns: number;
  active: number;
  version: number;
  createdAt: number;
  updatedAt: number;
  lastUsed: number | null;
  uses: number;
  campaign: Campaign;
};

const KEY = "directful.templates.v1";
const REQ = "directful.studio.request";
const RES = "directful.studio.result";

const DAY = 86_400_000;

function editorial(): Campaign {
  const c = createStructuredCampaign();
  c.meta.name = "Editorial feature";
  c.theme.accent = "#0f766e";
  c.theme.pageBg = "#f4f4f5";
  c.header.bg = "#0f766e";
  c.header.logoText = "THE LODGE";
  c.header.align = "left";
  c.hero.height = 320;
  c.body.align = "left";
  c.cta.bg = "#0f766e";
  c.cta.align = "left";
  c.cta.fullWidth = false;
  c.cta.radius = 2;
  c.details.visible = true;
  return c;
}

function seed(): StoredTemplate[] {
  const now = Date.now();
  return [
    {
      id: "classic",
      name: "Default",
      desc: "Left aligned copy with a full-width button. Safe in every client.",
      shared: true,
      owner: "Marketing Team",
      createdBy: "Marketing Team",
      campaigns: 18,
      active: 6,
      version: 4,
      createdAt: now - 180 * DAY,
      updatedAt: now - 2 * DAY,
      lastUsed: now - 1 * DAY,
      uses: 42,
      campaign: createCanvasCampaign(),
    },
    {
      id: "valley",
      name: "Valley Lodge",
      desc: "Warm centred header, inline button and a guest detail grid.",
      shared: false,
      owner: "You",
      createdBy: "You",
      campaigns: 2,
      active: 1,
      version: 2,
      createdAt: now - 40 * DAY,
      updatedAt: now - 6 * 3600_000,
      lastUsed: now - 9 * DAY,
      uses: 5,
      campaign: createStructuredCampaign(),
    },
    {
      id: "editorial",
      name: "Editorial feature",
      desc: "Tall hero, magazine spacing and a left aligned call to action.",
      shared: true,
      owner: "Brand Studio",
      createdBy: "Brand Studio",
      campaigns: 7,
      active: 0,
      version: 3,
      createdAt: now - 90 * DAY,
      updatedAt: now - 21 * DAY,
      lastUsed: now - 30 * DAY,
      uses: 11,
      campaign: editorial(),
    },
  ];
}

let cache: StoredTemplate[] | null = null;
const listeners = new Set<() => void>();

function read(): StoredTemplate[] {
  if (cache) return cache;
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredTemplate[];
      if (Array.isArray(parsed) && parsed.length) {
        cache = parsed;
        return parsed;
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  cache = seed();
  write(cache);
  return cache;
}

function write(next: StoredTemplate[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota — in-memory is still correct */
  }
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY || e.key === RES) {
      cache = null;
      listeners.forEach((l) => l());
    }
  });
}

export function listTemplates(): StoredTemplate[] {
  return read();
}

export function getTemplate(id: string | null): StoredTemplate | undefined {
  if (!id) return undefined;
  return read().find((t) => t.id === id);
}

export function subscribeTemplates(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

const newId = () => `tpl_${Math.random().toString(36).slice(2, 9)}`;

export function createTemplate(
  campaign: Campaign,
  name: string,
  desc = "Custom template",
): StoredTemplate {
  const now = Date.now();
  const t: StoredTemplate = {
    id: newId(),
    name,
    desc,
    shared: false,
    owner: "You",
    createdBy: "You",
    campaigns: 0,
    active: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
    lastUsed: null,
    uses: 0,
    campaign,
  };
  write([t, ...read()]);
  return t;
}

export function updateTemplate(id: string, campaign: Campaign) {
  write(
    read().map((t) =>
      t.id === id ? { ...t, campaign, updatedAt: Date.now(), version: t.version + 1 } : t,
    ),
  );
}

export function duplicateTemplate(id: string): StoredTemplate | undefined {
  const src = read().find((t) => t.id === id);
  if (!src) return undefined;
  const now = Date.now();
  const copy: StoredTemplate = {
    ...src,
    id: newId(),
    name: `${src.name} copy`,
    shared: false,
    owner: "You",
    createdBy: "You",
    campaigns: 0,
    active: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
    lastUsed: null,
    uses: 0,
    campaign: JSON.parse(JSON.stringify(src.campaign)),
  };
  write([copy, ...read()]);
  return copy;
}

export function renameTemplate(id: string, name: string) {
  write(read().map((t) => (t.id === id ? { ...t, name, updatedAt: Date.now() } : t)));
}

export function deleteTemplate(id: string) {
  write(read().filter((t) => t.id !== id));
}

export function markTemplateUsed(id: string) {
  write(read().map((t) => (t.id === id ? { ...t, lastUsed: Date.now(), uses: t.uses + 1 } : t)));
}

/* ------------------ Studio hand-off (picker ⇄ template studio) ------------------ */

export type StudioRequest = { mode: "create" | "edit"; templateId?: string };

export function setStudioRequest(req: StudioRequest) {
  try {
    window.localStorage.setItem(REQ, JSON.stringify(req));
  } catch {
    /* noop */
  }
}

export function readStudioRequest(): StudioRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REQ);
    return raw ? (JSON.parse(raw) as StudioRequest) : null;
  } catch {
    return null;
  }
}

export function setStudioResult(templateId: string) {
  try {
    window.localStorage.setItem(RES, JSON.stringify({ templateId, at: Date.now() }));
  } catch {
    /* noop */
  }
}

export function consumeStudioResult(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RES);
    if (!raw) return null;
    window.localStorage.removeItem(RES);
    return (JSON.parse(raw) as { templateId: string }).templateId ?? null;
  } catch {
    return null;
  }
}

/** "2 days ago" style relative label. */
export function relTime(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / 3600_000)}h ago`;
  const d = Math.floor(diff / DAY);
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
