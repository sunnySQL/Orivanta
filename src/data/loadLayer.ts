import type {
  BoundaryFeatureCollection,
  DataCatalog,
  LayerManifest,
  LoadedBoundaryLayer,
  LoadedBoundaryLayers,
  LoadedLayer,
  PlaceFeatureCollection
} from "../types/data";

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!path.startsWith("/data/")) {
    throw new Error("Dataset requests must stay within /data/.");
  }

  const response = await fetch(path, {
    credentials: "omit",
    mode: "same-origin",
    redirect: "error",
    ...(signal ? { signal } : {})
  });

  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status}).`);
  }

  return (await response.json()) as T;
}

function safeRelativeDataPath(path: string, label: string): string {
  const segments = path.split("/");
  const isSafe =
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.includes("?") &&
    !path.includes("#") &&
    segments.every((segment) => segment !== "" && segment !== "." && segment !== "..");

  if (!isSafe) {
    throw new Error(`${label} must be a safe relative data path.`);
  }

  return path;
}

export async function loadDefaultLayer(
  signal?: AbortSignal
): Promise<LoadedLayer> {
  const catalog = await fetchJson<DataCatalog>("/data/catalog.json", signal);
  const layer =
    catalog.layers.find(
      (candidate) => candidate.id === "natural-earth-populated-places"
    ) ??
    catalog.layers.find((candidate) => candidate.defaultVisible) ??
    catalog.layers[0];

  if (!layer) {
    throw new Error("The data catalog does not contain any layers.");
  }

  const manifestPath = `/data/${safeRelativeDataPath(
    layer.manifestPath,
    "Layer manifest path"
  )}`;
  const manifest = await fetchJson<LayerManifest>(manifestPath, signal);
  const manifestDirectory = manifestPath.slice(
    0,
    manifestPath.lastIndexOf("/") + 1
  );
  const collection = await fetchJson<PlaceFeatureCollection>(
    `${manifestDirectory}${safeRelativeDataPath(
      manifest.data.path,
      "Layer data path"
    )}`,
    signal
  );

  if (collection.type !== "FeatureCollection") {
    throw new Error("The default layer is not a GeoJSON FeatureCollection.");
  }

  return {
    manifest,
    places: collection.features
  };
}

async function loadBoundaryLayer(
  catalog: DataCatalog,
  layerId: string,
  signal?: AbortSignal
): Promise<LoadedBoundaryLayer> {
  const layer = catalog.layers.find((candidate) => candidate.id === layerId);
  if (!layer) {
    throw new Error(`The data catalog does not contain ${layerId}.`);
  }

  const manifestPath = `/data/${safeRelativeDataPath(
    layer.manifestPath,
    "Layer manifest path"
  )}`;
  const manifest = await fetchJson<LayerManifest>(manifestPath, signal);
  const manifestDirectory = manifestPath.slice(
    0,
    manifestPath.lastIndexOf("/") + 1
  );
  const collection = await fetchJson<BoundaryFeatureCollection>(
    `${manifestDirectory}${safeRelativeDataPath(
      manifest.data.path,
      "Layer data path"
    )}`,
    signal
  );

  if (collection.type !== "FeatureCollection") {
    throw new Error(`${layerId} is not a GeoJSON FeatureCollection.`);
  }

  return {
    manifest,
    boundaries: collection.features
  };
}

export async function loadBoundaryLayers(
  signal?: AbortSignal
): Promise<LoadedBoundaryLayers> {
  const catalog = await fetchJson<DataCatalog>("/data/catalog.json", signal);
  const [countries, usStates] = await Promise.all([
    loadBoundaryLayer(catalog, "natural-earth-countries", signal),
    loadBoundaryLayer(catalog, "natural-earth-us-states", signal)
  ]);

  return { countries, usStates };
}
