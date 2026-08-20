import type { BlockId } from "./EmailPreview";
import { uid, type Campaign } from "@/lib/campaign";
import { RichTextEditor } from "./RichTextEditor";
import { Select } from "./Select";
import {
  ColorField,
  Field,
  Group,
  ImageField,
  SegmentedField,
  SliderField,
  TextArea,
  TextInput,
  ToggleRow,
  inputCls,
} from "./controls";

type Props = {
  campaign: Campaign;
  update: (fn: (d: Campaign) => void) => void;
};

const ALIGN_OPTS = [
  { value: "left" as const, label: "Left" },
  { value: "center" as const, label: "Center" },
  { value: "right" as const, label: "Right" },
];

export const BLOCK_LABELS: Record<BlockId, string> = {
  header: "Header · Logo",
  hero: "Hero · Image",
  body: "Content · Text",
  cta: "Button · CTA",
  details: "Detail grid",
  footer: "Footer · Social",
};

export function BlockForm({ id, campaign, update }: Props & { id: BlockId }) {
  if (id === "header") return <HeaderForm campaign={campaign} update={update} />;
  if (id === "hero") return <HeroForm campaign={campaign} update={update} />;
  if (id === "body") return <BodyForm campaign={campaign} update={update} />;
  if (id === "cta") return <CtaForm campaign={campaign} update={update} />;
  if (id === "details") return <DetailsForm campaign={campaign} update={update} />;
  return <FooterForm campaign={campaign} update={update} />;
}

function VisibilityRow({
  visible,
  onChange,
}: {
  visible: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="border-b border-zinc-100 px-4 py-2.5">
      <ToggleRow
        label="Show this block"
        hint="Hidden blocks are excluded from the send"
        checked={visible}
        onChange={onChange}
      />
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function HeaderForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow
        visible={c.header.visible}
        onChange={(v) => update((d) => void (d.header.visible = v))}
      />
      <Group title="Logo · light mode">
        <ImageField
          value={c.header.logoUrl ?? ""}
          alt={c.header.logoText}
          onChange={(v) => update((d) => void (d.header.logoUrl = v || null))}
          onAltChange={(v) => update((d) => void (d.header.logoText = v))}
        />
      </Group>
      <Group title="Logo · dark mode">
        <p className="-mt-1 text-[11.5px] leading-relaxed text-zinc-500">
          Optional. Upload a light version of your logo for guests reading in dark mode. Leave empty
          to reuse the light-mode logo.
        </p>
        <ImageField
          value={c.header.logoUrlDark ?? ""}
          alt={c.header.logoText}
          onChange={(v) => update((d) => void (d.header.logoUrlDark = v || null))}
          onAltChange={(v) => update((d) => void (d.header.logoText = v))}
        />
      </Group>
      <Group title="Wordmark">
        <Field label="Fallback wordmark" hint="Used when no logo image">
          <TextInput
            value={c.header.logoText}
            onChange={(v) => update((d) => void (d.header.logoText = v))}
          />
        </Field>
      </Group>
      <Group title="Style">
        <ColorField
          label="Background"
          value={c.header.bg}
          onChange={(v) => update((d) => void (d.header.bg = v))}
        />
        <SliderField
          label="Padding"
          value={c.header.padding}
          min={0}
          max={64}
          onChange={(v) => update((d) => void (d.header.padding = v))}
        />
        <SegmentedField
          label="Alignment"
          value={c.header.align}
          options={ALIGN_OPTS}
          onChange={(v) => update((d) => void (d.header.align = v))}
        />
      </Group>
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function HeroForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow
        visible={c.hero.visible}
        onChange={(v) => update((d) => void (d.hero.visible = v))}
      />
      <Group title="Image">
        <ImageField
          value={c.hero.imageUrl}
          alt={c.hero.alt}
          onChange={(v) => update((d) => void (d.hero.imageUrl = v))}
          onAltChange={(v) => update((d) => void (d.hero.alt = v))}
        />
      </Group>
      <Group title="Style">
        <SliderField
          label="Height"
          value={c.hero.height}
          min={80}
          max={480}
          onChange={(v) => update((d) => void (d.hero.height = v))}
        />
        <SliderField
          label="Corner radius"
          value={c.hero.radius}
          min={0}
          max={40}
          onChange={(v) => update((d) => void (d.hero.radius = v))}
        />
        <ColorField
          label="Overlay color"
          value={c.hero.overlayColor}
          onChange={(v) => update((d) => void (d.hero.overlayColor = v))}
        />
        <SliderField
          label="Overlay opacity"
          unit="%"
          value={c.hero.overlay}
          min={0}
          max={90}
          onChange={(v) => update((d) => void (d.hero.overlay = v))}
        />
      </Group>
    </>
  );
}

