import { useRef, useState } from "react";
import {
  Check,
  Users,
  Gift,
  Coins,
  Clock,
  CalendarCheck2,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Trash2,
  BadgePercent,
  FileText,
  Repeat2,
  X,
} from "lucide-react";
import { RailSection } from "../editor/RailSection";
import { Select } from "../editor/Select";
import { Field, TextInput, ToggleRow } from "../editor/controls";
import { StepMenu } from "./StepMenu";
import heroAmalfi from "@/assets/hero-amalfi.jpg";
import heroValley from "@/assets/hero-valley.jpg";

export type Channel = "text" | "email" | "both" | "text_fallback";
export const hasText = (c: Channel | null) => c === "text" || c === "both" || c === "text_fallback";
export const hasEmail = (c: Channel | null) =>
  c === "email" || c === "both" || c === "text_fallback";

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email Only",
  text: "SMS Only",
  both: "Email + SMS",
  text_fallback: "SMS with Email Fallback",
};

export const AUDIENCES = [
  { value: "everyone", label: "Everyone", hint: "All contactable past guests" },
  { value: "past_90", label: "Stayed in last 90 days", hint: "Recent check-outs" },
  { value: "loyalty", label: "Loyalty members", hint: "Silver tier and above" },
  { value: "lapsed", label: "Lapsed guests", hint: "No stay in 12 months" },
];

const MIN_NIGHTS = [
  { value: "1", label: "1 night" },
  { value: "2", label: "2 nights" },
  { value: "3", label: "3 nights" },
  { value: "5", label: "5 nights" },
  { value: "7", label: "7 nights" },
];

const RECENT_FILES = [
  { name: "hero-amalfi.jpg", url: heroAmalfi },
  { name: "hero-valley.jpg", url: heroValley },
];

/* ===================== Promotion rail ===================== */

