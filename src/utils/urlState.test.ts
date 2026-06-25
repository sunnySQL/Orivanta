import { describe, expect, it } from "vitest";
import { readUrlState, writeUrlState } from "./urlState";

describe("URL state", () => {
  it("reads a valid selected place and camera", () => {
    expect(
      readUrlState(
        "?place=natural-earth%3A1&lon=-87.63&lat=41.88&height=1800000"
      )
    ).toEqual({
      placeId: "natural-earth:1",
      boundaryId: null,
      camera: {
        longitude: -87.63,
        latitude: 41.88,
        height: 1_800_000
      }
    });
  });

  it("rejects an invalid camera without losing the selection", () => {
    expect(
      readUrlState(
        "?place=natural-earth%3A1&boundary=natural-earth%3Acountry%3A1&lat=400"
      )
    ).toEqual({
      placeId: "natural-earth:1",
      boundaryId: "natural-earth:country:1",
      camera: null
    });
  });

  it("updates place and camera while preserving unrelated parameters", () => {
    expect(
      writeUrlState("https://example.test/?mode=demo", {
        placeId: "natural-earth:1",
        boundaryId: null,
        camera: {
          longitude: -87.6298,
          latitude: 41.8781,
          height: 1_800_000.4
        }
      })
    ).toBe(
      "/?mode=demo&place=natural-earth%3A1&lon=-87.630&lat=41.878&height=1800000"
    );
  });

  it("updates boundary selection independently", () => {
    expect(
      writeUrlState("https://example.test/?place=natural-earth%3A1", {
        placeId: null,
        boundaryId: "natural-earth:country:1"
      })
    ).toBe("/?boundary=natural-earth%3Acountry%3A1");
  });
});
