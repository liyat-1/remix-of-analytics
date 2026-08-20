import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Mail,
  Moon,
  Save,
  Send,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Pencil,
  Check,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { EmailPreview, type BlockId } from "./EmailPreview";
import { BLOCK_LABELS, BlockForm, SenderForm, ThemeForm } from "./BlockForms";
import { EditorPanel } from "./EditorDialog";
import { FloatingCard, useAnchorRect } from "./FloatingEditor";
import { InboxPreview } from "./InboxPreview";
import { PhoneMockup } from "./PhoneMockup";
import { Field, TextArea, TextInput } from "./controls";
import { useCampaign } from "@/lib/useCampaign";
import {
  createTemplate,
  getTemplate,
  readStudioRequest,
  setStudioResult,
  updateTemplate,
  type StudioRequest,
} from "@/lib/templateStore";
import { renderTokens, type Campaign } from "@/lib/campaign";
import { stripHtml } from "@/lib/richtext";

const ORDER: BlockId[] = ["header", "hero", "body", "cta", "details", "footer"];

const EDIT_TITLES: Record<BlockId, string> = {
  header: "Header & logo",
  hero: "Hero image",
  body: "Text content",
  cta: "Button",
  details: "Detail grid",
  footer: "Footer",
};

const LAYOUTS = [
  {
    id: "classic",
    name: "Default Template",
    desc: "Clean and left aligned with a full-width button.",
  },
  {
    id: "centered",
    name: "Centered Announcement",
    desc: "Everything centered with a pill button.",
  },
  {
    id: "editorial",
    name: "Editorial Feature",
    desc: "Tall hero, inline button and a detail grid.",
  },
] as const;
type LayoutId = (typeof LAYOUTS)[number]["id"];

function applyLayout(d: Campaign, id: LayoutId) {
  if (id === "classic") {
    d.body.align = "left";
    d.cta.align = "center";
    d.cta.fullWidth = true;
    d.cta.radius = 4;
    d.hero.height = 240;
    d.details.visible = false;
    d.header.align = "left";
  } else if (id === "centered") {
    d.body.align = "center";
    d.cta.align = "center";
    d.cta.fullWidth = false;
    d.cta.radius = 999;
    d.hero.height = 220;
    d.header.align = "center";
  } else {
    d.body.align = "left";
    d.cta.align = "left";
    d.cta.fullWidth = false;
    d.cta.radius = 2;
    d.hero.height = 320;
    d.details.visible = true;
    d.header.align = "left";
  }
}

/** Small wireframe thumbnail per layout. */
function LayoutThumb({ id, big = false }: { id: LayoutId; big?: boolean }) {
  const bar = "rounded-full bg-zinc-300";
  return (
    <div
      className={`grid shrink-0 content-start gap-1.5 rounded-lg bg-zinc-100 p-2.5 ${
        big ? "h-[132px] w-full" : "h-[68px] w-[92px]"
      }`}
    >
      {id === "classic" && (
        <>
          <div className={`${bar} ${big ? "h-2 w-14" : "h-1.5 w-8"}`} />
          <div className={`rounded bg-zinc-300/80 ${big ? "h-12" : "h-4"}`} />
          <div className={`${bar} h-1`} />
          <div className={`${bar} h-1`} />
          <div className={`${bar} h-1 w-2/3`} />
          {big && <div className="mt-1 h-4 rounded bg-zinc-400" />}
        </>
      )}
      {id === "centered" && (
        <>
          <div className={`${bar} mx-auto ${big ? "h-2 w-14" : "h-1.5 w-8"}`} />
          <div className={`rounded bg-zinc-300/80 ${big ? "h-12" : "h-4"}`} />
          <div className={`${bar} mx-auto h-1 w-3/4`} />
          {big && <div className={`${bar} mx-auto h-1 w-1/2`} />}
          <div
            className={`mx-auto rounded-full bg-zinc-400 ${big ? "mt-1 h-4 w-20" : "h-2 w-10"}`}
          />
        </>
      )}
      {id === "editorial" && (
        <>
          <div className={`rounded bg-zinc-300/80 ${big ? "h-16" : "h-6"}`} />
          <div className={`${bar} h-1 w-2/3`} />
          <div className="grid grid-cols-2 gap-1">
            <div className={`${bar} h-1`} />
            <div className={`${bar} h-1`} />
          </div>
          <div className={`rounded bg-zinc-400 ${big ? "h-4 w-16" : "h-2 w-8"}`} />
        </>
      )}
    </div>
  );
}

