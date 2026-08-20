import { useEffect, useMemo, useState } from "react";
import {
  Check,
  X,
  Search,
  Sun,
  Moon,
  Plus,
  Copy,
  Pencil,
  Trash2,
  Users,
  Clock,
  AlertTriangle,
  ExternalLink,
  Layers,
} from "lucide-react";
import { ScaledEmail } from "./ScaledEmail";
import {
  consumeStudioResult,
  deleteTemplate,
  duplicateTemplate,
  listTemplates,
  markTemplateUsed,
  relTime,
  renameTemplate,
  setStudioRequest,
  subscribeTemplates,
  type StoredTemplate,
} from "@/lib/templateStore";
import type { Campaign } from "@/lib/campaign";
import { toDark } from "@/lib/darkPreview";

type FilterId = "all" | "mine" | "shared" | "active" | "recent";
type SortId = "used" | "alpha" | "most" | "created";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mine", label: "My templates" },
  { id: "shared", label: "Shared" },
  { id: "active", label: "Active" },
  { id: "recent", label: "Recently updated" },
];

const SORTS: { id: SortId; label: string }[] = [
  { id: "used", label: "Recently used" },
  { id: "alpha", label: "Alphabetical" },
  { id: "most", label: "Most used" },
  { id: "created", label: "Recently created" },
];

const PAGE = 6;

/**
 * Template management hub. Discovery (search / filter / sort) sits on top, a
 * pinned "Create new template" action never scrolls away, and selecting a card
 * expands its metadata plus the actions you can take on it. Editing always
 * happens in the Template Studio — this modal only selects and manages.
 */
