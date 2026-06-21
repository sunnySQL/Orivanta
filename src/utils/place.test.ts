import { describe, expect, it } from "vitest";
import type { PlaceFeature } from "../types/data";
import {
  formatCoordinates,
  formatPopulation,
  matchesPlace,
  placeTypeLabel,
  safeExternalUrl
} from "./place";

const place: PlaceFeature = {
  type: "Feature",
  id: "natural-earth:1",
  geometry: {
    type: "Point",
    coordinates: [-87.6298, 41.8781]
  },
  properties: {
    name: "Chicago",
    nameAscii: "Chicago",
    countryName: "United States of America",
    countryCode: "US",
    regionName: "Illinois",
    placeType: "populated-place",
    capitalLevel: null,
    population: {
      minimumEstimate: 2_700_000,
      maximumEstimate: 9_500_000
    },
    ranking: {
      scaleRank: 1,
      labelRank: 1,
      minimumZoom: 2
    },
    description: "A sample place.",
    sourceId: 1
  }
};

describe("place utilities", () => {
  it("searches across names, regions, countries, codes, and types", () => {
    expect(matchesPlace(place, "chica")).toBe(true);
    expect(matchesPlace(place, "illinois")).toBe(true);
    expect(matchesPlace(place, "US")).toBe(true);
    expect(matchesPlace(place, "populated")).toBe(true);
    expect(matchesPlace(place, "tokyo")).toBe(false);
  });

  it("formats an estimated population range", () => {
    expect(formatPopulation(place)).toBe("2,700,000–9,500,000");
  });

  it("formats coordinates with cardinal directions", () => {
    expect(formatCoordinates(place)).toBe("41.88° N, 87.63° W");
  });

  it("uses readable place type labels", () => {
    expect(placeTypeLabel("national-capital-alternate")).toBe(
      "Alternate national capital"
    );
  });

  it("allows HTTPS source links and rejects unsafe URL schemes", () => {
    expect(safeExternalUrl("https://example.com/source")).toBe(
      "https://example.com/source"
    );
    expect(safeExternalUrl("javascript:alert(document.cookie)")).toBeNull();
    expect(safeExternalUrl("http://example.com/source")).toBeNull();
    expect(safeExternalUrl("not a URL")).toBeNull();
  });
});
