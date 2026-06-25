import { describe, expect, it } from "vitest";
import type { BoundaryFeature } from "../types/data";
import {
  boundaryBounds,
  boundaryCamera,
  boundaryCenter,
  boundaryTypeLabel,
  formatBoundaryCenter,
  matchesBoundary
} from "./boundary";

function boundary(level: "country" | "us-state"): BoundaryFeature {
  return {
    type: "Feature",
    id: `natural-earth:${level}:1`,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-101, 30],
          [-91, 30],
          [-91, 36],
          [-101, 30]
        ]
      ]
    },
    properties: {
      name: level === "country" ? "Exampleland" : "Texas",
      nameAscii: level === "country" ? "Exampleland" : "Texas",
      code: level === "country" ? "EXL" : "US-TX",
      parentName: level === "country" ? null : "United States of America",
      parentCode: level === "country" ? null : "USA",
      level,
      region: level === "country" ? "North America" : "South",
      detail: {
        maximumCameraHeight: level === "country" ? null : 10_000_000
      },
      description: "A sample boundary.",
      sourceId: 1
    }
  };
}

describe("boundary utilities", () => {
  it("searches names, codes, regions, parents, and labels", () => {
    const texas = boundary("us-state");

    expect(matchesBoundary(texas, "tex")).toBe(true);
    expect(matchesBoundary(texas, "US-TX")).toBe(true);
    expect(matchesBoundary(texas, "united states")).toBe(true);
    expect(matchesBoundary(texas, "state")).toBe(true);
    expect(matchesBoundary(texas, "tokyo")).toBe(false);
  });

  it("calculates bounds, center, and display labels", () => {
    const texas = boundary("us-state");

    expect(boundaryBounds(texas)).toEqual([-101, 30, -91, 36]);
    expect(boundaryCenter(texas)).toEqual([-96, 33]);
    expect(formatBoundaryCenter(texas)).toBe("33.00° N, 96.00° W");
    expect(boundaryTypeLabel(texas)).toBe("U.S. state");
  });

  it("creates regional camera targets for selected boundaries", () => {
    const texas = boundary("us-state");
    const camera = boundaryCamera(texas);

    expect(camera.longitude).toBe(-96);
    expect(camera.latitude).toBe(33);
    expect(camera.height).toBeLessThanOrEqual(10_000_000);
  });
});