/* ---------------------------------- Body ---------------------------------- */

function BodyForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow
        visible={c.body.visible}
        onChange={(v) => update((d) => void (d.body.visible = v))}
      />
      <Group title="Heading">
        <RichTextEditor
          label="Heading text"
          minHeight={54}
          value={c.body.heading}
          onChange={(v) => update((d) => void (d.body.heading = v))}
        />
        <SliderField
          label="Size"
          value={c.body.headingSize}
          min={14}
          max={48}
          onChange={(v) => update((d) => void (d.body.headingSize = v))}
        />
        <ColorField
          label="Color"
          value={c.body.headingColor}
          onChange={(v) => update((d) => void (d.body.headingColor = v))}
        />
      </Group>

      <Group
        title="Paragraphs"
        action={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              update((d) => d.body.paragraphs.push({ id: uid(), text: "New paragraph" }));
            }}
            className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
          >
            + Add
          </span>
        }
      >
        {c.body.paragraphs.map((p, i) => (
          <div key={p.id} className="rounded-lg border border-zinc-200 p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Block {i + 1}
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() =>
                    update((d) => {
                      const a = d.body.paragraphs;
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                    })
                  }
                  className="rounded px-1 text-[11px] text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={i === c.body.paragraphs.length - 1}
                  onClick={() =>
                    update((d) => {
                      const a = d.body.paragraphs;
                      [a[i + 1], a[i]] = [a[i], a[i + 1]];
                    })
                  }
                  className="rounded px-1 text-[11px] text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Delete paragraph"
                  onClick={() =>
                    update((d) => {
                      d.body.paragraphs = d.body.paragraphs.filter((x) => x.id !== p.id);
                    })
                  }
                  className="rounded px-1 text-[11px] text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            </div>
            <RichTextEditor
              ariaLabel={`Paragraph ${i + 1}`}
              value={p.text}
              minHeight={80}
              onChange={(v) =>
                update((d) => {
                  const t = d.body.paragraphs.find((x) => x.id === p.id);
                  if (t) t.text = v;
                })
              }
            />
          </div>
        ))}
      </Group>

      <Group title="Body style">
        <SliderField
          label="Text size"
          value={c.body.textSize}
          min={11}
          max={22}
          onChange={(v) => update((d) => void (d.body.textSize = v))}
        />
        <ColorField
          label="Text color"
          value={c.body.textColor}
          onChange={(v) => update((d) => void (d.body.textColor = v))}
        />
        <SegmentedField
          label="Alignment"
          value={c.body.align}
          options={ALIGN_OPTS}
          onChange={(v) => update((d) => void (d.body.align = v))}
        />
      </Group>
    </>
  );
}

/* ----------------------------------- CTA ---------------------------------- */

function CtaForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow
        visible={c.cta.visible}
        onChange={(v) => update((d) => void (d.cta.visible = v))}
      />
      <Group title="Button">
        <Field label="Label">
          <TextInput value={c.cta.label} onChange={(v) => update((d) => void (d.cta.label = v))} />
        </Field>
        <Field label="Destination URL">
          <TextInput
            value={c.cta.url}
            onChange={(v) => update((d) => void (d.cta.url = v))}
            placeholder="https://…"
          />
        </Field>
      </Group>
      <Group title="Appearance">
        <div className="grid grid-cols-2 gap-2">
          <ColorField
            label="Background"
            value={c.cta.bg}
            onChange={(v) => update((d) => void (d.cta.bg = v))}
          />
          <ColorField
            label="Text"
            value={c.cta.color}
            onChange={(v) => update((d) => void (d.cta.color = v))}
          />
        </div>
        <SliderField
          label="Corner radius"
          value={c.cta.radius}
          min={0}
          max={32}
          onChange={(v) => update((d) => void (d.cta.radius = v))}
        />
        <div className="grid grid-cols-2 gap-2">
          <SliderField
            label="Pad Y"
            value={c.cta.padY}
            min={6}
            max={28}
            onChange={(v) => update((d) => void (d.cta.padY = v))}
          />
          <SliderField
            label="Pad X"
            value={c.cta.padX}
            min={8}
            max={60}
            onChange={(v) => update((d) => void (d.cta.padX = v))}
          />
        </div>
        <SegmentedField
          label="Alignment"
          value={c.cta.align}
          options={ALIGN_OPTS}
          onChange={(v) => update((d) => void (d.cta.align = v))}
        />
        <ToggleRow
          label="Full width"
          checked={c.cta.fullWidth}
          onChange={(v) => update((d) => void (d.cta.fullWidth = v))}
        />
      </Group>
      <Group title="Tracking">
        <ToggleRow
          label="Open in new tab"
          checked={c.cta.newTab}
          onChange={(v) => update((d) => void (d.cta.newTab = v))}
        />
        <ToggleRow
          label="Append UTM parameters"
          checked={c.cta.utm}
          onChange={(v) => update((d) => void (d.cta.utm = v))}
        />
      </Group>
    </>
  );
}

