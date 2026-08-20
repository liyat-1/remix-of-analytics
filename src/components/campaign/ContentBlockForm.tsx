import type { BlockId } from "../editor/EmailPreview";
import { BlockForm } from "../editor/BlockForms";
import { RichTextEditor } from "../editor/RichTextEditor";
import { Field, SegmentedField, SliderField, TextInput } from "../editor/controls";
import { uid, type Campaign } from "@/lib/campaign";

type Props = {
  campaign: Campaign;
  update: (fn: (d: Campaign) => void) => void;
};

const ALIGN_OPTS = [
  { value: "left" as const, label: "Left" },
  { value: "center" as const, label: "Center" },
  { value: "right" as const, label: "Right" },
];

/** Turn the heading + paragraph list into one HTML document for a single editor. */
function bodyToHtml(c: Campaign) {
  const lines = [c.body.heading, ...c.body.paragraphs.map((p) => p.text)].filter(
    (l) => l != null,
  );
  return lines.map((l) => `<div>${l || "<br>"}</div>`).join("");
}

/** Split the single editor's HTML back into a heading and paragraph blocks. */
function splitBlocks(html: string): string[] {
  if (typeof document === "undefined") return [html];
  const host = document.createElement("div");
  host.innerHTML = html;
  const out: string[] = [];
  let buf = "";
  const flush = () => {
    const t = buf.trim();
    if (t) out.push(t);
    buf = "";
  };
  host.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement;
      if (el.tagName === "DIV" || el.tagName === "P") {
        flush();
        out.push(el.innerHTML.trim());
        return;
      }
      if (el.tagName === "BR") {
        flush();
        return;
      }
      buf += el.outerHTML;
      return;
    }
    buf += n.textContent ?? "";
  });
  flush();
  return out.map((s) => (s === "<br>" ? "" : s));
}

/**
 * Campaign-side content editor. Unlike the template studio, the copy lives in
 * ONE rich text editor: the first line is the heading, everything after it
 * becomes paragraphs. No separate formatter per block.
 */
function UnifiedBodyForm({ campaign: c, update }: Props) {
  return (
    <div className="space-y-3 p-3">
      <RichTextEditor
        label="Email copy"
        minHeight={190}
        value={bodyToHtml(c)}
        onChange={(html) => {
          const parts = splitBlocks(html);
          update((d) => {
            d.body.heading = parts[0] ?? "";
            const rest = parts.slice(1);
            d.body.paragraphs = rest.map((text, i) => ({
              id: d.body.paragraphs[i]?.id ?? uid(),
              text,
            }));
          });
        }}
      />
      <p className="text-[11.5px] leading-relaxed text-zinc-400">
        The first line is the heading — everything below it becomes body copy.
      </p>
      <div className="h-px bg-zinc-100" />
      <SegmentedField
        label="Alignment"
        value={c.body.align}
        options={ALIGN_OPTS}
        onChange={(v) => update((d) => void (d.body.align = v))}
      />
      <SliderField
        label="Heading size"
        value={c.body.headingSize}
        min={14}
        max={48}
        onChange={(v) => update((d) => void (d.body.headingSize = v))}
      />
      <SliderField
        label="Body size"
        value={c.body.textSize}
        min={11}
        max={22}
        onChange={(v) => update((d) => void (d.body.textSize = v))}
      />
    </div>
  );
}

function CampaignCtaForm({ campaign: c, update }: Props) {
  return (
    <div className="space-y-3 p-3">
      <Field label="Button label">
        <TextInput value={c.cta.label} onChange={(v) => update((d) => void (d.cta.label = v))} />
      </Field>
      <Field label="Destination URL">
        <TextInput
          value={c.cta.url}
          onChange={(v) => update((d) => void (d.cta.url = v))}
          placeholder="https://…"
        />
      </Field>
      <SegmentedField
        label="Alignment"
        value={c.cta.align}
        options={ALIGN_OPTS}
        onChange={(v) => update((d) => void (d.cta.align = v))}
      />
    </div>
  );
}

/** Only content blocks are editable in the campaign wizard. */
export function ContentBlockForm({ id, campaign, update }: Props & { id: BlockId }) {
  if (id === "body") return <UnifiedBodyForm campaign={campaign} update={update} />;
  if (id === "cta") return <CampaignCtaForm campaign={campaign} update={update} />;
  return <BlockForm id={id} campaign={campaign} update={update} />;
}
