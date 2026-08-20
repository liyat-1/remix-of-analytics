import { useCallback, useRef, useState } from "react";
import type { Campaign } from "./campaign";

export function useCampaign(initial: () => Campaign) {
  const [campaign, setCampaign] = useState<Campaign>(initial);
  const past = useRef<Campaign[]>([]);
  const future = useRef<Campaign[]>([]);
  const [, force] = useState(0);

  const update = useCallback((fn: (draft: Campaign) => void) => {
    setCampaign((prev) => {
      past.current = [...past.current.slice(-49), prev];
      future.current = [];
      const next = JSON.parse(JSON.stringify(prev)) as Campaign;
      fn(next);
      return next;
    });
    force((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    setCampaign((prev) => {
      const last = past.current.pop();
      if (!last) return prev;
      future.current = [prev, ...future.current];
      return last;
    });
    force((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    setCampaign((prev) => {
      const [next, ...rest] = future.current;
      if (!next) return prev;
      future.current = rest;
      past.current = [...past.current, prev];
      return next;
    });
    force((n) => n + 1);
  }, []);

  return {
    campaign,
    update,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
