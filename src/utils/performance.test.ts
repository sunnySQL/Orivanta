import { describe, expect, it, vi } from "vitest";
import {
  markPerformance,
  performanceMarkName
} from "./performance";

describe("performance milestones", () => {
  it("uses a project-owned namespace", () => {
    expect(performanceMarkName("globe-ready")).toBe("orivanta:globe-ready");
  });

  it("records a milestone only once", () => {
    const getEntries = vi
      .spyOn(window.performance, "getEntriesByName")
      .mockReturnValueOnce([])
      .mockReturnValueOnce([
        {
          name: "orivanta:data-ready",
          entryType: "mark",
          startTime: 1,
          duration: 0,
          toJSON: () => ({})
        }
      ]);
    const mark = vi
      .spyOn(window.performance, "mark")
      .mockImplementation(() => ({} as PerformanceMark));

    markPerformance("data-ready");
    markPerformance("data-ready");

    expect(getEntries).toHaveBeenCalledTimes(2);
    expect(mark).toHaveBeenCalledOnce();
    expect(mark).toHaveBeenCalledWith("orivanta:data-ready");

    getEntries.mockRestore();
    mark.mockRestore();
  });
});
