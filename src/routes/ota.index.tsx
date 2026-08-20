import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { CheckCircle2, Users } from "lucide-react";
import { Select } from "@/components/editor/Select";
import { StageCard, StageTimingRail } from "@/components/ota/JourneyPieces";
import { StageCampaignOverlay } from "@/components/ota/StageCampaignOverlay";
import { StagePreviewOverlay } from "@/components/ota/StagePreviewOverlay";
import { audienceCount, PERIODS, STAGES, type Period } from "@/lib/otaJourney";
import { DEFAULT_STAGE_TIMING, type StageTiming } from "@/lib/stageTiming";
import { DEFAULT_STRATEGY } from "@/lib/otaStrategy";
import { CampaignStrategyPanel } from "@/components/ota/CampaignStrategyPanel";

export const Route = createFileRoute("/ota/")({
  head: () => ({
    meta: [
      { title: "Guest journey — OTA Buster · Directful" },
      {
        name: "description",
        content:
          "The full OTA guest journey in one vertical view: who enters, what each stage sends, and when guests move on.",
      },
      { property: "og:title", content: "Guest journey — OTA Buster" },
      {
        property: "og:description",
        content:
          "Five stages from booking to return stay, with the timing rules that move each guest forward.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JourneyScreen,
});

function JourneyScreen() {
  const [period, setPeriod] = useState<Period>("30d");
  const [editId, setEditId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [timings, setTimings] = useState(DEFAULT_STAGE_TIMING);
  const [strategies, setStrategies] = useState(DEFAULT_STRATEGY);
  const [paused, setPaused] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STAGES.map((s) => [s.id, s.status === "paused"])),
  );
  const editStage = STAGES.find((s) => s.id === editId) ?? null;
  const previewStage = STAGES.find((s) => s.id === previewId) ?? null;




  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            OTA Buster
          </p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-tight text-slate-900">
            Guest journey
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-slate-600">
            Every OTA guest enters here and moves down as they become eligible for the next stage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-medium text-slate-500">Period</span>
          <div className="w-40">
            <Select
              value={period}
              options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
              onChange={(v) => setPeriod(v)}
              size="sm"
              align="right"
              ariaLabel="Reporting period"
            />
          </div>
        </div>
      </header>

      <CampaignStrategyPanel
        strategies={strategies}
        onApply={(stages, strategy) =>
          setStrategies((prev) => ({
            ...prev,
            ...Object.fromEntries(stages.map((id) => [id, strategy])),
          }))
        }
      />

      {/* Audience entry */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              <Users size={17} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                Guests entering the journey
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                Anyone who books through Booking.com, Expedia or Airbnb and can be contacted.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium text-slate-500">
              {PERIODS.find((p) => p.value === period)?.label}
            </p>
            <p className="text-[22px] font-semibold tabular-nums tracking-tight text-slate-900">
              {audienceCount(period)}
            </p>
          </div>
        </div>
      </section>

      {/* Stages joined by transition rails */}
      <div>
        {STAGES.map((stage, i) => (
          <Fragment key={stage.id}>
            <StageTimingRail
              stage={stage}
              first={i === 0}
              timing={timings[stage.id]}
              onChange={
                stage.id === "just_booked"
                  ? undefined
                  : (t: StageTiming) => setTimings((prev) => ({ ...prev, [stage.id]: t }))
              }
            />
            <StageCard
              stage={stage}
              period={period}
              index={i}
              total={STAGES.length}
              strategy={strategies[stage.id]}
              paused={paused[stage.id]}
              onTogglePause={() =>
                setPaused((prev) => ({ ...prev, [stage.id]: !prev[stage.id] }))
              }
              onChangeStrategy={() =>
                document
                  .getElementById("campaign-strategy")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              onPreview={() => setPreviewId(stage.id)}
              onEdit={() => setEditId(stage.id)}
            />
          </Fragment>
        ))}
      </div>

      {/* End marker */}
      <div className="relative pl-[27px]">
        <span aria-hidden className="absolute left-[27px] top-0 h-6 w-px bg-slate-200" />
        <div className="ml-5 mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span className="text-[13px] font-semibold text-emerald-800">Journey complete</span>
          <span className="text-[12.5px] text-emerald-700">
            The guest is now a known, returning direct guest.
          </span>
        </div>
      </div>

      {editStage ? (
        <StageCampaignOverlay stage={editStage} onClose={() => setEditId(null)} />
      ) : null}
      {previewStage ? (
        <StagePreviewOverlay stage={previewStage} onClose={() => setPreviewId(null)} />
      ) : null}
    </div>
  );
}
