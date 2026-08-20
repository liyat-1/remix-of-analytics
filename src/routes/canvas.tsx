import { createFileRoute } from "@tanstack/react-router";
import { BuilderShell } from "@/components/editor/BuilderShell";
import { createCanvasCampaign } from "@/lib/campaign";

export const Route = createFileRoute("/canvas")({
  head: () => ({
    meta: [
      { title: "Live Canvas Builder · Directful Studio" },
      {
        name: "description",
        content:
          "Direct-manipulation email builder: type on the preview, format text with a full rich-text toolbar, and preview in Gmail or Outlook.",
      },
      { property: "og:title", content: "Live Canvas Builder · Directful Studio" },
      {
        property: "og:description",
        content: "Edit every element inline — text, fonts, colors, images and buttons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <BuilderShell initial={createCanvasCampaign} inlineEditDefault floatingEditor />
  ),
});
