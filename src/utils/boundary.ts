import type { BoundaryFeature, LongitudeLatitude } from "../types/data";
import type { CameraState } from "./urlState";

export type BoundaryBounds = [
  west: number,
  south: number,
  east: number,
  north: number
];

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0
});

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function visitBoundaryPositions(
  boundary: BoundaryFeature,
  visit: (position: LongitudeLatitude) => void
) {
  const polygons =
    boundary.geometry.type === "Polygon"
      ? [boundary.geometry.coordinates]
      : boundary.geometry.coordinates;

  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const position of ring) {
        visit(position);
      }
    }
  }
}

export function boundaryTypeLabel(boundary: BoundaryFeature): string {
  return boundary.properties.level === "country" ? "Country" : "U.S. state";
}

export function formatBoundaryLocation(boundary: BoundaryFeature): string {
  if (boundary.properties.parentName) {
    return boundary.properties.parentName;
  }

  return boundary.properties.region ?? "Global country boundary";
}

export function boundaryBounds(boundary: BoundaryFeature): BoundaryBounds {
  const bounds: BoundaryBounds = [180, 90, -180, -90];

  visitBoundaryPositions(boundary, ([longitude, latitude]) => {
    bounds[0] = Math.min(bounds[0], longitude);
    bounds[1] = Math.min(bounds[1], latitude);
    bounds[2] = Math.max(bounds[2], longitude);
    bounds[3] = Math.max(bounds[3], latitude);
  });

  return bounds;
}

export function boundaryCenter(boundary: BoundaryFeature): LongitudeLatitude {
  const [west, south, east, north] = boundaryBounds(boundary);
  return [(west + east) / 2, (south + north) / 2];
}

export function formatBoundaryCenter(boundary: BoundaryFeature): string {
  const [longitude, latitude] = boundaryCenter(boundary);
  const latitudeDirection = latitude >= 0 ? "N" : "S";
  const longitudeDirection = longitude >= 0 ? "E" : "W";

  return `${Math.abs(latitude).toFixed(2)}° ${latitudeDirection}, ${Math.abs(longitude).toFixed(2)}° ${longitudeDirection}`;
}

export function boundaryCamera(boundary: BoundaryFeature): CameraState {
  const [west, south, east, north] = boundaryBounds(boundary);
  const [longitude, latitude] = boundaryCenter(boundary);
  const span = Math.max(Math.abs(east - west), Math.abs(north - south));
  const isState = boundary.properties.level === "us-state";
  const height = isState
    ? clamp(span * 260_000, 1_050_000, 7_000_000)
    : clamp(span * 300_000, 1_600_000, 18_000_000);

  return {
    longitude,
    latitude,
    height
  };
}

export function formatBoundaryDetailHint(boundary: BoundaryFeature): string {
  const maximumCameraHeight = boundary.properties.detail.maximumCameraHeight;

  if (maximumCameraHeight === null) {
    return "Global layer";
  }

  return `Visible below ${numberFormatter.format(
    Math.round(maximumCameraHeight / 1_000)
  )} km`;
}

export function matchesBoundary(
  boundary: BoundaryFeature,
  query: string
): boolean {
  const normalized = query.trim().toLocaleLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    boundary.properties.name,
    boundary.properties.nameAscii,
    boundary.properties.code,
    boundary.properties.parentName,
    boundary.properties.parentCode,
    boundary.properties.region,
    boundaryTypeLabel(boundary)
  ]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase().includes(normalized));
}
