import { describe, expect, it } from "vitest";
import type { BoundaryFeature } from "../types/data";
import {
  isStateDetailVisible,
  STATE_DETAIL_MAXIMUM_HEIGHT,
  visibleBoundaries
} from "./boundaries";

function boundary(id: string, level: "country" | "us-state"): BoundaryFeature {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0]
        ]
      ]
    },
    properties: {
      name: id,
      nameAscii: id,
      code: null,
      parentName: level === "us-state" ? "United States of America" : null,
      parentCode: level === "us-state" ? "USA" : null,
      level,
      region: null,
      detail: {
        maximumCameraHeight:
          level === "us-state" ? STATE_DETAIL_MAXIMUM_HEIGHT : null
      },
      description: id,
      sourceId: level === "country" ? 1 : 2
    }
  };
}

describe("progressive boundary visibility", () => {
  const countries = [boundary("country", "country")];
  const states = [boundary("state", "us-state")];

  it("keeps state detail hidden at global altitude", () => {
    expect(isStateDetailVisible(22_000_000, true)).toBe(false);
    expect(
      visibleBoundaries(countries, states, true, true, false).map(
        (feature) => feature.id
      )
    ).toEqual(["country"]);
  });

  it("reveals state detail at the configured regional altitude", () => {
    expect(isStateDetailVisible(STATE_DETAIL_MAXIMUM_HEIGHT, true)).toBe(true);
    expect(
      visibleBoundaries(countries, states, true, true, true).map(
        (feature) => feature.id
      )
    ).toEqual(["country", "state"]);
  });

  it("respects each layer toggle", () => {
    expect(visibleBoundaries(countries, states, false, true, true)).toEqual(
      states
    );
    expect(visibleBoundaries(countries, states, true, false, true)).toEqual(
      countries
    );
  });
});
