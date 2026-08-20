import { useEffect, useRef } from "react";

/** Colour recipe per token. Same palette used for the chip buttons above. */
export type TagDef = {
  token: string; // e.g. "{{first_name}}"
  label: string; // e.g. "firstName"
  tone: string; // background + text tailwind classes
};

/**
 * A contentEditable textarea that renders each `{{token}}` as a coloured,
 * non-editable chip inline with the typed text. The parent still owns a plain
 * string `value` with `{{token}}` placeholders; the component serialises the
 * DOM back to that shape after every input.
 */
export function TagTextArea({
  value,
  onChange,
  tags,
  placeholder,
  minHeight = 120,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  tags: TagDef[];
  placeholder?: string;
  minHeight?: number;
  inputRef?: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const skipSync = useRef(false);

  /* Render `value` as HTML with chips. Only runs when the external value
   * actually differs from what's already in the DOM, so typing doesn't nuke
   * the caret. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    const current = serialize(el);
    if (current === value) return;
    el.innerHTML = renderHtml(value, tags);
  }, [value, tags]);

  const insertAtCaret = (token: string) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const tag = tags.find((t) => t.token === token);
    if (!tag) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      // Append at the end
      el.innerHTML += chipHtml(tag);
      pushChange();
      return;
    }
    const range = sel.getRangeAt(0);
    // Guard: caret must be inside our editor
    if (!el.contains(range.startContainer)) {
      el.innerHTML += chipHtml(tag);
      pushChange();
      return;
    }
    const template = document.createElement("template");
    template.innerHTML = chipHtml(tag) + "\u00a0";
    const frag = template.content;
    const lastNode = frag.lastChild;
    range.deleteContents();
    range.insertNode(frag);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    pushChange();
  };

  const pushChange = () => {
    const el = ref.current;
    if (!el) return;
    skipSync.current = true;
    onChange(serialize(el));
  };

  // Expose the underlying element via inputRef for the "insert at caret" api.
  useEffect(() => {
    if (!inputRef) return;
    inputRef.current = ref.current;
    // Attach the insertAtCaret method on the DOM node so parents can call it.
    if (ref.current) (ref.current as any).__insertToken = insertAtCaret;
  });

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      aria-label={placeholder}
      contentEditable
      suppressContentEditableWarning
      onInput={pushChange}
      onKeyDown={(e) => {
        // Prevent formatting shortcuts producing weird nested markup.
        if ((e.metaKey || e.ctrlKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      className="w-full whitespace-pre-wrap break-words rounded-lg border border-zinc-200 bg-white px-3.5 py-3 text-[13.5px] leading-[1.55] text-zinc-900 outline-none transition-colors hover:border-zinc-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
      style={{ minHeight }}
      data-placeholder={placeholder}
    />
  );
}

/* ------------------------------ helpers ------------------------------ */

function escapeAttr(s: string) {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeText(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TAG_TONES: Record<string, string> = {
  amber: "background:#fef3c7;color:#b45309;",
  indigo: "background:#e0e7ff;color:#4338ca;",
  sky: "background:#e0f2fe;color:#075985;",
  emerald: "background:#d1fae5;color:#047857;",
  violet: "background:#ede9fe;color:#6d28d9;",
};

function chipHtml(tag: TagDef) {
  const tone = TAG_TONES[tag.tone] ?? TAG_TONES.amber;
  return `<span contenteditable="false" data-token="${escapeAttr(tag.token)}" style="${tone}display:inline-block;padding:1px 8px;margin:0 1px;border-radius:3px;font-weight:600;font-size:12.5px;vertical-align:baseline;">${escapeText(tag.label)}</span>`;
}

function renderHtml(text: string, tags: TagDef[]) {
  if (!text) return "";
  let html = escapeText(text);
  for (const t of tags) {
    const re = new RegExp(t.token.replace(/[{}]/g, "\\$&"), "g");
    html = html.replace(re, chipHtml(t));
  }
  return html.replace(/\n/g, "<br>");
}

function serialize(root: HTMLElement): string {
  let out = "";
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += (node.textContent ?? "").replace(/\u00a0/g, " ");
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    if (el.dataset.token) {
      out += el.dataset.token;
      return;
    }
    if (el.tagName === "BR") {
      out += "\n";
      return;
    }
    if (el.tagName === "DIV" || el.tagName === "P") {
      if (out.length > 0 && !out.endsWith("\n")) out += "\n";
      node.childNodes.forEach(walk);
      return;
    }
    node.childNodes.forEach(walk);
  };
  root.childNodes.forEach(walk);
  return out;
}
