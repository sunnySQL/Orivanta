import type { PlaceFeature, PlaceType } from "../types/data";

const typeLabels: Record<PlaceType, string> = {
  "national-capital": "National capital",
  "national-capital-alternate": "Alternate national capital",
  "national-region-capital": "National region capital",
  "regional-capital": "Regional capital",
  "regional-region-capital": "Regional region capital",
  "populated-place": "Populated place"
};

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0
});

export function placeTypeLabel(placeType: PlaceType): string {
  return typeLabels[placeType];
}

export function formatPopulation(place: PlaceFeature): string {
  const { minimumEstimate, maximumEstimate } = place.properties.population;

  if (minimumEstimate === null && maximumEstimate === null) {
    return "Not available";
  }

  if (
    minimumEstimate === null ||
    maximumEstimate === null ||
    minimumEstimate === maximumEstimate
  ) {
    return numberFormatter.format(maximumEstimate ?? minimumEstimate ?? 0);
  }

  return `${numberFormatter.format(minimumEstimate)}–${numberFormatter.format(maximumEstimate)}`;
}

export function formatCoordinates(place: PlaceFeature): string {
  const [longitude, latitude] = place.geometry.coordinates;
  const latitudeDirection = latitude >= 0 ? "N" : "S";
  const longitudeDirection = longitude >= 0 ? "E" : "W";

  return `${Math.abs(latitude).toFixed(2)}° ${latitudeDirection}, ${Math.abs(longitude).toFixed(2)}° ${longitudeDirection}`;
}

export function matchesPlace(place: PlaceFeature, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    place.properties.name,
    place.properties.nameAscii,
    place.properties.countryName,
    place.properties.regionName,
    place.properties.countryCode,
    placeTypeLabel(place.properties.placeType)
  ]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase().includes(normalized));
}

export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
