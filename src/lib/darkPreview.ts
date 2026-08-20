import type { Campaign } from "./campaign";

/** Lightweight dark-mode transform used by template thumbnails and previews. */
export function toDark(c: Campaign): Campaign {
  const d: Campaign = JSON.parse(JSON.stringify(c));
  d.theme.pageBg = "#141518";
  d.theme.cardBg = "#1b1c1f";
  d.theme.text = "#e5e7eb";
  d.theme.muted = "#a1a1aa";
  d.header.bg = "#1b1c1f";
  if (d.header.logoUrlDark) d.header.logoUrl = d.header.logoUrlDark;
  d.body.headingColor = "#f4f4f5";
  d.body.textColor = "#c8cbd1";
  d.footer.bg = "#1b1c1f";
  d.footer.text = "#a1a1aa";
  return d;
}
