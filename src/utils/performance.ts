const PREFIX = "orivanta:";

export type PerformanceMilestone =
  | "app-start"
  | "data-ready"
  | "interface-ready"
  | "globe-ready";

export function performanceMarkName(
  milestone: PerformanceMilestone
): string {
  return `${PREFIX}${milestone}`;
}

export function markPerformance(milestone: PerformanceMilestone): void {
  if (typeof window === "undefined" || !window.performance) return;

  const name = performanceMarkName(milestone);
  if (window.performance.getEntriesByName(name, "mark").length === 0) {
    window.performance.mark(name);
  }
}
