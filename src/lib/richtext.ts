import { renderTokens } from "./campaign";

/** True when the string already carries HTML markup. */
export const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s);

/** Legacy **bold** / *italic* source → HTML. Safe for already-HTML input. */
export function toRichHtml(input: string) {
  if (isHtml(input)) return input;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/** HTML ready to display: merge tags resolved to sample values. */
export const renderRich = (input: string) => renderTokens(toRichHtml(input));

/** Plain text version (inbox snippets, alt text, counts). */
export function stripHtml(input: string) {
  return toRichHtml(input)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export const FONT_FAMILIES = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Courier", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

export const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 24, 28, 32];
