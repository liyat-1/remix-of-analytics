import { useRef, useState } from "react";

export const inputCls =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[13px] leading-[38px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

export function Group({
  title,
  children,
  defaultOpen = true,
  action,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-zinc-100">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 hover:bg-zinc-50">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-zinc-800">
          <span className="inline-block text-zinc-400 transition-transform group-open:rotate-90">›</span>
          {title}
        </span>
        {action}
      </summary>
      <div className="space-y-4 px-5 pb-5">{children}</div>
    </details>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-zinc-600">{label}</span>
        {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <textarea
      ref={inputRef}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} h-auto resize-y py-2.5 leading-relaxed`}
    />
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white pl-2 pr-3 transition-colors hover:border-zinc-300 focus-within:border-zinc-900">
        <label className="relative size-6 shrink-0 cursor-pointer overflow-hidden rounded ring-1 ring-black/10">
          <span className="block size-full" style={{ background: value }} />
          <input
            type="color"
            aria-label={`${label} color`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[12px] uppercase text-zinc-700 outline-none"
        />
      </div>
    </Field>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <Field label={label} hint={`${value}${unit}`}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={`${label} value`}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 w-14 shrink-0 rounded-lg border border-zinc-200 px-1.5 text-center font-mono text-[11px] tabular-nums outline-none focus:border-zinc-900"
        />
      </div>
    </Field>
  );
}

export function SegmentedField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-8 flex-1 rounded-md text-[12px] font-medium transition-colors ${
              o.value === value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-left hover:bg-zinc-50"
    >
      <span>
        <span className="block text-[13px] font-medium text-zinc-800">{label}</span>
        {hint && <span className="mt-0.5 block text-[11.5px] leading-snug text-zinc-500">{hint}</span>}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-0.5 block size-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-4.5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function TokenBar({ onInsert }: { onInsert: (token: string) => void }) {
  const tokens = [
    "{{first_name}}",
    "{{last_name}}",
    "{{checkout_date}}",
    "{{hotel}}",
    "{{loyalty_tier}}",
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {tokens.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onInsert(t)}
          className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
        >
          {t.replace(/[{}]/g, "")}
        </button>
      ))}
    </div>
  );
}

export function ImageField({
  value,
  alt,
  onChange,
  onAltChange,
}: {
  value: string;
  alt: string;
  onChange: (v: string) => void;
  onAltChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-black/10">
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-[10px] text-zinc-400">
              None
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-lg bg-zinc-900 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800"
          >
            Upload image
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="w-full rounded-lg border border-zinc-200 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Remove
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChange(URL.createObjectURL(f));
              e.target.value = "";
            }}
          />
        </div>
      </div>
      <Field label="Image URL">
        <div className="flex gap-1.5">
          <input
            value={url}
            placeholder="https://…"
            onChange={(e) => setUrl(e.target.value)}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => {
              if (url.trim()) onChange(url.trim());
              setUrl("");
            }}
            className="shrink-0 rounded-lg border border-zinc-200 px-2.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Use
          </button>
        </div>
      </Field>
      <Field label="Alt text" hint="For screen readers">
        <TextInput value={alt} onChange={onAltChange} />
      </Field>
    </div>
  );
}
