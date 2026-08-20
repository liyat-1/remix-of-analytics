import { Check, AlertTriangle, Mail, MessageSquare, Layout, PartyPopper } from "lucide-react";
import type { SequenceStep } from "@/lib/sequence";
import type { ExperienceItem } from "@/lib/experience";

const ELEMENT_ICON = {
  email: Mail,
  text: MessageSquare,
  landing: Layout,
  success: PartyPopper,
} as const;

type CheckItem = { label: string; ok: boolean };

export function ReadinessPanel({
  checks,
  missing,
  onReview,
}: {
  checks: CheckItem[];
  missing: { step: SequenceStep; item: ExperienceItem }[];
  onReview: () => void;
}) {
  const ready = missing.length === 0 && checks.every((c) => c.ok);
  return (
    <div className={`overflow-hidden rounded-xl border ${ready ? "border-emerald-200" : "border-amber-200"} bg-white shadow-sm shadow-zinc-900/5`}>
      <div
        className={`flex items-center gap-2.5 px-4 py-3 ${
          ready ? "bg-emerald-50/70" : "bg-amber-50/70"
        }`}
      >
        {ready ? (
          <Check size={15} className="text-emerald-600" />
        ) : (
          <AlertTriangle size={15} className="text-amber-600" />
        )}
        <p
          className={`text-[13px] font-semibold ${ready ? "text-emerald-900" : "text-amber-900"}`}
        >
          {ready ? "Campaign ready to launch" : "Almost ready"}
        </p>
      </div>

      <ul className="divide-y divide-zinc-100">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2.5 px-4 py-2.5">
            {c.ok ? (
              <Check size={13} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle size={13} className="shrink-0 text-amber-500" />
            )}
            <span className={`text-[12.5px] ${c.ok ? "text-zinc-700" : "text-amber-800"}`}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>

      {missing.length > 0 && (
        <div className="border-t border-zinc-100 p-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            {missing.length} element{missing.length > 1 ? "s need" : " needs"} attention
          </p>
          <ul className="space-y-1.5">
            {missing.map(({ step, item }) => {
              const Icon = ELEMENT_ICON[item.key];
              return (
              <li
                key={`${step.id}-${item.key}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2 text-[12px] text-zinc-700">
                  <Icon size={13} className="text-zinc-400" />
                  <span className="truncate">
                    {item.label} — {step.name}
                  </span>
                </span>
                <button
                  onClick={onReview}
                  className="h-7 shrink-0 rounded-lg border border-zinc-200 px-2.5 text-[11.5px] font-semibold text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  Review
                </button>
              </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
