import { describe, expect, it } from "vitest";
import { polygonFixtures, routeFixtures } from "./fixtures";

function isValidCoordinate([longitude, latitude]: readonly [
  number,
  number
]): boolean {
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

describe("shared globe fixtures", () => {
  it("defines valid routes with at least two positions", () => {
    expect(routeFixtures.length).toBeGreaterThan(0);

    for (const route of routeFixtures) {
      expect(route.coordinates.length).toBeGreaterThanOrEqual(2);
      expect(route.coordinates.every(isValidCoordinate)).toBe(true);
    }
  });

  it("defines closed, valid polygon rings", () => {
    expect(polygonFixtures.length).toBeGreaterThan(0);

    for (const feature of polygonFixtures) {
      const outerRing = feature.geometry.coordinates[0];
      expect(outerRing?.length).toBeGreaterThanOrEqual(4);
      expect(outerRing?.every(isValidCoordinate)).toBe(true);
      expect(outerRing?.[0]).toEqual(outerRing?.at(-1));
    }
  });

  it("uses unique fixture identifiers", () => {
    const ids = [
      ...routeFixtures.map((route) => route.id),
      ...polygonFixtures.map((polygon) => polygon.id)
    ];

    expect(new Set(ids).size).toBe(ids.length);
  });
});
