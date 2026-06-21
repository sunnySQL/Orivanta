export type LongitudeLatitude = [longitude: number, latitude: number];

export interface RouteFixture {
  id: string;
  name: string;
  description: string;
  coordinates: LongitudeLatitude[];
}

export interface PolygonFixture {
  type: "Feature";
  id: string;
  properties: {
    name: string;
    description: string;
  };
  geometry: {
    type: "Polygon";
    coordinates: LongitudeLatitude[][];
  };
}

export const routeFixtures: readonly RouteFixture[] = [
  {
    id: "fixture:atlantic-crossing",
    name: "Atlantic crossing",
    description:
      "A synthetic comparison route connecting Lisbon, the Azores, Halifax, and New York.",
    coordinates: [
      [-9.1393, 38.7223],
      [-25.6666, 37.7412],
      [-63.5752, 44.6488],
      [-74.006, 40.7128]
    ]
  }
];

export const polygonFixtures: readonly PolygonFixture[] = [
  {
    type: "Feature",
    id: "fixture:western-mediterranean",
    properties: {
      name: "Western Mediterranean focus area",
      description:
        "A synthetic comparison region used to evaluate polygon rendering, transparency, and globe curvature."
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-6, 31],
          [16, 31],
          [16, 45],
          [-6, 45],
          [-6, 31]
        ]
      ]
    }
  }
];
