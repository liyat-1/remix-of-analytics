import heroAmalfi from "../assets/hero-amalfi.jpg";
import heroValley from "../assets/hero-valley.jpg";

export type SocialKey = "x" | "facebook" | "instagram" | "linkedin" | "youtube";

export type DetailItem = { id: string; label: string; value: string };

export type Campaign = {
  meta: {
    name: string;
    subject: string;
    preheader: string;
    fromName: string;
    fromEmail: string;
    testEmail: string;
  };
  theme: {
    pageBg: string;
    cardBg: string;
    text: string;
    muted: string;
    accent: string;
    headingFont: string;
    bodyFont: string;
    contentWidth: number;
  };
  header: {
    visible: boolean;
    logoUrl: string | null;
    /** Optional alternate logo used when the email renders in dark mode. */
    logoUrlDark: string | null;
    logoText: string;
    bg: string;
    padding: number;
    align: "left" | "center" | "right";
  };
  hero: {
    visible: boolean;
    imageUrl: string;
    alt: string;
    height: number;
    radius: number;
    overlay: number;
    overlayColor: string;
  };
  body: {
    visible: boolean;
    heading: string;
    headingSize: number;
    headingColor: string;
    align: "left" | "center" | "right";
    paragraphs: { id: string; text: string }[];
    textSize: number;
    textColor: string;
  };
  cta: {
    visible: boolean;
    label: string;
    url: string;
    bg: string;
    color: string;
    radius: number;
    padY: number;
    padX: number;
    fullWidth: boolean;
    align: "left" | "center" | "right";
    newTab: boolean;
    utm: boolean;
  };
  details: {
    visible: boolean;
    columns: 1 | 2 | 3;
    gap: number;
    items: DetailItem[];
  };
  footer: {
    visible: boolean;
    bg: string;
    company: string;
    address: string;
    socials: { key: SocialKey; enabled: boolean; url: string }[];
    links: { id: string; label: string; url: string }[];
    text: string;
    socialBg: string;
    socialColor: string;
    socialRadius: number;
  };
};

export const MERGE_TOKENS = [
  "{{first_name}}",
  "{{last_name}}",
  "{{checkout_date}}",
  "{{hotel}}",
  "{{loyalty_tier}}",
] as const;

export const SAMPLE_VALUES: Record<string, string> = {
  "{{first_name}}": "Michelle",
  "{{last_name}}": "West",
  "{{checkout_date}}": "December 29, 2024",
  "{{hotel}}": "Hellas Gadgets Kallithea",
  "{{loyalty_tier}}": "Gold",
  "{{guest.first_name}}": "Michelle",
  "{{guest.last_name}}": "West",
  "{{hotel.name}}": "Wyndham Grand Istanbul Levent",
  "{{arrival_date}}": "June 24",
  "{{departure_date}}": "June 27",
  "{{room_type}}": "Deluxe King",
  "{{booking_link}}": "directful.co/stay",
};

export function renderTokens(input: string) {
  return input.replace(/\{\{[a-z_.]+\}\}/g, (m) => SAMPLE_VALUES[m] ?? m);
}


/** Very small markdown-ish inline renderer: **bold** and *italic*. */
export function inlineHtml(input: string, substitute = true) {
  const escaped = (substitute ? renderTokens(input) : input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export const uid = () => Math.random().toString(36).slice(2, 9);

const baseCampaign: Campaign = {
  meta: {
    name: "Post-stay reactivation",
    subject: "Your next stay awaits — 15% off direct bookings",
    preheader: "Plus free late checkout on select dates.",
    fromName: "Hellas Gadgets Kallithea",
    fromEmail: "stay@directful.com",
    testEmail: "michelle.west@example.com",
  },
  theme: {
    pageBg: "#eceded",
    cardBg: "#ffffff",
    text: "#111827",
    muted: "#4b5563",
    accent: "#2b44e0",
    headingFont: "Inter",
    bodyFont: "Inter",
    contentWidth: 600,
  },
  header: {
    visible: true,
    logoUrl: null,
    logoUrlDark: null,
    logoText: "AC HOTELS",
    bg: "#4b5563",
    padding: 24,
    align: "left",
  },
  hero: {
    visible: true,
    imageUrl: heroAmalfi,
    alt: "Hotel hero image",
    height: 240,
    radius: 0,
    overlay: 0,
    overlayColor: "#000000",
  },
  body: {
    visible: true,
    heading: "Your Next Stay Awaits",
    headingSize: 24,
    headingColor: "#111827",
    align: "left",
    paragraphs: [
      { id: uid(), text: "Hello {{first_name}} {{last_name}}," },
      {
        id: uid(),
        text: "We hope you enjoyed your recent stay with us on {{checkout_date}}. We would love to welcome you back soon.",
      },
      {
        id: uid(),
        text: "Book directly through our website and enjoy **15% off** your next visit, plus **free late checkout** on select dates.",
      },
    ],
    textSize: 15,
    textColor: "#374151",
  },
  cta: {
    visible: true,
    label: "Book your next stay",
    url: "https://directful.com/book?utm_campaign=reactivation",
    bg: "#2b44e0",
    color: "#ffffff",
    radius: 4,
    padY: 14,
    padX: 24,
    fullWidth: true,
    align: "center",
    newTab: true,
    utm: true,
  },
  details: {
    visible: false,
    columns: 2,
    gap: 24,
    items: [
      { id: uid(), label: "Last stay", value: "{{checkout_date}}" },
      { id: uid(), label: "Loyalty", value: "{{loyalty_tier}} · +2,400 pts" },
    ],
  },
  footer: {
    visible: true,
    bg: "#ffffff",
    company: "Hellas Gadgets Kallithea",
    address: "59 Thiseos, Kallithea, ATT, 176 71, Greece",
    socials: [
      { key: "x", enabled: true, url: "https://x.com/" },
      { key: "facebook", enabled: true, url: "https://facebook.com/" },
      { key: "instagram", enabled: true, url: "https://instagram.com/" },
      { key: "linkedin", enabled: true, url: "https://linkedin.com/" },
      { key: "youtube", enabled: true, url: "https://youtube.com/" },
    ],
    links: [
      { id: uid(), label: "Privacy", url: "#" },
      { id: uid(), label: "Terms", url: "#" },
      { id: uid(), label: "Unsubscribe", url: "#" },
    ],
    text: "#6b7280",
    socialBg: "#111827",
    socialColor: "#ffffff",
    socialRadius: 999,
  },
};

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function createCanvasCampaign(): Campaign {
  return clone(baseCampaign);
}

export function createStructuredCampaign(): Campaign {
  const c = clone(baseCampaign);
  c.meta.name = "Valley Lodge · Loyalty";
  c.theme.accent = "#926b4d";
  c.header.bg = "#f5f5f4";
  c.header.logoText = "VALLEY LODGE";
  c.header.align = "center";
  c.hero.imageUrl = heroValley;
  c.hero.alt = "Boutique hotel suite with mountain view";
  c.cta.bg = "#926b4d";
  c.cta.label = "Confirm reservation";
  c.cta.fullWidth = false;
  c.details.visible = true;
  return c;
}
