import { useMemo, type Ref } from "react";
import type { PlaceFeature } from "../types/data";
import { matchesPlace, placeTypeLabel } from "../utils/place";

export type PlaceFilter = "all" | "capitals" | "cities";

interface PlaceListProps {
  places: PlaceFeature[];
  query: string;
  filter: PlaceFilter;
  selectedId: string | null;
  collapsed: boolean;
  searchInputRef: Ref<HTMLInputElement>;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: PlaceFilter) => void;
  onSelect: (place: PlaceFeature) => void;
  onCollapse: () => void;
}

export function PlaceList({
  places,
  query,
  filter,
  selectedId,
  collapsed,
  searchInputRef,
  onQueryChange,
  onFilterChange,
  onSelect,
  onCollapse
}: PlaceListProps) {
  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
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

  const filterLabels: Record<PlaceFilter, string> = {
    all: "All",
    capitals: "Capitals",
    cities: "Cities"
  };

  return (
    <section
      className="place-browser"
      aria-labelledby="place-browser-title"
      hidden={collapsed}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Global directory</p>
          <h2 id="place-browser-title">World places</h2>
        </div>
        <div className="section-heading-actions">
          <span
            className="count-badge"
            aria-label={`${filteredPlaces.length} results`}
          >
            {filteredPlaces.length}
          </span>
          <button
            type="button"
            className="panel-collapse-button"
            onClick={onCollapse}
            aria-label="Collapse place directory"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m14 6-6 6 6 6" />
            </svg>
          </button>
        </div>
      </div>

      <label className="search-field">
        <span className="sr-only">Search places</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
        </svg>
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search place or country"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => onQueryChange("")}
            aria-label="Clear place search"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </button>
        ) : (
          <kbd aria-hidden="true">/</kbd>
        )}
      </label>

      <div className="filter-tabs" role="group" aria-label="Filter places">
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
          ? `${filteredPlaces.length} of ${places.length} places match${
              query ? ` “${query}”` : ""
            }.`
          : `${places.length} places available.`}
      </p>

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

      {filteredPlaces.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
          </span>
          <strong>No places found</strong>
          <p>Try a different name, country, or category.</p>
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
