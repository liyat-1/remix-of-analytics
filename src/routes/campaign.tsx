import { createFileRoute } from "@tanstack/react-router";
import { CampaignWizard } from "@/components/campaign/CampaignWizard";

export const Route = createFileRoute("/campaign")({
  head: () => ({
    meta: [
      { title: "Create Drip Campaign · Directful Studio" },
      {
        name: "description",
        content:
          "Name your drip campaign, choose text-only or email-only, pick a saved email design and preview it live on desktop or phone.",
      },
      { property: "og:title", content: "Create Drip Campaign · Directful Studio" },
      {
        property: "og:description",
        content: "A guided flow: name, channel, content and promotion — with a live channel-aware preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignWizard,
});
