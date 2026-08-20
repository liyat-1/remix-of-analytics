import offerRoom from "@/assets/offer-room.jpg";
import heroRooftop from "@/assets/hero-rooftop.jpg";
import type { Offer } from "@/lib/otaJourney";

/** The property this prototype speaks for. */
export const HOTEL = {
  name: "Wyndham Grand Istanbul Levent",
  short: "Wyndham Grand",
  place: "Istanbul · Türkiye",
  hero: heroRooftop,
};

/** Reservation facts shown in the landing summary card. */
export type StayFact = { id: string; label: string; value: string };

export const DEFAULT_STAY: StayFact[] = [
  { id: "arrival", label: "Arrival", value: "June 24" },
  { id: "departure", label: "Departure", value: "June 27" },
  { id: "guests", label: "Guests", value: "2" },
  { id: "room", label: "Room", value: "Deluxe King" },
];

/* ------------------------------ catalogue ----------------------------- */

export type OfferCatalogItem = {
  id: string;
  title: string;
  category: string;
  price: string;
  /** One-line guest promise. */
  description: string;
  /** Short line used inside the email teaser. */
  teaser: string;
  benefits: string[];
  /** Only upgrades show the from → to row. */
  upgrade?: { from: string; to: string };
  performance: string;
  image: string;
  kind: Offer["kind"];
  value: string;
  cta: string;
  validity: string;
};

export const OFFER_CATALOG: OfferCatalogItem[] = [
  {
    id: "room_upgrade",
    title: "Room upgrade",
    category: "Upgrade",
    price: "$30 when available",
    description: "Claim it now and it's confirmed on your reservation.",
    teaser: "Enjoy a little more space and comfort during your stay.",
    benefits: [
      "A higher room category when one is free",
      "Confirmed at check-in",
      "Nothing to pay now",
    ],
    upgrade: { from: "Deluxe King", to: "Premium City View" },
    performance: "Best performer before arrival",
    image: offerRoom,
    kind: "amount",
    value: "30",
    cta: "Claim offer",
    validity: "$30 when available to the hotel",
  },
  {
    id: "breakfast",
    title: "Free breakfast",
    category: "Amenity",
    price: "$18 per stay",
    description: "Start every morning at the buffet, on us.",
    teaser: "Breakfast for two, every morning of your stay.",
    benefits: ["Buffet breakfast for two", "Served daily 07:00–10:30", "Nothing to pay now"],
    performance: "Not tested yet",
    image: offerRoom,
    kind: "inclusion",
    value: "Breakfast included",
    cta: "Add breakfast",
    validity: "Valid for every morning of the stay",
  },
  {
    id: "early_checkin",
    title: "Early check-in",
    category: "Service",
    price: "$0 subject to availability",
    description: "Arrive early and settle in straight away.",
    teaser: "Get into your room from 11:00 when we can make it happen.",
    benefits: ["Room from 11:00 when free", "Confirmed the morning of arrival", "Free of charge"],
    performance: "Not tested yet",
    image: offerRoom,
    kind: "inclusion",
    value: "Early check-in",
    cta: "Request early check-in",
    validity: "Subject to availability on the day",
  },
  {
    id: "late_checkout",
    title: "Late checkout",
    category: "Service",
    price: "$0 subject to availability",
    description: "Keep the room a few hours longer on your last day.",
    teaser: "Stay in the room until 14:00 on your final day.",
    benefits: ["Checkout until 14:00", "Confirmed the day before", "Free of charge"],
    performance: "Strong with leisure guests",
    image: offerRoom,
    kind: "inclusion",
    value: "Late checkout",
    cta: "Request late checkout",
    validity: "Subject to availability on the day",
  },
  {
    id: "airport_transfer",
    title: "Airport transfer",
    category: "Experience",
    price: "$45 per stay",
    description: "A driver waiting for you at arrivals.",
    teaser: "A private car from the airport straight to the lobby.",
    benefits: ["Private car for up to 3 guests", "Meet and greet at arrivals", "Flight tracked"],
    performance: "Not tested yet",
    image: offerRoom,
    kind: "amount",
    value: "45",
    cta: "Book my transfer",
    validity: "Book at least 24 hours before arrival",
  },
  {
    id: "spa_credit",
    title: "Spa credit",
    category: "Credit",
    price: "$25 credit",
    description: "Spend it on any treatment during your stay.",
    teaser: "$25 to spend in the spa while you're with us.",
    benefits: ["$25 towards any treatment", "Applied to your room account", "Usable any day"],
    performance: "Not tested yet",
    image: offerRoom,
    kind: "amount",
    value: "25",
    cta: "Claim spa credit",
    validity: "Valid during the stay only",
  },
];

export const getCatalogOffer = (id?: string) =>
  OFFER_CATALOG.find((o) => o.id === id) ?? OFFER_CATALOG[0]!;

/** Builds the message offer from a catalogue pick, keeping edits explicit. */
export function offerFromCatalog(item: OfferCatalogItem, segment = "all"): Offer {
  return {
    enabled: true,
    catalogId: item.id,
    kind: item.kind,
    value: item.value,
    title: item.title,
    description: item.description,
    validity: item.validity,
    cta: item.cta,
    teaser: item.teaser,
    benefits: item.benefits,
    upgrade: item.upgrade,
    image: item.image,
    category: item.category,
    segment,
  };
}

/** Resolves display data for an attached offer, falling back to the catalogue. */
export function offerView(offer: Offer) {
  const item = OFFER_CATALOG.find((o) => o.id === offer.catalogId);
  return {
    title: offer.title || item?.title || "Offer",
    category: offer.category ?? item?.category ?? "Offer",
    description: offer.description || item?.description || "",
    teaser: offer.teaser ?? item?.teaser ?? offer.description,
    benefits: offer.benefits ?? item?.benefits ?? [],
    upgrade: offer.upgrade ?? item?.upgrade,
    image: offer.image ?? item?.image ?? offerRoom,
    validity: offer.validity || item?.validity || "",
    cta: offer.cta || item?.cta || "Claim offer",
  };
}

/* ------------------------------- audience ----------------------------- */

export const GUEST_SEGMENTS = [
  { id: "all", label: "All guests" },
  { id: "returning", label: "Returning" },
  { id: "first_time", label: "First-time" },
  { id: "high_value", label: "High value" },
  { id: "family", label: "Family" },
  { id: "business", label: "Business" },
];

export const AUDIENCE_ROWS: { label: string; count: string; included: boolean }[] = [
  { label: "All new OTA bookings", count: "8,482", included: true },
  { label: "Guests with a reachable email", count: "8,240", included: true },
  { label: "Already direct guests", count: "1,284", included: false },
  { label: "No marketing consent", count: "186", included: false },
  { label: "Cancellations and no-shows", count: "56", included: false },
];
