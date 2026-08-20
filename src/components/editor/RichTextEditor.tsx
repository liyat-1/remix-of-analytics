import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
  Baseline,
  Highlighter,
} from "lucide-react";
import { FONT_FAMILIES, FONT_SIZES, toRichHtml } from "@/lib/richtext";
import { MERGE_TOKENS } from "@/lib/campaign";
import { Select } from "./Select";

const btn =
  "grid size-7 place-items-center rounded-md text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-900";

const TEXT_SWATCHES = [
  "#111827", "#4b5563", "#9ca3af", "#2b44e0", "#0f766e",
  "#b45309", "#be123c", "#7c3aed", "#065f46", "#ffffff",
];
const HIGHLIGHT_SWATCHES = [
  "#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa",
  "#e9d5ff", "#e5e7eb", "#fecaca", "#ccfbf1", "transparent",
];

function exec(cmd: string, value?: string) {
  document.execCommand("styleWithCSS", false, "true");
  document.execCommand(cmd, false, value);
}

/** execCommand fontSize only accepts 1–7, so tag then rewrite to real px. */
function applyFontSize(root: HTMLElement, px: number) {
  // styleWithCSS must be OFF so the browser emits <font size="7"> tags we can rewrite.
  document.execCommand("styleWithCSS", false, "false");
  document.execCommand("fontSize", false, "7");
  root.querySelectorAll("font[size]").forEach((f) => {
    const span = document.createElement("span");
    span.style.fontSize = `${px}px`;
    span.innerHTML = (f as HTMLElement).innerHTML;
    f.replaceWith(span);
  });
  // Catch the CSS-mode fallback (font-size: xxx-large) too.
  root.querySelectorAll<HTMLElement>('span[style*="font-size"]').forEach((s) => {
    if (/large|small|medium/.test(s.style.fontSize)) s.style.fontSize = `${px}px`;
  });
}

function applyFontFamily(root: HTMLElement, family: string) {
  document.execCommand("styleWithCSS", false, "false");
  document.execCommand("fontName", false, family);
  root.querySelectorAll("font[face]").forEach((f) => {
    const span = document.createElement("span");
    span.style.fontFamily = (f as HTMLElement).getAttribute("face") ?? family;
    span.innerHTML = (f as HTMLElement).innerHTML;
    f.replaceWith(span);
  });
}

/**
 * Colour / highlight applied by wrapping the live selection ourselves.
 * execCommand("hiliteColor") is unreliable across browsers (and silently
 * no-ops inside some contentEditable trees), so we do the DOM work directly.
 */
function applyColor(root: HTMLElement, kind: "fore" | "hilite", color: string) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed || !root.contains(range.commonAncestorContainer)) return;

  const prop = kind === "fore" ? "color" : "backgroundColor";
  const frag = range.extractContents();
  // Clear the same property on anything nested so the new value always wins.
  frag.querySelectorAll<HTMLElement>("*").forEach((el) => {
    el.style[prop] = "";
  });

  const span = document.createElement("span");
  if (color !== "transparent" || kind === "fore") span.style[prop] = color;
  span.appendChild(frag);
  range.insertNode(span);

  if (!span.textContent) {
    span.remove();
    return;
  }

  const next = document.createRange();
  next.selectNodeContents(span);
  sel.removeAllRanges();
  sel.addRange(next);
}

