import heroRooftop from "@/assets/hero-rooftop.jpg";
import heroValley from "@/assets/hero-valley.jpg";
import heroAmalfi from "@/assets/hero-amalfi.jpg";
import tplHoliday from "@/assets/tpl-holiday.jpg";
import tplFamily from "@/assets/tpl-family.jpg";

export type EmailTemplate = {
  id: string;
  name: string;
  vibe: string;
  copy: string;
  /** How the masthead is drawn. */
  header: "tint" | "image" | "band";
  image?: string;
  align: "left" | "center";
  /** Font stacks — loaded in the root route head. */
  headingFont: string;
  bodyFont: string;
  radius: number;
  colors: {
    page: string;
    card: string;
    band: string;
    bandInk: string;
    accent: string;
    heading: string;
    text: string;
    muted: string;
    button: string;
    buttonInk: string;
    panel: string;
    panelBorder: string;
  };
};

const SANS = "'Poppins', system-ui, -apple-system, Segoe UI, sans-serif";
const SYSTEM = "system-ui, -apple-system, Segoe UI, sans-serif";

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "signature",
    name: "Signature",
    vibe: "Calm · editorial",
    copy: "Tinted masthead and a serif headline — the house default.",
    header: "tint",
    align: "left",
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: SYSTEM,
    radius: 12,
    colors: {
      page: "#f4f6f9",
      card: "#ffffff",
      band: "#eaf2fd",
      bandInk: "#0b3a6f",
      accent: "#0b74d4",
      heading: "#101828",
      text: "#4b5563",
      muted: "#8a94a6",
      button: "#0b6ed0",
      buttonInk: "#ffffff",
      panel: "#f8fafc",
      panelBorder: "#e4e8ee",
    },
  },
  {
    id: "skyline",
    name: "Skyline",
    vibe: "Bold · photographic",
    copy: "Full-width photo masthead with the hotel name over the image.",
    header: "image",
    image: heroRooftop,
    align: "left",
    headingFont: "'Fraunces', Georgia, serif",
    bodyFont: SYSTEM,
    radius: 14,
    colors: {
      page: "#eef1f5",
      card: "#ffffff",
      band: "#0b2540",
      bandInk: "#ffffff",
      accent: "#1c7ed6",
      heading: "#0b2540",
      text: "#51606f",
      muted: "#8b98a6",
      button: "#0b2540",
      buttonInk: "#ffffff",
      panel: "#f2f6fa",
      panelBorder: "#dbe4ee",
    },
  },
  {
    id: "midwinter",
    name: "Midwinter",
    vibe: "Christmas · warm",
    copy: "Deep green and gold with a festive lobby photo — for December stays.",
    header: "image",
    image: tplHoliday,
    align: "center",
    headingFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont: SYSTEM,
    radius: 4,
    colors: {
      page: "#f4f1ea",
      card: "#fffdf8",
      band: "#0f3b2e",
      bandInk: "#f6e7c4",
      accent: "#9a7b2f",
      heading: "#12352a",
      text: "#4a5a52",
      muted: "#8c9791",
      button: "#0f3b2e",
      buttonInk: "#f6e7c4",
      panel: "#f6f1e4",
      panelBorder: "#e3d9c2",
    },
  },
  {
    id: "newyear",
    name: "Midnight Gold",
    vibe: "New Year · celebratory",
    copy: "Ink-dark masthead with gold rules — countdown and celebration sends.",
    header: "band",
    align: "center",
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: SYSTEM,
    radius: 2,
    colors: {
      page: "#f1f0ee",
      card: "#ffffff",
      band: "#12121a",
      bandInk: "#e9c46a",
      accent: "#b08d2e",
      heading: "#15151d",
      text: "#4f4f5c",
      muted: "#8d8d99",
      button: "#15151d",
      buttonInk: "#f5e2ad",
      panel: "#faf7ef",
      panelBorder: "#e8dfc8",
    },
  },
  {
    id: "family",
    name: "Family Sunshine",
    vibe: "Family · playful",
    copy: "Rounded, bright and friendly with a pool photo — family bookings.",
    header: "image",
    image: tplFamily,
    align: "center",
    headingFont: SANS,
    bodyFont: SANS,
    radius: 22,
    colors: {
      page: "#eefaff",
      card: "#ffffff",
      band: "#0fa3c7",
      bandInk: "#ffffff",
      accent: "#f7883b",
      heading: "#0c4a5c",
      text: "#4d6b76",
      muted: "#8aa5ae",
      button: "#f7883b",
      buttonInk: "#ffffff",
      panel: "#f0fbff",
      panelBorder: "#cceef8",
    },
  },
  {
    id: "retreat",
    name: "Quiet Retreat",
    vibe: "Wellness · minimal",
    copy: "Sand and sage, generous spacing, text-first — spa and long stays.",
    header: "band",
    align: "left",
    headingFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont: SYSTEM,
    radius: 0,
    colors: {
      page: "#f6f4ef",
      card: "#fffefb",
      band: "#e7e3d8",
      bandInk: "#3f4a3f",
      accent: "#7d8f6b",
      heading: "#2f3a30",
      text: "#5d6660",
      muted: "#98a096",
      button: "#5b6b52",
      buttonInk: "#ffffff",
      panel: "#f2f1ea",
      panelBorder: "#e0ddd2",
    },
  },
  {
    id: "coastal",
    name: "Coastal Escape",
    vibe: "Summer · airy",
    copy: "Sun-bleached photo header and a light blue palette for leisure stays.",
    header: "image",
    image: heroAmalfi,
    align: "left",
    headingFont: "'Space Grotesk', system-ui, sans-serif",
    bodyFont: SYSTEM,
    radius: 16,
    colors: {
      page: "#f2f8fb",
      card: "#ffffff",
      band: "#0e6e8c",
      bandInk: "#ffffff",
      accent: "#0e8aa8",
      heading: "#0b3b4a",
      text: "#4a636c",
      muted: "#89a1aa",
      button: "#0e8aa8",
      buttonInk: "#ffffff",
      panel: "#eff8fb",
      panelBorder: "#cfe6ee",
    },
  },
  {
    id: "lodge",
    name: "Mountain Lodge",
    vibe: "Cosy · earthy",
    copy: "Warm timber tones with a lodge photo — winter and countryside stays.",
    header: "image",
    image: heroValley,
    align: "left",
    headingFont: "'Fraunces', Georgia, serif",
    bodyFont: SYSTEM,
    radius: 8,
    colors: {
      page: "#f5f1ec",
      card: "#ffffff",
      band: "#4a3527",
      bandInk: "#f3e6d6",
      accent: "#a3703f",
      heading: "#33251b",
      text: "#5d5148",
      muted: "#9b8d81",
      button: "#8a5a30",
      buttonInk: "#ffffff",
      panel: "#f7f2eb",
      panelBorder: "#e6dbcd",
    },
  },
];

export const getTemplate = (id?: string | null) =>
  EMAIL_TEMPLATES.find((t) => t.id === id) ?? EMAIL_TEMPLATES[0]!;
