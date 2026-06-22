import { polygonFixtures, routeFixtures } from "../globe/fixtures";

interface FoundationFixturesProps {
  showRoutes: boolean;
  showRegions: boolean;
  onShowRoutesChange: (visible: boolean) => void;
  onShowRegionsChange: (visible: boolean) => void;
}

export function FoundationFixtures({
  showRoutes,
  showRegions,
  onShowRoutesChange,
  onShowRegionsChange
}: FoundationFixturesProps) {
  const activeLayers = Number(showRoutes) + Number(showRegions) + 1;

  return (
    <details className="fixture-summary">
      <summary>
        <span className="summary-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m12 3 8 4-8 4-8-4 8-4Zm8 9-8 4-8-4m16 5-8 4-8-4" />
          </svg>
        </span>
        Layers
        <span className="active-layer-count">{activeLayers}</span>
      </summary>
      <div className="layer-menu">
        <div className="layer-menu-heading">
          <div>
            <strong>Map layers</strong>
            <span>Control visible globe data</span>
          </div>
          <span className="live-badge">Live</span>
        </div>

        <div className="layer-option is-locked">
          <span className="fixture-swatch fixture-points" aria-hidden="true" />
          <span>
            <strong>World places</strong>
            <small>243 geographic points</small>
          </span>
          <span className="layer-lock" aria-label="Required layer">
            On
          </span>
        </div>

        <label className="layer-option">
          <span className="fixture-swatch fixture-route" aria-hidden="true" />
          <span>
            <strong>Global routes</strong>
            <small>{routeFixtures[0]?.name}</small>
          </span>
          <input
            type="checkbox"
            checked={showRoutes}
            onChange={(event) => onShowRoutesChange(event.target.checked)}
          />
          <span className="toggle" aria-hidden="true" />
        </label>

        <label className="layer-option">
          <span className="fixture-swatch fixture-polygon" aria-hidden="true" />
          <span>
            <strong>Focus regions</strong>
            <small>{polygonFixtures[0]?.properties.name}</small>
          </span>
          <input
            type="checkbox"
            checked={showRegions}
            onChange={(event) => onShowRegionsChange(event.target.checked)}
          />
          <span className="toggle" aria-hidden="true" />
        </label>
      </div>
    </details>
  );
}
