import type { BoundaryFeature } from "../types/data";

export const STATE_DETAIL_MAXIMUM_HEIGHT = 10_000_000;

export function isStateDetailVisible(
  cameraHeight: number | null,
  enabled: boolean
): boolean {
  return (
    enabled &&
    cameraHeight !== null &&
    cameraHeight <= STATE_DETAIL_MAXIMUM_HEIGHT
  );
}

export function visibleBoundaries(
  countries: BoundaryFeature[],
  usStates: BoundaryFeature[],
  showCountries: boolean,
  showUsStates: boolean,
  showStateDetail: boolean
): BoundaryFeature[] {
  return [
    ...(showCountries ? countries : []),
    ...(showUsStates && showStateDetail ? usStates : [])
  ];
}
