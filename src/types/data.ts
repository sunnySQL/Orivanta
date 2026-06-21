export type PlaceType =
  | "national-capital"
  | "national-capital-alternate"
  | "national-region-capital"
  | "regional-capital"
  | "regional-region-capital"
  | "populated-place";

export interface DataCatalog {
  schemaVersion: 1;
  layers: CatalogLayer[];
}

export interface CatalogLayer {
  id: string;
  version: string;
  title: string;
  description: string;
  manifestPath: string;
  defaultVisible: boolean;
}

export interface LayerManifest {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  description: string;
  license: {
    name: string;
    url: string;
  };
  attribution: string;
  source: {
    publisher: string;
    dataset: string;
    version: string;
    scale: string;
    url: string;
    downloadUrl: string;
    retrievedOn: string;
    sha256: string;
  };
  data: {
    path: string;
    format: "GeoJSON";
    geometryTypes: ["Point"];
    featureCount: number;
    bounds: [number, number, number, number];
    bytes: number;
    sha256: string;
  };
  presentation: {
    defaultVisible: boolean;
    minimumZoomProperty: string;
    labelProperty: string;
  };
  accessibility: {
    listLabel: string;
    itemLabelTemplate: string;
    descriptionProperty: string;
  };
  limitations: string[];
}

export interface PlaceProperties {
  name: string;
  nameAscii: string;
  countryName: string;
  countryCode: string | null;
  regionName: string | null;
  placeType: PlaceType;
  capitalLevel: "national" | "regional" | null;
  population: {
    minimumEstimate: number | null;
    maximumEstimate: number | null;
  };
  ranking: {
    scaleRank: number;
    labelRank: number;
    minimumZoom: number;
  };
  description: string;
  sourceId: number;
}

export interface PlaceFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: PlaceProperties;
}

export interface PlaceFeatureCollection {
  type: "FeatureCollection";
  features: PlaceFeature[];
}

export interface LoadedLayer {
  manifest: LayerManifest;
  places: PlaceFeature[];
}
