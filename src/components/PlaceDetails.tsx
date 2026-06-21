import type { LayerManifest, PlaceFeature } from "../types/data";
import {
  formatCoordinates,
  formatPopulation,
  placeTypeLabel,
  safeExternalUrl
} from "../utils/place";

interface PlaceDetailsProps {
  place: PlaceFeature | null;
  manifest: LayerManifest;
  onClose: () => void;
}

export function PlaceDetails({
  place,
  manifest,
  onClose
}: PlaceDetailsProps) {
  if (!place) {
    return (
      <aside className="details-panel details-placeholder">
        <p className="eyebrow">Place details</p>
        <h2>Choose a point on the globe or from the list.</h2>
        <p>
          Both views use the same data and selection state. The list remains
          fully usable without operating the 3D globe.
        </p>
      </aside>
    );
  }

  const sourceUrl = safeExternalUrl(manifest.source.url);

  return (
    <aside className="details-panel" aria-labelledby="selected-place-title">
      <button
        type="button"
        className="close-button"
        onClick={onClose}
        aria-label="Close place details"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <p className="eyebrow">{placeTypeLabel(place.properties.placeType)}</p>
      <h2 id="selected-place-title">{place.properties.name}</h2>
      <p className="details-location">
        {[place.properties.regionName, place.properties.countryName]
          .filter(Boolean)
          .join(", ")}
      </p>

      <dl className="details-grid">
        <div>
          <dt>Coordinates</dt>
          <dd>{formatCoordinates(place)}</dd>
        </div>
        <div>
          <dt>Population estimate</dt>
          <dd>{formatPopulation(place)}</dd>
        </div>
        <div>
          <dt>Dataset release</dt>
          <dd>{manifest.source.version}</dd>
        </div>
        <div>
          <dt>Source scale</dt>
          <dd>{manifest.source.scale}</dd>
        </div>
      </dl>

      <p className="details-description">{place.properties.description}</p>
      {sourceUrl ? (
        <a
          className="source-link"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          View source information
          <span aria-hidden="true"> ↗</span>
        </a>
      ) : null}
    </aside>
  );
}