export function PromotionRail(props: {
  promoOn: boolean;
  setPromoOn: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  minNights: string;
  setMinNights: (v: string) => void;
  discount: string;
  setDiscount: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  validRange: boolean;
  setValidRange: (v: boolean) => void;
  validFrom: string;
  setValidFrom: (v: string) => void;
  validTo: string;
  setValidTo: (v: string) => void;
  audience: string;
  setAudience: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  cutOff: boolean;
  setCutOff: (v: boolean) => void;
  cutOffDate: string;
  setCutOffDate: (v: string) => void;
  guests: number;
  cost: string;
  channel: Channel | null;
  openRail: Record<number, boolean>;
  toggle: (i: number) => void;
}) {
  const { openRail, toggle, channel } = props;
  return (
    <>
      <RailSection
        index={1}
        title="Promotion"
        hint="Personalised discount for every channel"
        open={!!openRail[1]}
        onToggle={() => toggle(1)}
      >
        <div className="p-4">
          <ToggleRow
            label="Use promotion"
            hint="Turn off to send the campaign without a discount."
            checked={props.promoOn}
            onChange={props.setPromoOn}
          />
        </div>
      </RailSection>

      {props.promoOn && (
        <>
          <RailSection
            index={2}
            title="Offer details"
            hint="Code, discount & tagline"
            open={!!openRail[2]}
            onToggle={() => toggle(2)}
          >
            <div className="space-y-4 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Offer promo code">
                  <TextInput value={props.promoCode} onChange={props.setPromoCode} />
                </Field>
                <Field label="Minimum nights">
                  <Select
                    ariaLabel="Minimum nights"
                    value={props.minNights}
                    options={MIN_NIGHTS}
                    onChange={props.setMinNights}
                  />
                </Field>
              </div>
              <Field label="Discount percentage" hint="% off direct bookings">
                <TextInput value={props.discount} onChange={props.setDiscount} />
              </Field>
              <Field label="Offer tagline" hint="Shown on the promo card">
                <TextInput
                  value={props.tagline}
                  onChange={props.setTagline}
                  placeholder="The best rate, guaranteed"
                />
              </Field>
            </div>
          </RailSection>

          <RailSection
            index={3}
            title="Validity"
            hint="Optional date window"
            open={!!openRail[3]}
            onToggle={() => toggle(3)}
          >
            <div className="space-y-4 p-4">
              <ToggleRow
                label="Offer is valid between specific dates"
                checked={props.validRange}
                onChange={props.setValidRange}
              />
              {props.validRange && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Valid from">
                    <TextInput type="date" value={props.validFrom} onChange={props.setValidFrom} />
                  </Field>
                  <Field label="Valid to">
                    <TextInput type="date" value={props.validTo} onChange={props.setValidTo} />
                  </Field>
                </div>
              )}
            </div>
          </RailSection>
        </>
      )}

      <RailSection
        index={props.promoOn ? 4 : 2}
        title="Audience & schedule"
        hint="Who receives it and when"
        open={!!openRail[4]}
        onToggle={() => toggle(4)}
      >
        <div className="space-y-4 p-4">
          <div>
            <p className="text-[13px] font-semibold text-zinc-900">Select your audience</p>
            <p className="mt-0.5 text-[11.5px] text-zinc-500">
              Choose who will receive this campaign.
            </p>
          </div>
          <Field label="Audience" hint={`Approx. ${props.guests.toLocaleString()} guests`}>
            <Select
              ariaLabel="Audience"
              value={props.audience}
              options={AUDIENCES}
              onChange={props.setAudience}
            />
          </Field>
          <div className="h-px bg-zinc-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start sending on">
              <TextInput type="date" value={props.startDate} onChange={props.setStartDate} />
            </Field>
            {props.cutOff && (
              <Field label="Stop sending on">
                <TextInput type="date" value={props.cutOffDate} onChange={props.setCutOffDate} />
              </Field>
            )}
          </div>
          <ToggleRow
            label="Add cut-off date"
            hint="Stop sending automatically at a certain date."
            checked={props.cutOff}
            onChange={props.setCutOff}
          />
        </div>
      </RailSection>

      <RailSection
        index={props.promoOn ? 5 : 3}
        title="Summary"
        hint="Estimated impact"
        open={!!openRail[5]}
        onToggle={() => toggle(5)}
      >
        <div className="p-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-3">
              <CalendarCheck2 size={22} className="text-emerald-600" />
              <div>
                <p className="text-[12px] font-medium text-emerald-800/70">Estimated end date</p>
                <p className="text-[16px] font-semibold text-emerald-900">
                  {props.cutOff ? "Aug 30, 2026" : "Jul 30, 2026"}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-emerald-900/90">
              <li className="flex items-center gap-2.5">
                <Users size={16} className="text-emerald-600" />
                {props.guests.toLocaleString()} guests will be reached
              </li>
              <li className="flex items-center gap-2.5">
                <Gift size={16} className="text-emerald-600" />
                {hasText(channel) ? "250 complimentary texts" : "Unlimited emails on your plan"}
              </li>
              <li className="flex items-center gap-2.5">
                <Coins size={16} className="text-emerald-600" />${props.cost} approx. (
                {hasText(channel) ? "$0.06 / text" : "$0.00 / email"})
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={16} className="text-emerald-600" />
                Sent around 5pm in each guest&rsquo;s time zone
              </li>
            </ul>
          </div>
        </div>
      </RailSection>
    </>
  );
}

/* ===================== Shared bits ===================== */

export function ChannelCard({
  active,
  Icon,
  title,
  body,
  onClick,
  onRemove,
}: {
  active: boolean;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`relative rounded-xl border transition-all ${
        active
          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/15"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
      }`}
    >
      <button
        onClick={onClick}
        aria-pressed={active}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl p-3.5 pr-10 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
      >
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-lg ${
            active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          <Icon size={17} />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-zinc-900">{title}</span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-zinc-500">{body}</span>
        </span>
      </button>

      <span className="absolute right-2.5 top-3">
        {active && onRemove ? (
          <StepMenu
            label={`${title} options`}
            items={[
              { label: "Change", icon: Repeat2, onSelect: onClick },
              {
                label: "Remove",
                icon: X,
                destructive: true,
                separated: true,
                onSelect: onRemove,
              },
            ]}
          />
        ) : (
          <span
            className={`grid size-5 place-items-center rounded-full border ${
              active ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300"
            }`}
          >
            {active && <Check size={12} />}
          </span>
        )}
      </span>
    </div>
  );
}

