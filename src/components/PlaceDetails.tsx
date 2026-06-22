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
  placeCount: number;
  capitalCount: number;
  collapsed: boolean;
  onClose: () => void;
  onCollapse: () => void;
  onExploreRandom: () => void;
  onOpenHelp: () => void;
  onShare: () => void;
}

export function PlaceDetails({
  place,
  manifest,
  placeCount,
  capitalCount,
  collapsed,
  onClose,
  onCollapse,
  onExploreRandom,
  onOpenHelp,
  onShare
}: PlaceDetailsProps) {
  if (!place) {
    return (
      <aside className="details-panel details-placeholder" hidden={collapsed}>
        <button
          type="button"
          className="panel-collapse-button details-collapse-button"
          onClick={onCollapse}
          aria-label="Collapse place details"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m10 6 6 6-6 6" />
          </svg>
        </button>
        <div className="placeholder-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">Ready to explore</p>
        <h2>Choose a point on the globe or from the list.</h2>
        <p>
          Navigate a curated world atlas with synchronized spatial data,
          accessible details, and shareable views.
        </p>
        <dl className="workspace-stats">
          <div>
            <dt>Locations</dt>
            <dd>{placeCount}</dd>
          </div>
          <div>
            <dt>Capitals</dt>
            <dd>{capitalCount}</dd>
          </div>
          <div>
            <dt>Coverage</dt>
            <dd>Global</dd>
          </div>
        </dl>
        <div className="placeholder-actions">
          <button
            type="button"
            className="primary-action"
            onClick={onExploreRandom}
          >
            Explore a random place
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={onOpenHelp}
          >
            View shortcuts
          </button>
        </div>
      </aside>
    );
  }

  const sourceUrl = safeExternalUrl(manifest.source.url);

  return (
    <aside
      className="details-panel"
      aria-labelledby="selected-place-title"
      hidden={collapsed}
    >
      <button
        type="button"
        className="panel-collapse-button details-collapse-button"
        onClick={onCollapse}
        aria-label="Collapse place details"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m10 6 6 6-6 6" />
        </svg>
      </button>
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
      <div className="details-header">
        <span className="details-type">
          <span aria-hidden="true" />
          {placeTypeLabel(place.properties.placeType)}
        </span>
        <h2 id="selected-place-title">{place.properties.name}</h2>
        <p className="details-location">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.2" />
          </svg>
          {[place.properties.regionName, place.properties.countryName]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>

      <dl className="details-grid">
        <div>
          <span className="metric-icon" aria-hidden="true">⌖</span>
          <dt>Coordinates</dt>
          <dd>{formatCoordinates(place)}</dd>
        </div>
        <div>
          <span className="metric-icon" aria-hidden="true">◌</span>
          <dt>Population estimate</dt>
          <dd>{formatPopulation(place)}</dd>
        </div>
        <div>
          <span className="metric-icon" aria-hidden="true">◇</span>
          <dt>Dataset release</dt>
          <dd>{manifest.source.version}</dd>
        </div>
        <div>
          <span className="metric-icon" aria-hidden="true">↗</span>
          <dt>Source scale</dt>
          <dd>{manifest.source.scale}</dd>
        </div>
      </dl>

      <div className="details-section-heading">
        <span>About this place</span>
        <span className="verified-badge">Verified source</span>
      </div>
      <p className="details-description">{place.properties.description}</p>

      <div className="details-actions">
        <button type="button" className="primary-action" onClick={onShare}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M8.5 12.5 15.5 8m-7 3.5 7 4.5M18 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-1a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          </svg>
          Share this view
        </button>
        <button
          type="button"
          className="secondary-action"
          onClick={onExploreRandom}
        >
          Next place
        </button>
      </div>

      {sourceUrl ? (
        <a
          className="source-link"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span>
            <strong>{manifest.source.publisher}</strong>
            <small>View source information</small>
          </span>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5" />
          </svg>
        </a>
      ) : null}
    </aside>
  );
}
