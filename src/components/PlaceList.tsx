import { useMemo } from "react";
import type { PlaceFeature } from "../types/data";
import { matchesPlace, placeTypeLabel } from "../utils/place";

interface PlaceListProps {
  places: PlaceFeature[];
  query: string;
  selectedId: string | null;
  onQueryChange: (query: string) => void;
  onSelect: (place: PlaceFeature) => void;
}

export function PlaceList({
  places,
  query,
  selectedId,
  onQueryChange,
  onSelect
}: PlaceListProps) {
  const filteredPlaces = useMemo(
    () => places.filter((place) => matchesPlace(place, query)),
    [places, query]
  );

  return (
    <section className="place-browser" aria-labelledby="place-browser-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Explore the seed layer</p>
          <h2 id="place-browser-title">World places</h2>
        </div>
        <span className="count-badge" aria-label={`${filteredPlaces.length} results`}>
          {filteredPlaces.length}
        </span>
      </div>

      <label className="search-field">
        <span className="sr-only">Search places</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search place or country"
          autoComplete="off"
        />
      </label>

      <p className="results-summary" aria-live="polite">
        {query
          ? `${filteredPlaces.length} of ${places.length} places match “${query}”.`
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
              <span className="place-marker" aria-hidden="true" />
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
          <p>No places match that search.</p>
          <button type="button" onClick={() => onQueryChange("")}>
            Clear search
          </button>
        </div>
      ) : null}
    </section>
  );
}