export function MediaUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    onChange(URL.createObjectURL(f));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-[12px] leading-relaxed text-amber-900">
          Adding an image is <strong>strongly recommended</strong> — MMS previews get much higher
          engagement. Max 500 KB.
        </p>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-zinc-200">
          <img src={value} alt="" className="block max-h-56 w-full object-cover" />
          <button
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-md ring-1 ring-zinc-200 transition-colors hover:bg-white hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            drag ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 hover:border-zinc-400"
          }`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-500">
            <ImageIcon size={18} />
          </span>
          <div>
            <p className="text-[13px] font-medium text-zinc-800">Drop a file here</p>
            <p className="text-[11.5px] text-zinc-500">or click to browse</p>
          </div>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700">
            <Upload size={12} /> Select file
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Select from recent files
        </p>
        <div className="flex flex-wrap gap-2">
          {RECENT_FILES.map((f) => {
            const active = value === f.url;
            return (
              <button
                key={f.name}
                onClick={() => onChange(f.url)}
                aria-pressed={active}
                title={f.name}
                className={`group relative overflow-hidden rounded-lg border transition-all ${
                  active
                    ? "border-blue-600 ring-1 ring-blue-600/25"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <img src={f.url} alt={f.name} className="block h-16 w-24 object-cover" />
                {active && (
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-blue-600 text-white">
                    <Check size={11} />
                  </span>
                )}
              </button>
            );
          })}
          {/* Placeholder file tiles */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="grid h-16 w-24 place-items-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400"
            >
              <FileText size={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PromoPreviewCard({
  accent,
  hotel,
  firstName,
  tagline,
  discount,
  enabled,
  compact = false,
}: {
  accent: string;
  hotel: string;
  firstName: string;
  tagline: string;
  discount: string;
  enabled: boolean;
  compact?: boolean;
}) {
  if (!enabled) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
        <BadgePercent size={20} className="mx-auto mb-2 text-zinc-400" />
        <p className="text-[13px] font-medium">Promotion is turned off</p>
        <p className="mt-1 text-[11.5px]">Toggle it on to preview the promo card.</p>
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden rounded-xl text-white shadow-lg ${
        compact ? "p-4" : "p-6"
      }`}
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, color-mix(in oklab, ${accent} 55%, #0f172a) 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`font-semibold uppercase tracking-[0.18em] text-white/70 ${compact ? "text-[9px]" : "text-[10.5px]"}`}
          >
            Exclusive offer
          </p>
          <p className={`mt-1 font-semibold ${compact ? "text-[13px]" : "text-[15px]"}`}>
            {hotel || "Your hotel"}
          </p>
        </div>
        <span
          className={`grid place-items-center rounded-full bg-white/15 backdrop-blur ${
            compact ? "size-8" : "size-10"
          }`}
        >
          <BadgePercent size={compact ? 15 : 18} />
        </span>
      </div>

      <div className={compact ? "mt-6" : "mt-8"}>
        <div
          className={`inline-block rounded-md bg-white font-bold uppercase tracking-widest text-zinc-900 shadow-md ${
            compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
          }`}
        >
          {firstName.toUpperCase()}, you unlocked
        </div>
        <div
          className={`mt-2 -rotate-1 rounded-md bg-black/25 shadow-lg ring-1 ring-white/10 backdrop-blur ${
            compact ? "px-3 py-2" : "px-4 py-3"
          }`}
        >
          <p
            className={`font-black uppercase tracking-wide ${
              compact ? "text-[17px]" : "text-[22px]"
            }`}
          >
            {tagline || `The best rate ${discount}%`}
          </p>
        </div>
      </div>

      <p className={`mt-6 text-white/70 ${compact ? "text-[10.5px]" : "text-[11.5px]"}`}>
        {discount}% off direct bookings · promo card previewed as the guest sees it.
      </p>
    </div>
  );
}
