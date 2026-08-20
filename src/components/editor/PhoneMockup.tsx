import { Wifi, BatteryFull, SignalHigh } from "lucide-react";

/**
 * Refreshed iPhone 15 Pro-style frame: polished titanium rail with a warm
 * highlight, extra-thin bezel, refined Dynamic Island and a subtle screen
 * glass reflection. API unchanged.
 */
export function PhoneMockup({
  children,
  scale = 1,
  statusBar = true,
  time = "9:41",
  chrome,
  contentClassName = "bg-white",
}: {
  children: React.ReactNode;
  scale?: number;
  statusBar?: boolean;
  time?: string;
  chrome?: React.ReactNode;
  contentClassName?: string;
}) {
  const W = 393;
  const H = 812;
  return (
    <div className="relative" style={{ width: W * scale, height: H * scale }} aria-hidden={false}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        {/* Outer titanium rail */}
        <div
          className="relative size-full rounded-[3.75rem] p-[2.5px] shadow-[0_60px_140px_-40px_rgba(9,9,11,0.6),0_25px_60px_-25px_rgba(9,9,11,0.5)]"
          style={{
            background:
              "linear-gradient(150deg,#e4e4e7 0%,#a1a1aa 18%,#52525b 44%,#3f3f46 55%,#71717a 78%,#e4e4e7 100%)",
          }}
        >
          {/* Rail highlight rings */}
          <div className="pointer-events-none absolute inset-[2.5px] rounded-[3.6rem] ring-[1.5px] ring-inset ring-white/12" />
          <div className="pointer-events-none absolute inset-[3.5px] rounded-[3.55rem] ring-[1px] ring-inset ring-black/30" />

          {/* Side buttons — thinner, slightly recessed */}
          <span className="absolute -left-[3px] top-[122px] h-[30px] w-[3px] rounded-l-md bg-gradient-to-r from-zinc-400 to-zinc-700 shadow-[inset_-1px_0_0_rgba(0,0,0,0.4)]" />
          <span className="absolute -left-[3px] top-[172px] h-14 w-[3px] rounded-l-md bg-gradient-to-r from-zinc-400 to-zinc-700 shadow-[inset_-1px_0_0_rgba(0,0,0,0.4)]" />
          <span className="absolute -left-[3px] top-[240px] h-14 w-[3px] rounded-l-md bg-gradient-to-r from-zinc-400 to-zinc-700 shadow-[inset_-1px_0_0_rgba(0,0,0,0.4)]" />
          <span className="absolute -right-[3px] top-[208px] h-24 w-[3px] rounded-r-md bg-gradient-to-l from-zinc-400 to-zinc-700 shadow-[inset_1px_0_0_rgba(0,0,0,0.4)]" />

          {/* Bezel */}
          <div className="relative size-full overflow-hidden rounded-[3.5rem] bg-black p-[6px]">
            {/* Screen */}
            <div
              className={`relative flex size-full flex-col overflow-hidden rounded-[3.05rem] ring-1 ring-inset ring-white/5 ${contentClassName}`}
            >
              {statusBar && (
                <div className="relative z-20 flex h-[54px] shrink-0 items-end justify-between px-9 pb-1.5">
                  <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
                    {time}
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-900">
                    <SignalHigh size={16} strokeWidth={2.5} />
                    <Wifi size={16} strokeWidth={2.5} />
                    <BatteryFull size={19} strokeWidth={2} />
                  </div>
                </div>
              )}

              {/* Dynamic Island */}
              <div className="pointer-events-none absolute left-1/2 top-[11px] z-30 h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_2px_rgba(255,255,255,0.04)]">
                <span className="absolute right-3.5 top-1/2 size-[9px] -translate-y-1/2 rounded-full bg-[#0a0a0f] ring-[1.5px] ring-zinc-800/70">
                  <span className="absolute inset-[2px] rounded-full bg-gradient-to-br from-zinc-700/60 to-transparent" />
                </span>
                <span className="absolute left-4 top-1/2 size-[6px] -translate-y-1/2 rounded-full bg-zinc-800/70" />
              </div>

              {/* Subtle glass reflection */}
              <div
                className="pointer-events-none absolute inset-0 z-40 rounded-[3.05rem]"
                style={{
                  background:
                    "linear-gradient(115deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0) 22%,rgba(255,255,255,0) 78%,rgba(255,255,255,0.05) 100%)",
                }}
              />

              {chrome}

              <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>

              {/* Home indicator */}
              <div className="relative z-20 flex h-6 shrink-0 items-center justify-center">
                <span className="h-[5px] w-[134px] rounded-full bg-zinc-900/85" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