/** Live, scaled-down render of the current campaign — the real template preview. */
function TemplatePreview({ campaign: c }: { campaign: Campaign }) {
  const w = c.theme.contentWidth;
  const boxW = 248;
  const scale = boxW / w;
  return (
    <div
      className="overflow-hidden rounded-lg ring-1 ring-black/10"
      style={{ width: boxW, height: 172, background: c.theme.pageBg }}
    >
      <div style={{ width: w, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <EmailPreview campaign={c} interactive={false} inlineEdit={false} width={w} />
      </div>
    </div>
  );
}

type Mode = "desktop" | "mobile" | "inbox" | "dark";
const MODES = [
  { id: "desktop" as const, label: "Desktop", Icon: Monitor },
  { id: "mobile" as const, label: "Mobile", Icon: Smartphone },
  { id: "inbox" as const, label: "Inbox", Icon: Mail },
  { id: "dark" as const, label: "Dark", Icon: Moon },
];

/** Section heading inside the scrollable left rail. */
function RailSection({
  index,
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  index: number;
  title: string;
  hint: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-zinc-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="sticky top-0 z-10 flex w-full items-center gap-2.5 border-b border-zinc-100 bg-white/95 px-4 py-2.5 text-left backdrop-blur transition-colors hover:bg-zinc-50"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-zinc-900">{title}</span>
          <span className="block truncate text-[11.5px] text-zinc-400">{hint}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && children}
    </section>
  );
}

export function BuilderShell({
  initial,
  inlineEditDefault = false,
  backLabel = "Home",
  floatingEditor = false,
}: {
  initial: () => Campaign;
  inlineEditDefault?: boolean;
  backLabel?: string;
  floatingEditor?: boolean;
}) {
  // When the Template Studio is opened from the campaign template library we
  // either start a brand-new template (layout first) or edit an existing one.
  const [req] = useState<StudioRequest | null>(() => readStudioRequest());
  const editing = req?.mode === "edit" ? getTemplate(req.templateId ?? null) : undefined;
  const [seedFn] = useState<() => Campaign>(() =>
    editing ? () => JSON.parse(JSON.stringify(editing.campaign)) : initial,
  );
  const { campaign, update, undo, redo, canUndo, canRedo } = useCampaign(seedFn);
  const [needsLayout, setNeedsLayout] = useState(req?.mode === "create");
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<"new" | "update">(editing ? "new" : "new");
  const [saveName, setSaveName] = useState(editing ? `${editing.name} copy` : "Untitled template");
  const [savedTemplate, setSavedTemplate] = useState<string | null>(null);
  const [selected, setSelected] = useState<BlockId | null>(null);
  const [mode, setMode] = useState<Mode>("desktop");
  const [layout, setLayout] = useState<LayoutId>("classic");
  const [layoutPicker, setLayoutPicker] = useState(false);
  const [inlineEdit, setInlineEdit] = useState(inlineEditDefault);
  const [panelOpen, setPanelOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [openRail, setOpenRail] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
  });
  const toggleRail = (i: number) => setOpenRail((s) => ({ ...s, [i]: !s[i] }));

  // Floating cards follow the selected block on the live canvas.
  const anchor = useAnchorRect(selected, floatingEditor, [mode, campaign, railCollapsed, expanded]);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const open = (id: BlockId) => {
    setSelected(id);
    setPanelOpen(false);
  };

  const commitSave = () => {
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (saveMode === "update" && editing) {
      updateTemplate(editing.id, campaign);
      setStudioResult(editing.id);
      setSavedTemplate(editing.name);
    } else {
      const created = createTemplate(
        campaign,
        saveName.trim() || "Untitled template",
        "Created in Template Studio.",
      );
      setStudioResult(created.id);
      setSavedTemplate(created.name);
    }
    setSavedAt(stamp);
    setSaveOpen(false);
  };

  const chromeBtn =
    "grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30";
  const activeLayout = LAYOUTS.find((l) => l.id === layout)!;

  /* Step 0 for a brand-new template: pick the layout first. */
  if (needsLayout) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-900/70 p-4 font-sans text-zinc-900">
        <div className="w-full max-w-3xl border border-zinc-300 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-6 py-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-blue-600">
                Step 1 of 2
              </p>
              <h1 className="mt-1 text-[18px] font-semibold tracking-tight">
                Choose a layout to start from
              </h1>
              <p className="mt-1 text-[12.5px] text-zinc-500">
                This sets the skeleton of your template. You can change everything afterwards.
              </p>
            </div>
            <Link to="/" aria-label="Cancel" className={chromeBtn}>
              <X size={17} />
            </Link>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLayout(l.id)}
                aria-pressed={layout === l.id}
                className={`border p-3 text-left transition-colors ${
                  layout === l.id
                    ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600/20"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <LayoutThumb id={l.id} big />
                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-zinc-900">{l.name}</span>
                  {layout === l.id && <Check size={15} className="text-blue-600" />}
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-zinc-500">{l.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3.5">
            <p className="text-[12px] text-zinc-500">
              Next: design your template, then choose how to save it.
            </p>
            <button
              onClick={() => {
                update((d) => applyLayout(d, layout));
                setNeedsLayout(false);
              }}
              className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start designing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (minimized) {
    return (
      <div className="grid min-h-dvh place-items-end bg-zinc-900/70 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-2xl">
          <Pencil size={15} className="text-zinc-400" />
          <div className="flex flex-col">
            <input
              value={campaign.meta.name}
              aria-label="Campaign name"
              onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
              className="w-56 rounded-md px-1.5 py-0.5 text-[13px] font-semibold text-zinc-900 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
            />
            <span className="px-1.5 text-[11.5px] text-zinc-500">Minimised</span>
          </div>
          <button
            onClick={() => setMinimized(false)}
            aria-label="Resume editor"
            title="Resume"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden bg-zinc-900/70 font-sans text-zinc-900 ${
        expanded ? "p-0" : "p-0 md:p-5"
      }`}
    >
      <div
        role="dialog"
        aria-label="Campaign editor"
        className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100 shadow-2xl ${
          expanded ? "" : "md:rounded-2xl md:border md:border-zinc-300"
        }`}
      >
        {/* Modal chrome */}
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <input
              value={campaign.meta.name}
              aria-label="Campaign name"
              onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
              className="min-w-0 max-w-[22rem] flex-1 truncate rounded-lg px-2 py-1.5 text-[14px] font-semibold outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
            />
            <span className="hidden shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200 sm:flex">
              Draft{savedAt ? ` · saved ${savedAt}` : ""}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setInlineEdit((v) => !v)}
              aria-pressed={inlineEdit}
              title="Type directly on the preview"
              className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors md:flex ${
                inlineEdit ? "bg-blue-50 text-blue-700" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Pencil size={14} /> Inline text
            </button>
            <button
              onClick={() => setSaveOpen(true)}
              className="flex items-center gap-1.5 border border-zinc-200 px-3 py-1.5 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              <Save size={14} />{" "}
              <span className="hidden sm:inline">{req ? "Save & use in campaign" : "Save template"}</span>
            </button>
            <button
              onClick={() => setPanelOpen((v) => !v)}
              aria-label="Toggle campaign panel"
              className={`${chromeBtn} lg:hidden`}
            >
              <SlidersHorizontal size={16} />
            </button>

            <span className="mx-1 h-5 w-px bg-zinc-200" />

            <button
              className={chromeBtn}
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              className={chromeBtn}
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
            <button
              className={chromeBtn}
              onClick={() => setMinimized(true)}
              aria-label="Minimise editor"
              title="Minimise"
            >
              <Minus size={16} />
            </button>
            <button
              className={chromeBtn}
              onClick={() => setExpanded((v) => !v)}
              aria-pressed={expanded}
              aria-label={expanded ? "Exit full view" : "Full view"}
              title={expanded ? "Exit full view" : "Full view"}
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <Link
              to="/"
              className={chromeBtn}
              aria-label={`Close editor and return to ${backLabel}`}
              title="Close"
            >
              <X size={17} />
            </Link>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Collapsed rail strip */}
          {railCollapsed && (
            <div className="hidden w-11 shrink-0 flex-col items-center gap-2 border-r border-zinc-200 bg-white py-3 lg:flex">
              <button
                onClick={() => setRailCollapsed(false)}
                aria-label="Expand sections panel"
                title="Expand panel"
                className={chromeBtn}
              >
                <PanelLeftOpen size={16} />
              </button>
              <span className="mt-1 rotate-180 text-[11px] font-medium tracking-wide text-zinc-400 [writing-mode:vertical-rl]">
                Sections
              </span>
            </div>
          )}

          {/* Left rail */}
          <aside
            className={`${
              panelOpen
                ? "absolute inset-y-0 left-0 z-40 flex w-[86vw] max-w-[22rem] shadow-2xl"
                : "hidden"
            } shrink-0 flex-col border-r border-zinc-200 bg-white lg:relative lg:w-[19rem] lg:shadow-none ${
              railCollapsed ? "lg:hidden" : "lg:flex"
            }`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Sections
              </span>
              <span className="flex items-center gap-1">
                <button
                  onClick={() => setOpenRail({ 1: false, 2: false, 3: false })}
                  className="rounded-md px-2 py-1 text-[11.5px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Collapse all
                </button>
                <button
                  onClick={() => setRailCollapsed(true)}
                  aria-label="Collapse sections panel"
                  title="Collapse panel"
                  className={`${chromeBtn} hidden lg:grid`}
                >
                  <PanelLeftClose size={16} />
                </button>
              </span>
            </div>
            {/* One scrollable rail: template, then sections, then global theme */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <RailSection
                index={1}
                title="Template"
                hint="Template, subject & preheader"
                open={!!openRail[1]}
                onToggle={() => toggleRail(1)}
              >
                <div className="space-y-5 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-center rounded-xl border border-zinc-200 p-3">
                      <TemplatePreview campaign={campaign} />
                    </div>
                    <p className="text-[13px] font-semibold text-zinc-900">{activeLayout.name}</p>
                    <p className="text-[11.5px] leading-snug text-zinc-500">{activeLayout.desc}</p>
                    <button
                      onClick={() => setLayoutPicker(true)}
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                    >
                      Change template <ChevronRight size={14} />
                    </button>
                  </div>

                  <Field
                    label="Email subject"
                    hint={`${stripHtml(campaign.meta.subject).length}/90`}
                  >
                    <TextInput
                      value={campaign.meta.subject}
                      onChange={(v) => update((d) => void (d.meta.subject = v))}
                      placeholder="This is the email subject"
                    />
                  </Field>

                  <Field label="Preheader text">
                    <TextArea
                      rows={3}
                      value={campaign.meta.preheader}
                      onChange={(v) => update((d) => void (d.meta.preheader = v))}
                      placeholder="This text will appear next to your subject line in the inbox."
                    />
                  </Field>
                </div>
              </RailSection>

              <RailSection
                index={2}
                title="Content sections"
                hint="Header, hero, body, footer"
                open={!!openRail[2]}
                onToggle={() => toggleRail(2)}
              >
                <div className="p-3">
                  <p className="px-1.5 pb-2 text-[12px] font-medium text-zinc-500">
                    Click a section to edit it in the side panel.
                  </p>
                  <ul>
                    {ORDER.map((id) => {
                      const visible = (campaign as any)[id].visible as boolean;
                      const active = selected === id;
                      return (
                        <li key={id} className="mb-1 flex items-center gap-1">
                          <button
                            onClick={() => open(id)}
                            aria-current={active}
                            className={`flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[13px] transition-colors ${
                              active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
                            }`}
                          >
                            <Pencil size={13} className={active ? "opacity-80" : "text-zinc-400"} />
                            <span className="flex-1 truncate">{BLOCK_LABELS[id]}</span>
                          </button>
                          <button
                            onClick={() => update((d) => void ((d as any)[id].visible = !visible))}
                            aria-label={`${visible ? "Hide" : "Show"} ${BLOCK_LABELS[id]}`}
                            title={visible ? "Hide section" : "Show section"}
                            className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            {visible ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="border-t border-zinc-100">
                  <SenderForm campaign={campaign} update={update} />
                </div>
              </RailSection>

              <RailSection
                index={3}
                title="Global theme"
                hint="Colours, type & width"
                open={!!openRail[3]}
                onToggle={() => toggleRail(3)}
              >
                <ThemeForm campaign={campaign} update={update} />
              </RailSection>
            </div>
          </aside>

          {/* Preview */}
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-zinc-200/60">
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200/70 bg-white/80 px-4 py-2.5 backdrop-blur">
              <span className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-zinc-600">
                <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                <span className="truncate">Live preview — click any section to edit it</span>
              </span>
              <div
                className="flex shrink-0 gap-1 rounded-lg bg-zinc-100 p-1"
                role="tablist"
                aria-label="Preview mode"
              >
                {MODES.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={mode === id}
                    onClick={() => setMode(id)}
                    title={`${label} preview`}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                      mode === id
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8"
              style={{ background: mode === "dark" ? "#141518" : undefined }}
            >
              {mode === "inbox" ? (
                <InboxPreview campaign={campaign} />
              ) : mode === "mobile" ? (
                <div className="flex justify-center">
                  <PhoneMockup scale={0.82}>
                    <EmailPreview
                      campaign={campaign}
                      selected={selected}
                      onSelect={open}
                      inlineEdit={inlineEdit}
                      update={update}
                      width={373}
                    />
                  </PhoneMockup>
                </div>
              ) : (
                <EmailPreview
                  campaign={campaign}
                  selected={selected}
                  onSelect={open}
                  inlineEdit={inlineEdit}
                  update={update}
                  width={campaign.theme.contentWidth}
                  dark={mode === "dark"}
                />
              )}
            </div>

            {/* Send bar */}
            <div className="shrink-0 border-t border-zinc-200 bg-white px-4 py-3.5 sm:px-6">
              <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                <div className="min-w-0">
                  <label
                    htmlFor="send-to"
                    className="mb-1.5 block text-[12px] font-medium text-zinc-600"
                  >
                    Send to
                  </label>
                  <TextInput
                    value={campaign.meta.testEmail}
                    onChange={(v) => update((d) => void (d.meta.testEmail = v))}
                    placeholder="name@example.com"
                  />
                </div>
                <button
                  onClick={() => notify(`Test email sent to ${campaign.meta.testEmail}`)}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 text-[13px] font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <Mail size={15} /> Send test
                </button>
                <button
                  onClick={() => notify(`Campaign "${stripHtml(campaign.meta.name)}" sent`)}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: campaign.theme.accent }}
                >
                  <Send size={15} /> Send campaign
                </button>
              </div>
              <p className="mx-auto mt-2 max-w-4xl truncate text-[11.5px] text-zinc-400">
                Subject: {renderTokens(stripHtml(campaign.meta.subject))}
              </p>
            </div>
          </main>

          {/* Side-docked section editor (structured builder) */}
          {!floatingEditor && (
            <EditorPanel
              open={!!selected}
              title={selected ? EDIT_TITLES[selected] : ""}
              subtitle="Changes appear in the live preview instantly"
              onClose={() => setSelected(null)}
              footer={
                <button
                  onClick={() => setSelected(null)}
                  className="h-10 w-full rounded-lg bg-zinc-900 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Done
                </button>
              }
            >
              {selected && <BlockForm id={selected} campaign={campaign} update={update} />}
            </EditorPanel>
          )}
        </div>
      </div>

      {/* Floating block editor (live canvas) */}
      {floatingEditor && selected && (
        <FloatingCard
          anchor={anchor}
          title={EDIT_TITLES[selected]}
          subtitle="Edits apply instantly"
          onClose={() => setSelected(null)}
        >
          <BlockForm id={selected} campaign={campaign} update={update} />
        </FloatingCard>
      )}

      {/* Layout picker */}
      {layoutPicker && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-zinc-900/50 p-4"
          onClick={() => setLayoutPicker(false)}
        >
          <div
            role="dialog"
            aria-label="Choose a template"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <p className="text-[14px] font-semibold">Change template</p>
              <button
                onClick={() => setLayoutPicker(false)}
                aria-label="Close template picker"
                className={chromeBtn}
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto p-4">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLayout(l.id);
                    update((d) => applyLayout(d, l.id));
                    setLayoutPicker(false);
                  }}
                  aria-pressed={layout === l.id}
                  className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-colors ${
                    layout === l.id
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <LayoutThumb id={l.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-zinc-900">
                      {l.name}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">
                      {l.desc}
                    </span>
                  </span>
                  {layout === l.id && <Check size={17} className="shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save options */}
      {saveOpen && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-zinc-900/50 p-4">
          <div
            role="dialog"
            aria-label="Save template"
            className="w-full max-w-md border border-zinc-200 bg-white p-6 shadow-2xl"
          >
            <p className="text-[15px] font-semibold tracking-tight">How would you like to save?</p>
            <div className="mt-4 space-y-2.5">
              <label
                className={`block cursor-pointer border p-3.5 transition-colors ${
                  saveMode === "new" ? "border-blue-600 bg-blue-50/60" : "border-zinc-200"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    checked={saveMode === "new"}
                    onChange={() => setSaveMode("new")}
                    className="mt-1 accent-blue-600"
                  />
                  <span>
                    <span className="block text-[13.5px] font-semibold text-zinc-900">
                      Save as new template{" "}
                      <span className="font-medium text-blue-700">(Recommended)</span>
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500">
                      Creates a new template while keeping the original unchanged.
                    </span>
                  </span>
                </span>
                {saveMode === "new" && (
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    aria-label="New template name"
                    placeholder="Template name"
                    className="mt-3 h-9 w-full rounded-lg border border-zinc-300 px-3 text-[13px] leading-[34px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />
                )}
              </label>

              {editing && (
                <label
                  className={`block cursor-pointer border p-3.5 transition-colors ${
                    saveMode === "update" ? "border-blue-600 bg-blue-50/60" : "border-zinc-200"
                  }`}
                >
                  <span className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      checked={saveMode === "update"}
                      onChange={() => setSaveMode("update")}
                      className="mt-1 accent-blue-600"
                    />
                    <span>
                      <span className="block text-[13.5px] font-semibold text-zinc-900">
                        Update {editing.shared ? "shared" : ""} template “{editing.name}”
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500">
                        Updates it for future campaigns. Existing campaigns remain unchanged.
                      </span>
                    </span>
                  </span>
                </label>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setSaveOpen(false)}
                className="h-10 border border-zinc-300 px-5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={commitSave}
                className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                {req ? "Save & use in campaign" : "Save template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved — hand back to the campaign */}
      {savedTemplate && (
        <div className="fixed inset-0 z-[96] grid place-items-center bg-zinc-900/50 p-4">
          <div
            role="dialog"
            aria-label="Template saved"
            className="w-full max-w-sm border border-zinc-200 bg-white p-6 text-center shadow-2xl"
          >
            <span className="mx-auto grid size-11 place-items-center bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
              <Check size={20} />
            </span>
            <p className="mt-3 text-[15px] font-semibold tracking-tight">“{savedTemplate}” saved</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">
              It is ready in your template library and pre-selected for your campaign.
            </p>
            <div className="mt-5 grid gap-2">
              <button
                onClick={() => window.close()}
                className="h-10 bg-blue-600 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Use in campaign
              </button>
              <button
                onClick={() => setSavedTemplate(null)}
                className="h-10 border border-zinc-300 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                Keep editing
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-[12.5px] font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