export function TemplatePicker({
  open,
  currentId,
  onClose,
  onApply,
}: {
  open: boolean;
  currentId: string | null;
  onClose: () => void;
  onApply: (id: string, campaign: Campaign) => void;
}) {
  const [, bump] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(currentId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("used");
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  const [visible, setVisible] = useState(PAGE);
  const [confirmEdit, setConfirmEdit] = useState<StoredTemplate | null>(null);
  const [renaming, setRenaming] = useState<StoredTemplate | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<StoredTemplate | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Keep in sync with the Template Studio tab.
  useEffect(() => subscribeTemplates(() => bump((n) => n + 1)), []);

  useEffect(() => {
    if (!open) return;
    const pick = () => {
      const id = consumeStudioResult();
      if (id) {
        setSelectedId(id);
        setFilter("all");
        setQuery("");
        setFlash("Template saved — review it, then hit Use template");
        setTimeout(() => setFlash(null), 4000);
        bump((n) => n + 1);
      }
    };
    pick();
    window.addEventListener("focus", pick);
    const onStorage = () => pick();
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", pick);
      window.removeEventListener("storage", onStorage);
    };
  }, [open]);

  const all = listTemplates();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = all.filter(
      (t) => !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q),
    );
    if (filter === "mine") out = out.filter((t) => !t.shared);
    if (filter === "shared") out = out.filter((t) => t.shared);
    if (filter === "active") out = out.filter((t) => t.active > 0);
    if (filter === "recent") out = out.filter((t) => Date.now() - t.updatedAt < 14 * 86_400_000);
    const sorted = [...out];
    if (sort === "alpha") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "most") sorted.sort((a, b) => b.uses - a.uses);
    else if (sort === "created") sorted.sort((a, b) => b.createdAt - a.createdAt);
    else sorted.sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0));
    return sorted;
  }, [all, query, filter, sort]);

  const active = all.find((t) => t.id === selectedId) ?? null;

  if (!open) return null;

  const openStudio = (req: { mode: "create" | "edit"; templateId?: string }) => {
    setStudioRequest(req);
    window.open("/structured", "_blank", "noopener");
    setFlash(
      req.mode === "create"
        ? "Template Studio opened in a new tab. Save there and it appears here."
        : "Editing in Template Studio. Save there to bring it back here.",
    );
    setTimeout(() => setFlash(null), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-900/60 p-3 backdrop-blur-sm">
      <div
        role="dialog"
        aria-label="Template library"
        className="flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-zinc-200 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold tracking-tight">Email templates</h2>
            <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-zinc-600">
              Pick the design this campaign sends with. Templates control the header, hero and
              footer — you write the message content in the next step.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close template library"
            className="grid size-8 place-items-center text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </header>

        {flash && (
          <p className="shrink-0 border-b border-blue-100 bg-blue-50 px-6 py-2 text-[12.5px] font-medium text-blue-800">
            {flash}
          </p>
        )}

        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_24rem]">
          {/* Left: discovery + gallery */}
          <div className="flex min-h-0 flex-col overflow-hidden">
            {/* Controls */}
            <div className="shrink-0 space-y-3 border-b border-zinc-200 px-6 py-3">
              <div className="flex flex-wrap gap-2">
                <div className="relative min-w-[12rem] flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisible(PAGE);
                    }}
                    placeholder="Search templates…"
                    aria-label="Search templates"
                    className="h-9 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-[13px] leading-[34px] outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  />
                </div>
                <select
                  aria-label="Sort templates"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortId)}
                  className="h-9 border border-zinc-200 bg-white px-2.5 text-[12.5px] text-zinc-700 outline-none transition-colors focus:border-blue-600"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="flex overflow-hidden rounded-lg border border-zinc-200">
                  {[
                    { id: "light" as const, Icon: Sun, label: "Light" },
                    { id: "dark" as const, Icon: Moon, label: "Dark" },
                  ].map(({ id, Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setScheme(id)}
                      aria-pressed={scheme === id}
                      title={`${label} preview`}
                      className={`flex items-center gap-1.5 px-3 text-[12px] font-medium transition-colors ${
                        scheme === id
                          ? "bg-blue-600 text-white"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFilter(f.id);
                      setVisible(PAGE);
                    }}
                    aria-pressed={filter === f.id}
                    className={`rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      filter === f.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinned create action */}
            <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 px-6 py-3">
              <button
                onClick={() => openStudio({ mode: "create" })}
                className="flex w-full items-center gap-3 border border-dashed border-blue-300 bg-white px-4 py-3 text-left transition-colors hover:border-blue-600 hover:bg-blue-50/60"
              >
                <span className="grid size-9 shrink-0 place-items-center bg-blue-600 text-white">
                  <Plus size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold text-zinc-900">
                    Create new template
                  </span>
                  <span className="block text-[12px] text-zinc-500">
                    Start from a layout in Template Studio — it comes straight back here.
                  </span>
                </span>
              </button>
            </div>

            {/* Gallery */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="grid content-start gap-3 sm:grid-cols-2">
                {list.slice(0, visible).map((t) => (
                  <TemplateCard
                    key={t.id}
                    t={t}
                    scheme={scheme}
                    selected={t.id === selectedId}
                    isCurrent={t.id === currentId}
                    onSelect={() => setSelectedId(t.id)}
                  />
                ))}
              </div>
              {list.length === 0 && (
                <p className="py-10 text-center text-[13px] text-zinc-500">
                  No templates match your search.
                </p>
              )}
              {visible < list.length && (
                <button
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="mt-4 h-10 w-full rounded-lg border border-zinc-200 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900"
                >
                  Load more ({list.length - visible} left)
                </button>
              )}
            </div>
          </div>

          {/* Right: details + live preview */}
          <aside className="hidden min-h-0 flex-col border-l border-zinc-200 md:flex">
            {active ? (
              <>
                <div className="shrink-0 space-y-3 border-b border-zinc-200 px-5 py-4">
                  <div>
                    <p className="text-[15px] font-semibold tracking-tight">{active.name}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-zinc-500">{active.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={active.shared ? "blue" : "zinc"}>
                      {active.shared ? "Shared" : "Personal"}
                    </Badge>
                    {active.id === currentId && <Badge tone="emerald">Active on campaign</Badge>}
                    <Badge tone="zinc">v{active.version}</Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                    <Meta label="Used by" value={`${active.campaigns} campaigns`} />
                    <Meta label="Active in" value={`${active.active} campaigns`} />
                    <Meta label="Owner" value={active.owner} />
                    <Meta label="Created by" value={active.createdBy} />
                    <Meta label="Last updated" value={relTime(active.updatedAt)} />
                    <Meta label="Last used" value={relTime(active.lastUsed)} />
                  </dl>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        markTemplateUsed(active.id);
                        onApply(active.id, JSON.parse(JSON.stringify(active.campaign)));
                      }}
                      className="h-10 w-full rounded-lg bg-blue-600 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Use template
                    </button>
                    <button
                      onClick={() =>
                        active.shared
                          ? setConfirmEdit(active)
                          : openStudio({ mode: "edit", templateId: active.id })
                      }
                      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-300 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
                    >
                      Edit in Template Studio <ExternalLink size={13} />
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <MiniAction
                        Icon={Copy}
                        label="Duplicate"
                        onClick={() => {
                          const copy = duplicateTemplate(active.id);
                          if (copy) setSelectedId(copy.id);
                        }}
                      />
                      <MiniAction
                        Icon={Pencil}
                        label="Rename"
                        onClick={() => {
                          setRenaming(active);
                          setRenameValue(active.name);
                        }}
                      />
                      <MiniAction
                        Icon={Trash2}
                        label="Delete"
                        danger
                        onClick={() => setConfirmDelete(active)}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 p-4"
                  style={{ background: scheme === "dark" ? "#141518" : undefined }}
                >
                  <ScaledEmail
                    campaign={scheme === "dark" ? toDark(active.campaign) : active.campaign}
                    width={300}
                    height={760}
                  />
                </div>
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid size-11 place-items-center bg-zinc-100 text-zinc-400">
                    <Layers size={19} />
                  </span>
                  <p className="mt-3 text-[13.5px] font-semibold text-zinc-900">
                    Select a template
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">
                    Its details and a live preview appear here before you commit.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-3">
          <p className="truncate text-[12px] text-zinc-500">
            {active ? `Selected: ${active.name}` : "Nothing selected yet"}
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="h-10 rounded-lg border border-zinc-300 px-5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-white"
            >
              Cancel
            </button>
            <button
              disabled={!active}
              onClick={() => {
                if (!active) return;
                markTemplateUsed(active.id);
                onApply(active.id, JSON.parse(JSON.stringify(active.campaign)));
              }}
              className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Use template
            </button>
          </div>
        </footer>
      </div>

      {/* Shared-template edit warning */}
      {confirmEdit && (
        <Sheet
          title="This template is shared"
          onClose={() => setConfirmEdit(null)}
          icon={<AlertTriangle size={18} className="text-amber-600" />}
        >
          <p className="text-[13px] leading-relaxed text-zinc-600">
            <strong className="font-semibold text-zinc-900">{confirmEdit.name}</strong> is currently
            used by
          </p>
          <ul className="mt-3 space-y-1.5 text-[13px] text-zinc-700">
            <li className="flex items-center gap-2">
              <Users size={15} className="text-zinc-400" /> {confirmEdit.campaigns} campaigns
            </li>
            <li className="flex items-center gap-2">
              <Clock size={15} className="text-zinc-400" /> {confirmEdit.active} active campaigns
            </li>
          </ul>
          <p className="mt-3 text-[12.5px] leading-relaxed text-zinc-500">
            Editing it may affect future campaigns. In the Studio you can still save your changes as
            a brand-new template instead.
          </p>
          <div className="mt-5 flex justify-end gap-2.5">
            <button
              onClick={() => setConfirmEdit(null)}
              className="h-10 rounded-lg border border-zinc-300 px-5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                openStudio({ mode: "edit", templateId: confirmEdit.id });
                setConfirmEdit(null);
              }}
              className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </Sheet>
      )}

      {renaming && (
        <Sheet title="Rename template" onClose={() => setRenaming(null)}>
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            aria-label="Template name"
            className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-[13.5px] leading-[38px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
          />
          <div className="mt-5 flex justify-end gap-2.5">
            <button
              onClick={() => setRenaming(null)}
              className="h-10 rounded-lg border border-zinc-300 px-5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (renameValue.trim()) renameTemplate(renaming.id, renameValue.trim());
                setRenaming(null);
              }}
              className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Save name
            </button>
          </div>
        </Sheet>
      )}

      {confirmDelete && (
        <Sheet
          title="Delete this template?"
          onClose={() => setConfirmDelete(null)}
          icon={<AlertTriangle size={18} className="text-red-600" />}
        >
          <p className="text-[13px] leading-relaxed text-zinc-600">
            <strong className="font-semibold text-zinc-900">{confirmDelete.name}</strong> will be
            removed from the library. Campaigns already sent are unaffected.
          </p>
          <div className="mt-5 flex justify-end gap-2.5">
            <button
              onClick={() => setConfirmDelete(null)}
              className="h-10 rounded-lg border border-zinc-300 px-5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              Keep it
            </button>
            <button
              onClick={() => {
                deleteTemplate(confirmDelete.id);
                if (selectedId === confirmDelete.id) setSelectedId(null);
                setConfirmDelete(null);
              }}
              className="h-10 bg-red-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-red-700"
            >
              Delete template
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ------------------------------- pieces ------------------------------- */

function TemplateCard({
  t,
  scheme,
  selected,
  isCurrent,
  onSelect,
}: {
  t: StoredTemplate;
  scheme: "light" | "dark";
  selected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex h-full flex-col overflow-hidden rounded-xl border text-left transition-colors ${
        selected
          ? "border-blue-600 ring-1 ring-blue-600/25"
          : "border-zinc-200 hover:border-zinc-400"
      }`}
    >
      <div
        className="relative flex h-[164px] shrink-0 items-center justify-center p-3"
        style={{ background: scheme === "dark" ? "#141518" : "#f4f4f5" }}
      >
        <ScaledEmail
          campaign={scheme === "dark" ? toDark(t.campaign) : t.campaign}
          width={220}
          height={140}
        />
        {selected && (
          <span className="absolute right-2 top-2 grid size-6 place-items-center bg-blue-600 text-white">
            <Check size={13} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-zinc-100 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[13px] font-semibold text-zinc-900">{t.name}</p>
          <Badge tone={t.shared ? "blue" : "zinc"}>{t.shared ? "Shared" : "Personal"}</Badge>
        </div>
        <p className="line-clamp-2 text-[11.5px] leading-snug text-zinc-500">{t.desc}</p>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-500">
          <span>Used in {t.campaigns} campaigns</span>
          <span className="text-zinc-300">·</span>
          <span>Updated {relTime(t.updatedAt).toLowerCase()}</span>
          <span className="text-zinc-300">·</span>
          <span>{t.owner}</span>
        </div>
        {isCurrent && <Badge tone="emerald">Active on this campaign</Badge>}
      </div>
    </button>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "blue" | "zinc" | "emerald";
}) {
  const cls =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-zinc-100 text-zinc-600 ring-zinc-200";
  return (
    <span
      className={`inline-flex shrink-0 items-center px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ring-1 ring-inset ${cls}`}
    >
      {children}
    </span>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </dt>
      <dd className="truncate text-[12.5px] text-zinc-800">{value}</dd>
    </div>
  );
}

function MiniAction({
  Icon,
  label,
  onClick,
  danger,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
        danger
          ? "border-zinc-200 text-red-600 hover:border-red-300 hover:bg-red-50"
          : "border-zinc-200 text-zinc-700 hover:border-zinc-900"
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

function Sheet({
  title,
  icon,
  onClose,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-zinc-900/50 p-4">
      <div
        role="dialog"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            {icon}
            {title}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-7 place-items-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
