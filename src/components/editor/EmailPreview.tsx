import { renderTokens, type Campaign, type SocialKey } from "@/lib/campaign";
import { renderRich, toRichHtml } from "@/lib/richtext";

export type BlockId = "header" | "hero" | "body" | "cta" | "details" | "footer";

const SOCIAL_PATHS: Record<SocialKey, string> = {
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

/** Readable ink color for a given background. */
function onColor(bg: string) {
  const hex = bg.replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((h) => h + h)
          .join("")
      : hex;
  const n = parseInt(full || "ffffff", 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#18181b" : "#ffffff";
}

function Block({
  id,
  selected,
  onSelect,
  label,
  interactive,
  children,
  accent,
  locked = false,
}: {
  id: BlockId;
  selected: BlockId | null;
  onSelect?: (id: BlockId) => void;
  label: string;
  interactive?: boolean;
  children: React.ReactNode;
  accent: string;
  locked?: boolean;
}) {
  const active = selected === id;
  if (!interactive) return <div>{children}</div>;

  if (locked) {
    return (
      <div data-block={id} aria-disabled className="group relative cursor-not-allowed select-none">
        <div className="opacity-45 grayscale">{children}</div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-zinc-500/5"
          style={{ boxShadow: "inset 0 0 0 1px rgba(113,113,122,0.35)" }}
        />
        <span className="pointer-events-none absolute right-2 top-2 z-20 flex items-center gap-1 bg-zinc-900/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100">
          Locked · {label}
        </span>
      </div>
    );
  }

  return (
    <div
      data-block={id}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(id);
        }
      }}
      className="group relative cursor-pointer outline-none"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 transition-all ${
          active ? "" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
        style={{ boxShadow: `inset 0 0 0 ${active ? 2 : 1}px ${accent}` }}
      />
      {active && (
        <span
          className="absolute left-0 top-0 z-20 -translate-y-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white"
          style={{ background: accent }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

function Editable({
  html,
  onCommit,
  editable,
  className,
  style,
  as = "div",
}: {
  html: string;
  onCommit: (v: string) => void;
  editable: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "p" | "div" | "span";
}) {
  const Tag = as as any;
  if (!editable) {
    return (
      <Tag
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: renderRich(html) }}
      />
    );
  }
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className={`${className ?? ""} rounded-sm outline-none focus:bg-zinc-900/[0.04] focus:ring-2 focus:ring-blue-400/60`}
      style={style}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onBlur={(e: React.FocusEvent<HTMLElement>) => onCommit(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: toRichHtml(html) }}
    />
  );
}

export function EmailPreview({
  campaign: c,
  selected = null,
  onSelect,
  interactive = true,
  inlineEdit = false,
  update,
  width,
  dark = false,
  lockedBlocks,
  beforeFooter,
}: {
  campaign: Campaign;
  selected?: BlockId | null;
  onSelect?: (id: BlockId) => void;
  interactive?: boolean;
  inlineEdit?: boolean;
  update?: (fn: (draft: Campaign) => void) => void;
  width?: number;
  dark?: boolean;
  /** Blocks that belong to the template shell and cannot be edited here. */
  lockedBlocks?: BlockId[];
  /** Extra content rendered just above the footer (e.g. an attached offer). */
  beforeFooter?: React.ReactNode;
}) {

  const accent = c.theme.accent;
  const edit = (fn: (d: Campaign) => void) => update?.(fn);
  const isLocked = (id: BlockId) => !!lockedBlocks?.includes(id);
  const canEditBlock = (id: BlockId) => inlineEdit && !!update && !isLocked(id);

  return (
    <div
      className="mx-auto overflow-hidden shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/10"
      style={{
        width: width ?? c.theme.contentWidth,
        maxWidth: "100%",
        background: dark ? "#111214" : c.theme.cardBg,
        fontFamily: c.theme.bodyFont,
        color: dark ? "#e5e7eb" : c.theme.text,
      }}
    >
      {c.header.visible && (
        <Block
          id="header"
          label="Header"
          selected={selected}
          onSelect={onSelect}
          interactive={interactive}
          accent={accent}
          locked={isLocked("header")}
        >
          <div
            className="flex items-center"
            style={{
              background: dark ? "#1b1c1f" : c.header.bg,
              padding: c.header.padding,
              justifyContent:
                c.header.align === "center"
                  ? "center"
                  : c.header.align === "right"
                    ? "flex-end"
                    : "flex-start",
            }}
          >
            {(dark ? c.header.logoUrlDark || c.header.logoUrl : c.header.logoUrl) ? (
              <img
                src={(dark ? c.header.logoUrlDark || c.header.logoUrl : c.header.logoUrl) as string}
                alt={c.header.logoText}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span
                className="border-2 px-3 py-1.5 text-center font-mono text-[11px] font-semibold uppercase leading-tight tracking-[0.18em]"
                style={{
                  color: onColor(dark ? "#1b1c1f" : c.header.bg),
                  borderColor: onColor(dark ? "#1b1c1f" : c.header.bg),
                }}
              >
                {c.header.logoText}
              </span>
            )}
          </div>
        </Block>
      )}

      {c.hero.visible && (
        <Block
          id="hero"
          label="Hero image"
          selected={selected}
          onSelect={onSelect}
          interactive={interactive}
          accent={accent}
          locked={isLocked("hero")}
        >
          <div
            className="relative overflow-hidden bg-zinc-100"
            style={{ height: c.hero.height, borderRadius: c.hero.radius }}
          >
            {c.hero.imageUrl ? (
              <img src={c.hero.imageUrl} alt={c.hero.alt} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center bg-[#e7edf5] text-[34px] font-semibold text-zinc-400">
                Hero image
              </div>
            )}
            {c.hero.overlay > 0 && (
              <span
                className="absolute inset-0"
                style={{ background: c.hero.overlayColor, opacity: c.hero.overlay / 100 }}
              />
            )}
          </div>
        </Block>
      )}

      {c.body.visible && (
        <Block
          id="body"
          label="Content"
          selected={selected}
          onSelect={onSelect}
          interactive={interactive}
          accent={accent}
          locked={isLocked("body")}
        >
          <div className="px-8 pb-2 pt-8" style={{ textAlign: c.body.align }}>
            <Editable
              as="h1"
              editable={canEditBlock("body")}
              html={c.body.heading}
              onCommit={(v) => edit((d) => void (d.body.heading = v))}
              className="font-semibold leading-tight tracking-tight"
              style={{
                fontSize: c.body.headingSize,
                color: dark ? "#f4f4f5" : c.body.headingColor,
                fontFamily: c.theme.headingFont,
              }}
            />
            <div className="mt-4 space-y-4">
              {c.body.paragraphs.map((p) => (
                <Editable
                  key={p.id}
                  as="p"
                  editable={canEditBlock("body")}
                  html={p.text}
                  onCommit={(v) =>
                    edit((d) => {
                      const t = d.body.paragraphs.find((x) => x.id === p.id);
                      if (t) t.text = v;
                    })
                  }
                  className="leading-relaxed"
                  style={{
                    fontSize: c.body.textSize,
                    color: dark ? "#c8cbd1" : c.body.textColor,
                  }}
                />
              ))}
            </div>
          </div>
        </Block>
      )}

      {c.cta.visible && (
        <Block
          id="cta"
          label="Button"
          selected={selected}
          onSelect={onSelect}
          interactive={interactive}
          accent={accent}
          locked={isLocked("cta")}
        >
          <div className="px-8 pb-8 pt-6" style={{ textAlign: c.cta.align }}>
            <span
              className="inline-flex items-center justify-center font-semibold"
              style={{
                background: c.cta.bg,
                color: c.cta.color,
                borderRadius: c.cta.radius,
                padding: `${c.cta.padY}px ${c.cta.padX}px`,
                width: c.cta.fullWidth ? "100%" : undefined,
                fontSize: 14,
              }}
            >
              <Editable
                as="span"
                editable={canEditBlock("cta")}
                html={c.cta.label}
                onCommit={(v) => edit((d) => void (d.cta.label = v))}
              />
            </span>
          </div>
        </Block>
      )}

      {c.details.visible && (
        <Block
          id="details"
          label="Detail grid"
          selected={selected}
          onSelect={onSelect}
          interactive={interactive}
          accent={accent}
          locked={isLocked("details")}
        >
          <div
            className="grid border-t border-black/5 px-8 py-7 text-left"
            style={{
              gridTemplateColumns: `repeat(${c.details.columns}, minmax(0,1fr))`,
              gap: c.details.gap,
            }}
          >
            {c.details.items.map((it) => (
              <div key={it.id}>
                <div
                  className="font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: accent }}
                >
                  {renderTokens(it.label)}
                </div>
                <div className="mt-1 text-[13px] font-medium">{renderTokens(it.value)}</div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {beforeFooter}

      {c.footer.visible && (

        <Block
          id="footer"
          label="Footer"
          selected={selected}
          onSelect={onSelect}
          interactive={interactive}
          accent={accent}
          locked={isLocked("footer")}
        >
          <div
            className="border-t border-black/5 px-8 py-7 text-center"
            style={{ background: dark ? "#1b1c1f" : c.footer.bg }}
          >
            <div className="flex justify-center gap-3">
              {c.footer.socials
                .filter((s) => s.enabled)
                .map((s) => (
                  <span
                    key={s.key}
                    className="grid size-7 place-items-center"
                    style={{
                      background: dark ? "#2a2c31" : c.footer.socialBg,
                      borderRadius: c.footer.socialRadius,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5"
                      style={{ fill: dark ? "#e5e7eb" : c.footer.socialColor }}
                      aria-hidden
                    >
                      <path d={SOCIAL_PATHS[s.key]} />
                    </svg>
                  </span>
                ))}
            </div>
            <p
              className="mt-4 text-[11px] leading-relaxed"
              style={{ color: dark ? "#9aa0a8" : c.footer.text }}
            >
              {renderTokens(c.footer.company)}
              <br />
              {renderTokens(c.footer.address)}
            </p>
            <p className="mt-3 text-[11px]" style={{ color: dark ? "#9aa0a8" : c.footer.text }}>
              {c.footer.links.map((l, i) => (
                <span key={l.id}>
                  {i > 0 && <span className="px-1.5 opacity-40">|</span>}
                  <span className="underline underline-offset-2">{l.label}</span>
                </span>
              ))}
            </p>
          </div>
        </Block>
      )}
    </div>
  );
}
