interface BoundaryLayersProps {
  status: "loading" | "ready" | "error";
  placeCount: number;
  countryCount: number;
  usStateCount: number;
  showCountries: boolean;
  showUsStates: boolean;
  stateDetailVisible: boolean;
  onShowCountriesChange: (visible: boolean) => void;
  onShowUsStatesChange: (visible: boolean) => void;
}

export function BoundaryLayers({
  status,
  placeCount,
  countryCount,
  usStateCount,
  showCountries,
  showUsStates,
  stateDetailVisible,
  onShowCountriesChange,
  onShowUsStatesChange
}: BoundaryLayersProps) {
  const activeLayers =
    1 +
    Number(status === "ready" && showCountries) +
    Number(status === "ready" && showUsStates);
  const unavailable = status !== "ready";
  const statusLabel =
    status === "loading"
      ? "Loading"
      : status === "error"
        ? "Unavailable"
        : "Live";

  return (
    <details className="layer-summary">
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
          <span className={`live-badge is-${status}`}>{statusLabel}</span>
        </div>

        <div className="layer-option is-locked">
          <span className="layer-swatch layer-points" aria-hidden="true" />
          <span>
            <strong>World places</strong>
            <small>{placeCount} geographic points</small>
          </span>
          <span className="layer-lock" aria-label="Required layer">
            On
          </span>
        </div>

        <label className="layer-option">
          <span className="layer-swatch layer-countries" aria-hidden="true" />
          <span>
            <strong>Country boundaries</strong>
            <small>
              {status === "ready"
                ? `${countryCount} countries · Natural Earth`
                : `${statusLabel} boundary data`}
            </small>
          </span>
          <input
            type="checkbox"
            checked={showCountries}
            disabled={unavailable}
            onChange={(event) =>
              onShowCountriesChange(event.target.checked)
            }
          />
          <span className="toggle" aria-hidden="true" />
        </label>

        <label className="layer-option">
          <span className="layer-swatch layer-states" aria-hidden="true" />
          <span>
            <strong>U.S. state boundaries</strong>
            <small>
              {status === "ready"
                ? `${usStateCount} regions · ${
                    showUsStates
                      ? stateDetailVisible
                        ? "Visible now"
                        : "Zoom closer to reveal"
                      : "Hidden"
                  }`
                : `${statusLabel} boundary data`}
            </small>
          </span>
          <input
            type="checkbox"
            checked={showUsStates}
            disabled={unavailable}
            onChange={(event) => onShowUsStatesChange(event.target.checked)}
          />
          <span className="toggle" aria-hidden="true" />
        </label>
      </div>
    </details>
  );
}