/* --------------------------------- Details -------------------------------- */

function DetailsForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow
        visible={c.details.visible}
        onChange={(v) => update((d) => void (d.details.visible = v))}
      />
      <Group title="Layout">
        <SegmentedField
          label="Columns"
          value={c.details.columns}
          options={[
            { value: 1 as const, label: "1" },
            { value: 2 as const, label: "2" },
            { value: 3 as const, label: "3" },
          ]}
          onChange={(v) => update((d) => void (d.details.columns = v))}
        />
        <SliderField
          label="Gap"
          value={c.details.gap}
          min={4}
          max={48}
          onChange={(v) => update((d) => void (d.details.gap = v))}
        />
      </Group>
      <Group
        title="Items"
        action={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              update((d) => d.details.items.push({ id: uid(), label: "Label", value: "Value" }));
            }}
            className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
          >
            + Add
          </span>
        }
      >
        {c.details.items.map((it) => (
          <div key={it.id} className="space-y-1.5 rounded-lg border border-zinc-200 p-2">
            <div className="flex gap-1.5">
              <input
                value={it.label}
                aria-label="Item label"
                onChange={(e) =>
                  update((d) => {
                    const t = d.details.items.find((x) => x.id === it.id);
                    if (t) t.label = e.target.value;
                  })
                }
                className={inputCls}
              />
              <button
                type="button"
                aria-label="Delete item"
                onClick={() =>
                  update((d) => {
                    d.details.items = d.details.items.filter((x) => x.id !== it.id);
                  })
                }
                className="shrink-0 rounded-lg border border-zinc-200 px-2 text-[12px] text-zinc-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
            <input
              value={it.value}
              aria-label="Item value"
              onChange={(e) =>
                update((d) => {
                  const t = d.details.items.find((x) => x.id === it.id);
                  if (t) t.value = e.target.value;
                })
              }
              className={inputCls}
            />
          </div>
        ))}
      </Group>
    </>
  );
}

/* --------------------------------- Footer --------------------------------- */

