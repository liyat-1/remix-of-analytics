import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { BarChart3, Bell, Info, Route as RouteIcon } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/otaBuster";

const NAV: { to: string; label: string; exact?: boolean; icon: typeof BarChart3 }[] = [
  { to: "/ota", label: "Guest journey", exact: true, icon: RouteIcon },
  { to: "/ota/analytics", label: "OTA analytics", icon: BarChart3 },
];

/** Small label + value pair used across every OTA Buster surface. */
export function Stat({
  label,
  value,
  hint,
  tooltip,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: string;
  tooltip?: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {tooltip ? <Tooltip text={tooltip} /> : null}
      </div>
      <p
        className={`mt-1.5 tabular-nums tracking-tight text-slate-900 ${
          emphasis ? "text-[26px] font-semibold" : "text-[19px] font-semibold"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11.5px] leading-snug text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`More information: ${text}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="grid size-3.5 place-items-center text-slate-400 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Info size={12} />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute left-1/2 top-5 z-50 w-60 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-2 text-[11.5px] font-normal normal-case leading-snug tracking-normal text-slate-100 shadow-pop"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "info";
}) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ButtonLink({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-blue-600 text-white shadow-card hover:bg-blue-700 active:bg-blue-800",
    secondary:
      "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100",
    ghost: "text-blue-700 hover:bg-blue-50 active:bg-blue-100",
  } as const;
  return (
    <Link
      to={to as "/"}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "bg-blue-600 text-white shadow-card hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none",
    secondary:
      "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100",
    ghost: "text-blue-700 hover:bg-blue-50 active:bg-blue-100",
  } as const;
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

/** Page chrome for the whole OTA Buster program. */
export function OtaShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 lg:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white lg:h-dvh lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center gap-2 px-4 lg:px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-slate-900">
              <span className="size-2 rotate-45 bg-white" />
            </span>
            <span className="text-[13px] font-semibold tracking-tight">Directful</span>
          </Link>
        </div>
        <nav aria-label="OTA Buster sections" className="px-3 pb-3 lg:px-3">
          <p className="hidden px-2 pb-1.5 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:block">
            OTA Buster
          </p>
          <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-0.5 lg:overflow-visible">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as "/"}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-[12.5px] font-semibold transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon size={14} className={active ? "text-blue-600" : "text-slate-400"} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-slate-900">OTA Buster</span>
              <Pill tone="good">
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                Active
              </Pill>
            </div>
            <div className="relative">
              <button
                onClick={() => setBellOpen((o) => !o)}
                aria-label="Notifications"
                aria-expanded={bellOpen}
                className="relative grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Bell size={14} />
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-white">
                  {NOTIFICATIONS.length}
                </span>
              </button>
              {bellOpen ? (
                <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop">
                  <p className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    What needs you
                  </p>
                  <ul>
                    {NOTIFICATIONS.map((n) => (
                      <li key={n.text} className="flex gap-2.5 border-b border-slate-100 px-3 py-2.5 last:border-0">
                        <span
                          aria-hidden
                          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                            n.tone === "issue" || n.tone === "recovery" ? "bg-amber-500" : "bg-blue-600"
                          }`}
                        />
                        <span className="text-[12.5px] leading-snug text-slate-700">{n.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[84rem] px-4 pb-24 pt-7 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
