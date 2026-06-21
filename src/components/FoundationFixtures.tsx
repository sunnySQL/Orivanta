import { polygonFixtures, routeFixtures } from "../globe/fixtures";

export function FoundationFixtures() {
  return (
    <details className="fixture-summary">
      <summary>Foundation geometry layers</summary>
      <dl>
        {routeFixtures.map((route) => (
          <div key={route.id}>
            <dt>
              <span className="fixture-swatch fixture-route" aria-hidden="true" />
              {route.name}
            </dt>
            <dd>{route.description}</dd>
          </div>
        ))}
        {polygonFixtures.map((polygon) => (
          <div key={polygon.id}>
            <dt>
              <span
                className="fixture-swatch fixture-polygon"
                aria-hidden="true"
              />
              {polygon.properties.name}
            </dt>
            <dd>{polygon.properties.description}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