const SOCIAL_LABELS: Record<string, string> = {
  x: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

const SOCIAL_PATHS: Record<string, string> = {
  x: "M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.3 22H3.2l7.3-8.3L2.8 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L8.3 3.8H6.5L17.8 20Z",
  facebook:
    "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z",
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.9-10.4a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0Z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.5 4.7 5.8V21h-4v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21h-4V9Z",
  youtube:
    "M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5a2.5 2.5 0 0 0-1.8 1.8C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 1.5.5 8.8.5 8.8.5s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12ZM9.8 15.3V8.7l6 3.3-6 3.3Z",
};

function SocialIcon({ skey, color }: { skey: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" style={{ fill: color }} aria-hidden>
      <path d={SOCIAL_PATHS[skey]} />
    </svg>
  );
}

function FooterForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow
        visible={c.footer.visible}
        onChange={(v) => update((d) => void (d.footer.visible = v))}
      />
      <Group title="Business details">
        <Field label="Company">
          <TextInput
            value={c.footer.company}
            onChange={(v) => update((d) => void (d.footer.company = v))}
          />
        </Field>
        <Field label="Address" hint="Required for CAN-SPAM">
          <TextArea
            rows={2}
            value={c.footer.address}
            onChange={(v) => update((d) => void (d.footer.address = v))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <ColorField
            label="Background"
            value={c.footer.bg}
            onChange={(v) => update((d) => void (d.footer.bg = v))}
          />
          <ColorField
            label="Text"
            value={c.footer.text}
            onChange={(v) => update((d) => void (d.footer.text = v))}
          />
        </div>
      </Group>
      <Group title="Social links">
        <div className="grid grid-cols-3 gap-2">
          <ColorField
            label="Icon bg"
            value={c.footer.socialBg}
            onChange={(v) => update((d) => void (d.footer.socialBg = v))}
          />
          <ColorField
            label="Icon"
            value={c.footer.socialColor}
            onChange={(v) => update((d) => void (d.footer.socialColor = v))}
          />
          <SliderField
            label="Radius"
            value={c.footer.socialRadius}
            min={0}
            max={20}
            onChange={(v) => update((d) => void (d.footer.socialRadius = v))}
          />
        </div>
        {/* Live preview of the social icon styling */}
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          {c.footer.socials
            .filter((s) => s.enabled)
            .slice(0, 5)
            .map((s) => (
              <span
                key={s.key}
                className="grid size-7 place-items-center"
                style={{ background: c.footer.socialBg, borderRadius: c.footer.socialRadius }}
              >
                <SocialIcon skey={s.key} color={c.footer.socialColor} />
              </span>
            ))}
          <span className="ml-auto text-[11px] text-zinc-400">Preview</span>
        </div>
        {c.footer.socials.map((s) => (
          <div key={s.key} className="space-y-1.5 rounded-lg border border-zinc-200 p-2">
            <ToggleRow
              label={SOCIAL_LABELS[s.key]}
              checked={s.enabled}
              onChange={(v) =>
                update((d) => {
                  const t = d.footer.socials.find((x) => x.key === s.key);
                  if (t) t.enabled = v;
                })
              }
            />
            {s.enabled && (
              <input
                value={s.url}
                aria-label={`${SOCIAL_LABELS[s.key]} URL`}
                onChange={(e) =>
                  update((d) => {
                    const t = d.footer.socials.find((x) => x.key === s.key);
                    if (t) t.url = e.target.value;
                  })
                }
                className={inputCls}
              />
            )}
          </div>
        ))}
      </Group>
      <Group
        title="Legal links"
        action={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              update((d) => d.footer.links.push({ id: uid(), label: "New link", url: "#" }));
            }}
            className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
          >
            + Add
          </span>
        }
      >
        {c.footer.links.map((l) => (
          <div key={l.id} className="flex gap-1.5">
            <input
              value={l.label}
              aria-label="Link label"
              onChange={(e) =>
                update((d) => {
                  const t = d.footer.links.find((x) => x.id === l.id);
                  if (t) t.label = e.target.value;
                })
              }
              className={inputCls}
            />
            <input
              value={l.url}
              aria-label="Link URL"
              onChange={(e) =>
                update((d) => {
                  const t = d.footer.links.find((x) => x.id === l.id);
                  if (t) t.url = e.target.value;
                })
              }
              className={inputCls}
            />
            <button
              type="button"
              aria-label="Delete link"
              onClick={() =>
                update((d) => {
                  d.footer.links = d.footer.links.filter((x) => x.id !== l.id);
                })
              }
              className="shrink-0 rounded-lg border border-zinc-200 px-2 text-[12px] text-zinc-400 hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </Group>
    </>
  );
}

/* ------------------------------ Campaign meta ----------------------------- */

export function SenderForm({ campaign: c, update }: Props) {
  return (
    <Group title="Sender">
      <Field label="Campaign name">
        <TextInput value={c.meta.name} onChange={(v) => update((d) => void (d.meta.name = v))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From name">
          <TextInput
            value={c.meta.fromName}
            onChange={(v) => update((d) => void (d.meta.fromName = v))}
          />
        </Field>
        <Field label="From email">
          <TextInput
            value={c.meta.fromEmail}
            onChange={(v) => update((d) => void (d.meta.fromEmail = v))}
          />
        </Field>
      </div>
    </Group>
  );
}

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter", hint: "Modern neutral sans" },
  { value: "Georgia, serif", label: "Georgia", hint: "Warm editorial serif" },
  { value: "Helvetica, Arial, sans-serif", label: "Helvetica", hint: "Classic email-safe sans" },
  { value: "ui-monospace, monospace", label: "Monospace", hint: "Technical, fixed width" },
];

export function ThemeForm({ campaign: c, update }: Props) {
  return (
    <>
      <Group title="Colours">
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Accent"
            value={c.theme.accent}
            onChange={(v) => update((d) => void (d.theme.accent = v))}
          />
          <ColorField
            label="Email background"
            value={c.theme.cardBg}
            onChange={(v) => update((d) => void (d.theme.cardBg = v))}
          />
        </div>
        <ColorField
          label="Canvas background"
          value={c.theme.pageBg}
          onChange={(v) => update((d) => void (d.theme.pageBg = v))}
        />
        <Field label="Apply accent to">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update((d) => void (d.cta.bg = d.theme.accent))}
              className="h-9 flex-1 rounded-lg border border-zinc-200 text-[12px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
            >
              Button
            </button>
            <button
              type="button"
              onClick={() => update((d) => void (d.header.bg = d.theme.accent))}
              className="h-9 flex-1 rounded-lg border border-zinc-200 text-[12px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
            >
              Header
            </button>
          </div>
        </Field>
      </Group>

      <Group title="Typography & width">
        <Field label="Font family">
          <Select
            ariaLabel="Font family"
            value={c.theme.bodyFont}
            options={FONT_OPTIONS}
            onChange={(v) =>
              update((d) => {
                d.theme.bodyFont = String(v);
                d.theme.headingFont = String(v);
              })
            }
          />
        </Field>
        <SliderField
          label="Content width"
          value={c.theme.contentWidth}
          min={420}
          max={760}
          step={10}
          onChange={(v) => update((d) => void (d.theme.contentWidth = v))}
        />
      </Group>
    </>
  );
}
