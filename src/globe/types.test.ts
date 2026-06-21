import { describe, expect, it } from "vitest";
import { readEngine, writeEngine } from "./types";

describe("globe engine URL state", () => {
  it("uses Globe.gl as the default comparison candidate", () => {
    expect(readEngine("")).toBe("globe-gl");
    expect(readEngine("?engine=unknown")).toBe("globe-gl");
  });

  it("reads and writes the Cesium comparison candidate", () => {
    expect(readEngine("?engine=cesium")).toBe("cesium");
    expect(writeEngine("https://example.test/?place=one", "cesium")).toBe(
      "/?place=one&engine=cesium"
    );
  });

  it("keeps the lighter candidate URL clean", () => {
    expect(
      writeEngine("https://example.test/?place=one&engine=cesium", "globe-gl")
    ).toBe("/?place=one");
  });
});
