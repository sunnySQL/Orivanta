import { useMemo, type Ref } from "react";
import type { BoundaryFeature, PlaceFeature } from "../types/data";
import {
  boundaryTypeLabel,
  formatBoundaryLocation,
  matchesBoundary
} from "../utils/boundary";
import { matchesPlace, placeTypeLabel } from "../utils/place";

export type PlaceFilter = "all" | "capitals" | "cities" | "regions";

interface PlaceListProps {
  places: PlaceFeature[];
  countries: BoundaryFeature[];
  usStates: BoundaryFeature[];
  query: string;
  filter: PlaceFilter;
  selectedId: string | null;
  selectedBoundaryId: string | null;
  collapsed: boolean;
  searchInputRef: Ref<HTMLInputElement>;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: PlaceFilter) => void;
  onSelect: (place: PlaceFeature) => void;
  onSelectBoundary: (boundary: BoundaryFeature) => void;
  onCollapse: () => void;
}

export function PlaceList({
  places,
  countries,
  usStates,
  query,
  filter,
  selectedId,
  selectedBoundaryId,
  collapsed,
  searchInputRef,
  onQueryChange,
  onFilterChange,
  onSelect,
  onSelectBoundary,
  onCollapse
}: PlaceListProps) {
  const boundaries = useMemo(
    () => [...countries, ...usStates],
    [countries, usStates]
  );
  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        if (filter === "regions") {
          return false;
        }

        const matchesFilter =
          filter === "all" ||
          (filter === "capitals" &&
            place.properties.placeType !== "populated-place") ||
          (filter === "cities" &&
            place.properties.placeType === "populated-place");

        return matchesFilter && matchesPlace(place, query);
      }),
    [filter, places, query]
  );
  const filteredBoundaries = useMemo(
    () =>
      filter === "all" || filter === "regions"
        ? boundaries.filter((boundary) => matchesBoundary(boundary, query))
        : [],
    [boundaries, filter, query]
  );
  const resultCount = filteredPlaces.length + filteredBoundaries.length;
  const totalAtlasItems = places.length + boundaries.length;

  const filterLabels: Record<PlaceFilter, string> = {
    all: "All",
    capitals: "Capitals",
    cities: "Cities",
    regions: "Regions"
  };

  return (
    <section
      className="place-browser"
      aria-labelledby="place-browser-title"
      hidden={collapsed}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Search the globe</p>
          <h2 id="place-browser-title">Explore atlas</h2>
        </div>
        <div className="section-heading-actions">
          <span
            className="count-badge"
            aria-label={`${resultCount} results`}
          >
            {resultCount}
          </span>
          <button
            type="button"
            className="panel-collapse-button"
            onClick={onCollapse}
            aria-label="Collapse atlas browser"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m14 6-6 6 6 6" />
            </svg>
          </button>
        </div>
      </div>

      <label className="search-field">
        <span className="sr-only">Search atlas</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
        </svg>
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search places, countries, states"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => onQueryChange("")}
            aria-label="Clear atlas search"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </button>
        ) : (
          <kbd aria-hidden="true">/</kbd>
        )}
      </label>

      <div className="filter-tabs" role="group" aria-label="Filter atlas results">
        {(Object.keys(filterLabels) as PlaceFilter[]).map((filterOption) => (
          <button
            key={filterOption}
            type="button"
            aria-pressed={filter === filterOption}
            onClick={() => onFilterChange(filterOption)}
          >
            {filterLabels[filterOption]}
          </button>
        ))}
      </div>

      <p className="results-summary" aria-live="polite">
        {query || filter !== "all"
          ? `${resultCount} of ${totalAtlasItems} atlas items match${
              query ? ` “${query}”` : ""
            }.`
          : `${places.length} places and ${boundaries.length} regions available.`}
      </p>

      <div className="atlas-results">
        {filteredPlaces.length > 0 ? (
          <section aria-labelledby="place-results-heading">
            <h3 id="place-results-heading" className="result-group-heading">
              Places
            </h3>
            <ul className="place-list">
              {filteredPlaces.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    className="place-row"
                    aria-current={place.id === selectedId ? "true" : undefined}
                    onClick={() => onSelect(place)}
                  >
                    <span
                      className={`place-marker place-marker-${place.properties.capitalLevel ?? "city"}`}
                      aria-hidden="true"
                    />
                    <span className="place-copy">
                      <strong>{place.properties.name}</strong>
                      <span>
                        {place.properties.countryName}
                        <span aria-hidden="true"> · </span>
                        {placeTypeLabel(place.properties.placeType)}
                      </span>
                    </span>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {filteredBoundaries.length > 0 ? (
          <section aria-labelledby="boundary-results-heading">
            <h3 id="boundary-results-heading" className="result-group-heading">
              Regions
            </h3>
            <ul className="place-list">
              {filteredBoundaries.map((boundary) => (
                <li key={boundary.id}>
                  <button
                    type="button"
                    className="place-row"
                    aria-current={
                      boundary.id === selectedBoundaryId ? "true" : undefined
                    }
                    onClick={() => onSelectBoundary(boundary)}
                  >
                    <span
                      className={`place-marker boundary-marker boundary-marker-${boundary.properties.level}`}
                      aria-hidden="true"
                    />
                    <span className="place-copy">
                      <strong>{boundary.properties.name}</strong>
                      <span>
                        {formatBoundaryLocation(boundary)}
                        <span aria-hidden="true"> · </span>
                        {boundaryTypeLabel(boundary)}
                      </span>
                    </span>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {resultCount === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
          </span>
          <strong>No atlas items found</strong>
          <p>Try a different place, country, state, or category.</p>
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              onFilterChange("all");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : null}
    </section>
  );
}
