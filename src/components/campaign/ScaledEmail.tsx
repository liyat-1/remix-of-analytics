import { EmailPreview } from "../editor/EmailPreview";
import type { Campaign } from "@/lib/campaign";

/** Live, scaled-down render of a campaign — used for template thumbnails. */
export function ScaledEmail({
  campaign,
  width = 240,
  height = 168,
}: {
  campaign: Campaign;
  width?: number;
  height?: number;
}) {
  const w = campaign.theme.contentWidth;
  const scale = width / w;
  return (
    <div
      className="overflow-hidden rounded-lg ring-1 ring-black/10"
      style={{ width, height, background: campaign.theme.pageBg }}
    >
      <div style={{ width: w, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <EmailPreview campaign={campaign} interactive={false} inlineEdit={false} width={w} />
      </div>
    </div>
  );
}
