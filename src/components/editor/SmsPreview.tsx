import { ChevronLeft, Info, Camera, AppWindow, Mic } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";
import { renderTokens } from "@/lib/campaign";

/** iMessage-style SMS preview inside the shared iPhone frame. */
export function SmsPreview({
  message,
  link,
  imageUrl,
  sender = "Hellas Gadgets",
  scale = 0.78,
}: {
  message: string;
  link?: string;
  imageUrl?: string | null;
  sender?: string;
  scale?: number;
}) {
  return (
    <PhoneMockup
      scale={scale}
      contentClassName="bg-white"
      chrome={
        <div className="relative z-20 flex shrink-0 items-center justify-between border-b border-zinc-200/80 bg-zinc-50/90 px-4 py-2.5 backdrop-blur">
          <ChevronLeft size={22} className="text-blue-500" strokeWidth={2.5} />
          <div className="flex flex-col items-center">
            <span className="grid size-7 place-items-center rounded-full bg-zinc-300 text-[10px] font-semibold text-white">
              {sender.slice(0, 2).toUpperCase()}
            </span>
            <span className="mt-0.5 text-[10.5px] font-medium text-zinc-700">{sender}</span>
          </div>
          <Info size={20} className="text-blue-500" />
        </div>
      }
    >
      <div className="space-y-2 px-3.5 py-4">
        <p className="mb-1 text-center text-[10.5px] font-medium text-zinc-400">
          Text Message · Today 5:00 PM
        </p>
        {imageUrl && (
          <div className="max-w-[75%] overflow-hidden rounded-[1.35rem] rounded-bl-md bg-zinc-100">
            <img src={imageUrl} alt="" className="block h-40 w-full object-cover" />
          </div>
        )}
        <div className="max-w-[85%] rounded-[1.35rem] rounded-bl-md bg-zinc-200 px-3.5 py-2.5">
          <p className="whitespace-pre-wrap text-[14.5px] leading-[1.35] text-zinc-900">
            {renderTokens(message)}
          </p>
          {link && (
            <p className="mt-1 break-all text-[14px] leading-[1.35] text-blue-600 underline">
              {link}
            </p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto flex items-center gap-2.5 border-t border-zinc-200/80 bg-white/95 px-3 py-2.5 backdrop-blur">
        <Camera size={20} className="shrink-0 text-zinc-500" />
        <AppWindow size={20} className="shrink-0 text-zinc-500" />
        <div className="flex h-8 flex-1 items-center justify-between rounded-full border border-zinc-300 px-3">
          <span className="text-[13px] text-zinc-400">iMessage</span>
          <Mic size={15} className="text-zinc-400" />
        </div>
      </div>
    </PhoneMockup>
  );
}
