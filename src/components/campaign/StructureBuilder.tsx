import { Plus, Flag, Play, Mail, MessageSquare, Copy, Trash2, Settings2, Clock } from "lucide-react";
import { Select } from "../editor/Select";
import { StepMenu } from "./StepMenu";
import { DELAY_UNITS, type DelayUnit, type SequenceStep } from "@/lib/sequence";

/* ---------------- shared timeline primitives ---------------- */

export function Connector({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <span className="h-5 w-px bg-zinc-200" />
      {children}
      {children && <span className="h-5 w-px bg-zinc-200" />}
    </div>
  );
}

export function Endpoint({ label, start }: { label: string; start?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
      {start ? <Play size={11} /> : <Flag size={11} />}
      {label}
    </div>
  );
}

export function ChannelPill({ channel }: { channel: "email" | "text" }) {
  const Icon = channel === "email" ? Mail : MessageSquare;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-600">
      <Icon size={11} className="text-zinc-400" />
      {channel === "email" ? "Email" : "Text"}
    </span>
  );
}

export function DelayControl({
  delay,
  onChange,
}: {
  delay: SequenceStep["delay"];
  onChange: (d: SequenceStep["delay"]) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5">
      <Clock size={12} className="text-zinc-400" />
      <span className="text-[11.5px] font-medium text-zinc-500">Wait</span>
      <input
        type="number"
        min={1}
        aria-label="Delay amount"
        value={delay.value}
        onChange={(e) => onChange({ ...delay, value: Math.max(1, Number(e.target.value) || 1) })}
        className="w-12 border border-zinc-200 px-1.5 py-1 text-center text-[12px] font-semibold text-zinc-900 outline-none focus:border-blue-600"
      />
      <div className="w-[104px]">
        <Select
          ariaLabel="Delay unit"
          value={delay.unit}
          options={DELAY_UNITS}
          onChange={(v) => onChange({ ...delay, unit: v as DelayUnit })}
        />
      </div>
    </div>
  );
}

/* ---------------- structure builder (Preferences) ---------------- */

export function StructureBuilder({
  steps,
  email,
  text,
  onAdd,
  onDuplicate,
  onDelete,
  onDelay,
  onConfigure,
}: {
  steps: SequenceStep[];
  email: boolean;
  text: boolean;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onDelay: (id: string, d: SequenceStep["delay"]) => void;
  onConfigure: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Endpoint label="Campaign starts" start />
      {steps.map((s, i) => (
        <div key={s.id}>
          {s.kind === "followup" && (
            <Connector>
              <DelayControl delay={s.delay} onChange={(d) => onDelay(s.id, d)} />
            </Connector>
          )}
          {s.kind === "initial" && <Connector />}
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center text-[11px] font-semibold ${
                    s.kind === "initial" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-zinc-900">{s.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-zinc-500">
                    {s.kind === "initial"
                      ? "Sent when the campaign starts"
                      : "Sent after the previous message"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {email && <ChannelPill channel="email" />}
                    {text && <ChannelPill channel="text" />}
                  </div>
                </div>
              </div>
              <StepMenu
                label={`${s.name} actions`}
                items={[
                  { label: "Configure content", icon: Settings2, onSelect: onConfigure },
                  ...(s.kind === "followup"
                    ? [
                        { label: "Duplicate", icon: Copy, onSelect: () => onDuplicate(s.id) },
                        {
                          label: "Delete step",
                          icon: Trash2,
                          destructive: true,
                          separated: true,
                          onSelect: () => onDelete(s.id),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </div>
        </div>
      ))}

      <Connector />
      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-zinc-300 bg-white py-3 text-[12.5px] font-semibold text-zinc-600 transition-colors hover:border-blue-600 hover:text-blue-700"
      >
        <Plus size={15} /> Add follow-up
      </button>
      <Connector />
      <Endpoint label="Campaign ends" />
    </div>
  );
}
