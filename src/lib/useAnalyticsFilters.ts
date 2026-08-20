import { useMemo, useState } from "react";
import { PROPERTIES, type MetricView, type Property } from "./portfolio";

export type Scope = "group" | "single";

/**
 * Shared analytics filter state. Group users get property selection + metric
 * views; single-property users keep the original totals-only experience.
 */
export function useAnalyticsFilters() {
  const [scope, setScope] = useState<Scope>("group");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => PROPERTIES.map((p) => p.id));
  const [view, setView] = useState<MetricView>("both");
  const [range, setRange] = useState("Last 30 days");

  const selected: Property[] = useMemo(() => {
    if (scope === "single") return PROPERTIES.slice(0, 1);
    const set = new Set(selectedIds);
    return PROPERTIES.filter((p) => set.has(p.id));
  }, [scope, selectedIds]);

  const effectiveView: MetricView = scope === "single" || selected.length < 2 ? "total" : view;

  return {
    scope,
    setScope,
    selectedIds,
    setSelectedIds,
    view,
    setView,
    effectiveView,
    range,
    setRange,
    selected,
  };
}
