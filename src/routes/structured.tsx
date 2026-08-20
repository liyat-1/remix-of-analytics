import { createFileRoute } from "@tanstack/react-router";
import { BuilderShell } from "@/components/editor/BuilderShell";
import { createStructuredCampaign } from "@/lib/campaign";

export const Route = createFileRoute("/structured")({
  head: () => ({
    meta: [
      { title: "Structured Builder · Directful Studio" },
      {
        name: "description",
        content:
          "Section-based email campaign builder with a rich text editor, layout presets and realistic Gmail and Outlook inbox previews.",
      },
      { property: "og:title", content: "Structured Builder · Directful Studio" },
      {
        property: "og:description",
        content: "Click a section, edit it in a focused popup, and watch the live preview update.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <BuilderShell initial={createStructuredCampaign} />,
});
