import { useState } from "react";
import { Star, Reply, Forward, MoreHorizontal, Archive, Trash2, Search, Inbox } from "lucide-react";
import { EmailPreview } from "./EmailPreview";
import type { Campaign } from "@/lib/campaign";
import { renderTokens } from "@/lib/campaign";
import { stripHtml } from "@/lib/richtext";

type Client = "gmail" | "outlook";

const OTHERS = [
  { from: "Booking.com", subject: "Your trip to Athens is coming up", snippet: "Check-in details and directions", time: "8:12 AM" },
  { from: "Aegean Miles+Bonus", subject: "You earned 1,240 miles", snippet: "Statement for this month is ready", time: "Yesterday" },
  { from: "Google", subject: "Security alert", snippet: "New sign-in on Mac", time: "Yesterday" },
];

/** Realistic Gmail / Outlook simulation: list view and opened-message view. */
export function InboxPreview({ campaign }: { campaign: Campaign }) {
  const [client, setClient] = useState<Client>("gmail");
  const [opened, setOpened] = useState(true);

  const subject = renderTokens(campaign.meta.subject);
  const preheader = stripHtml(renderTokens(campaign.meta.preheader));
  const initial = campaign.meta.fromName.charAt(0).toUpperCase();
  const gmail = client === "gmail";

  return (
    <div className="mx-auto w-full max-w-[820px] space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="min-w-0 truncate text-[12px] text-zinc-500">
          Exactly how this campaign lands in a real inbox.
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex rounded-md bg-zinc-200/70 p-0.5 text-[11px]">
            {(["gmail", "outlook"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setClient(c)}
                aria-pressed={client === c}
                className={`rounded px-2.5 py-1 font-medium capitalize ${
                  client === c ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOpened((v) => !v)}
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {opened ? "Show inbox list" : "Open the email"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm">
        {/* Client chrome */}
        <div
          className="flex items-center gap-3 border-b px-4 py-2.5"
          style={
            gmail
              ? { background: "#f6f8fc", borderColor: "#e3e6ea" }
              : { background: "#0f6cbd", borderColor: "#0f6cbd" }
          }
        >
          <span className={`text-[13px] font-semibold ${gmail ? "text-zinc-700" : "text-white"}`}>
            {gmail ? "Gmail" : "Outlook"}
          </span>
          <div
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-1.5 text-[12px] ${
              gmail ? "bg-[#eaf1fb] text-zinc-500" : "bg-white/20 text-white/80"
            }`}
          >
            <Search size={13} />
            <span className="truncate">Search mail</span>
          </div>
          <span className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold text-white`} style={{ background: gmail ? "#1a73e8" : "#ffffff33" }}>
            L
          </span>
        </div>

        {opened ? (
          <div>
            <div className="flex items-center gap-1 border-b border-zinc-200 px-4 py-2 text-zinc-500">
              <Archive size={15} /><Trash2 size={15} className="ml-2" /><Reply size={15} className="ml-2" />
              <Forward size={15} className="ml-2" /><MoreHorizontal size={15} className="ml-2" />
            </div>
            <div className="px-5 py-4">
              <h2 className="text-[19px] font-normal text-zinc-900">{subject}</h2>
              <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full text-[14px] font-semibold text-white"
                  style={{ background: campaign.theme.accent }}
                >
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px]">
                    <span className="font-semibold text-zinc-900">{campaign.meta.fromName}</span>{" "}
                    <span className="text-zinc-500">&lt;{campaign.meta.fromEmail}&gt;</span>
                  </p>
                  <p className="truncate text-[12px] text-zinc-500">
                    to me · {preheader}
                  </p>
                </div>
                <span className="shrink-0 text-[11.5px] text-zinc-400">7:48 AM</span>
              </div>
            </div>
            <div className="border-t border-zinc-100 bg-zinc-50 p-5">
              <EmailPreview campaign={campaign} interactive={false} width={campaign.theme.contentWidth} />
            </div>
            <div className="flex gap-2 border-t border-zinc-200 px-5 py-3">
              <span className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-[12px] text-zinc-600">
                <Reply size={13} /> Reply
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-[12px] text-zinc-600">
                <Forward size={13} /> Forward
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2 text-[12px] font-medium text-zinc-600">
              <Inbox size={14} /> Primary
            </div>
            <button
              onClick={() => setOpened(true)}
              className="grid w-full grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-2.5 text-left hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
              style={{ borderColor: "#eceff1", background: gmail ? "#fff" : "#f5f9ff" }}
            >
              <Star size={15} className="shrink-0 text-zinc-300" />
              <span className="w-32 shrink-0 truncate text-[13px] font-bold text-zinc-900">
                {campaign.meta.fromName}
              </span>
              <span className="min-w-0 truncate text-[13px] text-zinc-900">
                <span className="font-bold">{subject}</span>
                <span className="text-zinc-500"> — {preheader}</span>
              </span>
              <span className="shrink-0 text-[11.5px] font-semibold text-zinc-700">7:48 AM</span>
            </button>
            {OTHERS.map((o) => (
              <div
                key={o.from}
                className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-100 px-4 py-2.5 opacity-70"
              >
                <Star size={15} className="shrink-0 text-zinc-300" />
                <span className="w-32 shrink-0 truncate text-[13px] text-zinc-700">{o.from}</span>
                <span className="min-w-0 truncate text-[13px] text-zinc-600">
                  {o.subject} <span className="text-zinc-400">— {o.snippet}</span>
                </span>
                <span className="shrink-0 text-[11.5px] text-zinc-400">{o.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