export function RichTextEditor({
  value,
  onChange,
  minHeight = 120,
  label,
  ariaLabel,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  label?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [bubble, setBubble] = useState<{ x: number; y: number } | null>(null);
  const [swatch, setSwatch] = useState<"fore" | "hilite" | null>(null);

  // Only seed the DOM when the editor is not the source of the change.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = toRichHtml(value);
    if (document.activeElement !== el && el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  const commit = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  /** Remember where the caret/selection is so toolbar controls that steal
   *  focus (dropdowns, color pickers) can still target the right text. */
  const remember = useCallback(() => {
    const el = ref.current;
    const s = window.getSelection();
    if (!el || !s || s.rangeCount === 0) return;
    const r = s.getRangeAt(0);
    if (el.contains(r.commonAncestorContainer)) savedRange.current = r.cloneRange();
  }, []);

  const restore = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const r = savedRange.current;
    if (!r) return;
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
  }, []);

  const refreshState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    remember();
    setMarks({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
    const s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0 || !el.contains(s.anchorNode)) {
      return setBubble(null);
    }
    const r = s.getRangeAt(0).getBoundingClientRect();
    if (!r.width && !r.height) return setBubble(null);
    setBubble({ x: r.left + r.width / 2, y: r.top });
  }, [remember]);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshState);
    return () => document.removeEventListener("selectionchange", refreshState);
  }, [refreshState]);

  /** Run a formatting command against the remembered selection. */
  const apply = useCallback(
    (fn: (el: HTMLElement) => void) => {
      const el = ref.current;
      if (!el) return;
      restore();
      fn(el);
      commit();
      setMarks({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
      remember();
    },
    [restore, commit, remember],
  );

  const run = (fn: (el: HTMLElement) => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    apply(fn);
  };

  const Toolbar = (compact = false) => (
    <>
      <button type="button" aria-label="Bold" aria-pressed={!!marks.bold}
        className={`${btn} ${marks.bold ? "bg-white text-zinc-900 shadow-sm" : ""}`}
        onMouseDown={run(() => exec("bold"))}><Bold size={14} /></button>
      <button type="button" aria-label="Italic" aria-pressed={!!marks.italic}
        className={`${btn} ${marks.italic ? "bg-white text-zinc-900 shadow-sm" : ""}`}
        onMouseDown={run(() => exec("italic"))}><Italic size={14} /></button>
      <button type="button" aria-label="Underline" aria-pressed={!!marks.underline}
        className={`${btn} ${marks.underline ? "bg-white text-zinc-900 shadow-sm" : ""}`}
        onMouseDown={run(() => exec("underline"))}><Underline size={14} /></button>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button type="button" aria-label="Bulleted list" className={btn}
        onMouseDown={run(() => exec("insertUnorderedList"))}><List size={14} /></button>
      <button type="button" aria-label="Numbered list" className={btn}
        onMouseDown={run(() => exec("insertOrderedList"))}><ListOrdered size={14} /></button>
      <button type="button" aria-label="Insert link" className={btn}
        onMouseDown={run(() => {
          const url = window.prompt("Link URL", "https://");
          if (url) exec("createLink", url);
        })}><Link2 size={14} /></button>
      {!compact && (
        <>
          <span className="mx-1 h-5 w-px bg-zinc-200" />
          <button type="button" aria-label="Align left" className={btn}
            onMouseDown={run(() => exec("justifyLeft"))}><AlignLeft size={14} /></button>
          <button type="button" aria-label="Align center" className={btn}
            onMouseDown={run(() => exec("justifyCenter"))}><AlignCenter size={14} /></button>
          <button type="button" aria-label="Align right" className={btn}
            onMouseDown={run(() => exec("justifyRight"))}><AlignRight size={14} /></button>
        </>
      )}
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button type="button" aria-label="Clear formatting" className={btn}
        onMouseDown={run(() => exec("removeFormat"))}><RemoveFormatting size={14} /></button>
    </>
  );

  const SwatchGrid = ({ kind }: { kind: "fore" | "hilite" }) => (
    <div className="absolute left-0 top-full z-[90] mt-1.5 w-[13.5rem] rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xl shadow-zinc-900/10">
      <p className="mb-2 text-[11px] font-medium text-zinc-500">
        {kind === "fore" ? "Text colour" : "Highlight"}
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {(kind === "fore" ? TEXT_SWATCHES : HIGHLIGHT_SWATCHES).map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            onMouseDown={(e) => {
              e.preventDefault();
              apply((el) => applyColor(el, kind, color));
              setSwatch(null);
            }}
            className="size-7 rounded-md ring-1 ring-inset ring-black/10 transition-transform hover:scale-110"
            style={{
              background:
                color === "transparent"
                  ? "repeating-conic-gradient(#e4e4e7 0% 25%, #fff 0% 50%) 50%/8px 8px"
                  : color,
            }}
          />
        ))}
      </div>
      <label className="mt-2.5 flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[12px] text-zinc-600 hover:border-zinc-900">
        Custom colour
        <input
          type="color"
          className="size-5 cursor-pointer rounded border-0 bg-transparent p-0"
          onChange={(e) =>
            apply((el) => applyColor(el, kind, e.target.value))
          }
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-2">
      {label && (
        <span className="block text-[12px] font-medium text-zinc-600">{label}</span>
      )}
      <div className="overflow-visible rounded-xl border border-zinc-200 bg-white focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10">
        <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-zinc-100 bg-zinc-50/80 px-2 py-1.5">
          {Toolbar()}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 px-2 py-1.5">
          <div className="w-[7.5rem]">
            <Select
              size="sm"
              ariaLabel="Font family"
              value={FONT_FAMILIES[0].value}
              options={FONT_FAMILIES.map((f) => ({ value: f.value, label: f.label }))}
              onChange={(v) => apply((el) => applyFontFamily(el, String(v)))}
              renderValue={() => <span className="text-zinc-600">Font</span>}
            />
          </div>
          <div className="w-[5rem]">
            <Select
              size="sm"
              ariaLabel="Font size"
              value={FONT_SIZES[3]}
              options={FONT_SIZES.map((s) => ({ value: s, label: `${s} px` }))}
              onChange={(v) => apply((el) => applyFontSize(el, Number(v)))}
              renderValue={() => <span className="text-zinc-600">Size</span>}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Text colour"
              aria-expanded={swatch === "fore"}
              onMouseDown={(e) => {
                e.preventDefault();
                setSwatch((s) => (s === "fore" ? null : "fore"));
              }}
              className={`${btn} ${swatch === "fore" ? "bg-white shadow-sm" : ""}`}
            >
              <Baseline size={15} />
            </button>
            {swatch === "fore" && <SwatchGrid kind="fore" />}
          </div>
          <div className="relative">
            <button
              type="button"
              aria-label="Highlight colour"
              aria-expanded={swatch === "hilite"}
              onMouseDown={(e) => {
                e.preventDefault();
                setSwatch((s) => (s === "hilite" ? null : "hilite"));
              }}
              className={`${btn} ${swatch === "hilite" ? "bg-white shadow-sm" : ""}`}
            >
              <Highlighter size={15} />
            </button>
            {swatch === "hilite" && <SwatchGrid kind="hilite" />}
          </div>

          <span className="ml-auto text-[11px] text-zinc-400">Select text, then style it</span>
        </div>

        <div
          ref={ref}
          role="textbox"
          aria-multiline
          aria-label={ariaLabel ?? label ?? "Rich text editor"}
          contentEditable
          suppressContentEditableWarning
          onInput={commit}
          onBlur={commit}
          onKeyUp={refreshState}
          onMouseUp={refreshState}
          style={{ minHeight }}
          className="prose-sm max-w-none px-3.5 py-3 text-[13.5px] leading-relaxed text-zinc-800 outline-none [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        />

        <div className="flex flex-wrap items-center gap-1.5 rounded-b-xl border-t border-zinc-100 bg-zinc-50/80 px-2.5 py-2">
          <span className="mr-1 text-[11px] font-medium text-zinc-400">Merge tags</span>
          {MERGE_TOKENS.map((t) => (
            <button
              key={t}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                apply(() => exec("insertText", t));
              }}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
            >
              {t.replace(/[{}]/g, "").replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {bubble && (
        <div
          role="toolbar"
          aria-label="Selection formatting"
          className="fixed z-[95] flex items-center gap-0.5 rounded-xl border border-zinc-200 bg-white px-1.5 py-1.5 shadow-2xl shadow-zinc-900/20"
          style={{ left: bubble.x, top: bubble.y - 10, transform: "translate(-50%,-100%)" }}
        >
          {Toolbar(true)}
        </div>
      )}
    </div>
  );
}
