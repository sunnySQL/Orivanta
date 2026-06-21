import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const dataRoot = join(projectRoot, "data");
const layersRoot = join(projectRoot, "data/layers");
const catalogPath = join(dataRoot, "catalog.json");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function findManifests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const manifests = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      manifests.push(...(await findManifests(path)));
    } else if (entry.name === "layer.json") {
      manifests.push(path);
    }
  }

  return manifests.sort();
}

function validateBounds(bounds, layerId) {
  assert(
    Array.isArray(bounds) &&
      bounds.length === 4 &&
      bounds.every(Number.isFinite),
    `${layerId}: data.bounds must contain four finite numbers.`
  );
  assert(
    bounds[0] >= -180 && bounds[0] <= 180 && bounds[2] >= -180 && bounds[2] <= 180,
    `${layerId}: longitude bounds are invalid.`
  );
  assert(
    bounds[1] >= -90 && bounds[1] <= 90 && bounds[3] >= -90 && bounds[3] <= 90,
    `${layerId}: latitude bounds are invalid.`
  );
  assert(
    bounds[0] <= bounds[2] && bounds[1] <= bounds[3],
    `${layerId}: bounds are not ordered [west, south, east, north].`
  );
}

function validatePointFeature(feature, layerId, ids) {
  assert(feature?.type === "Feature", `${layerId}: invalid GeoJSON feature.`);
  assert(
    typeof feature.id === "string" && feature.id.length > 0,
    `${layerId}: every feature needs a stable string ID.`
  );
  assert(!ids.has(feature.id), `${layerId}: duplicate feature ID ${feature.id}.`);
  ids.add(feature.id);

  assert(
    feature.geometry?.type === "Point",
    `${layerId}: ${feature.id} must have Point geometry.`
  );

  const [longitude, latitude] = feature.geometry.coordinates ?? [];
  assert(
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180,
    `${layerId}: ${feature.id} has invalid longitude.`
  );
  assert(
    Number.isFinite(latitude) && latitude >= -90 && latitude <= 90,
    `${layerId}: ${feature.id} has invalid latitude.`
  );

  const properties = feature.properties ?? {};
  for (const key of [
    "name",
    "nameAscii",
    "countryName",
    "placeType",
    "description"
  ]) {
    assert(
      typeof properties[key] === "string" && properties[key].length > 0,
      `${layerId}: ${feature.id} is missing properties.${key}.`
    );
  }

  assert(
    Number.isInteger(properties.sourceId) && properties.sourceId > 0,
    `${layerId}: ${feature.id} has an invalid sourceId.`
  );
}

async function validateManifest(manifestPath) {
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const layerId = manifest.id ?? relative(projectRoot, manifestPath);

  assert(manifest.schemaVersion === 1, `${layerId}: unsupported schema version.`);
  assert(
    typeof manifest.id === "string" &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id),
    `${layerId}: invalid layer ID.`
  );
  assert(
    typeof manifest.version === "string" && manifest.version.length > 0,
    `${layerId}: missing version.`
  );
  assert(
    typeof manifest.attribution === "string" &&
      manifest.attribution.length > 0,
    `${layerId}: missing attribution.`
  );
  assert(
    typeof manifest.source?.sha256 === "string" &&
      /^[a-f0-9]{64}$/.test(manifest.source.sha256),
    `${layerId}: invalid source checksum.`
  );
  validateBounds(manifest.data?.bounds, layerId);

  const manifestDirectory = dirname(manifestPath);
  const dataPath = resolve(manifestDirectory, manifest.data.path);
  assert(
    dataPath.startsWith(`${manifestDirectory}/`),
    `${layerId}: data.path must stay inside its layer directory.`
  );

  const dataBytes = await readFile(dataPath);
  const dataStats = await stat(dataPath);
  assert(
    dataStats.size === manifest.data.bytes,
    `${layerId}: byte count does not match the manifest.`
  );
  assert(
    sha256(dataBytes) === manifest.data.sha256,
    `${layerId}: data checksum does not match the manifest.`
  );

  const geojson = JSON.parse(dataBytes.toString("utf8"));
  assert(
    geojson.type === "FeatureCollection" && Array.isArray(geojson.features),
    `${layerId}: data must be a GeoJSON FeatureCollection.`
  );
  assert(
    geojson.features.length === manifest.data.featureCount,
    `${layerId}: feature count does not match the manifest.`
  );

  const ids = new Set();
  for (const feature of geojson.features) {
    validatePointFeature(feature, layerId, ids);
  }

  return {
    id: layerId,
    version: manifest.version,
    features: geojson.features.length,
    bytes: dataStats.size
  };
}

const manifests = await findManifests(layersRoot);
assert(manifests.length > 0, "No layer manifests were found.");

const results = [];
for (const manifestPath of manifests) {
  results.push(await validateManifest(manifestPath));
}

for (const result of results) {
  console.log(
    `Validated ${result.id} ${result.version}: ${result.features} features, ${result.bytes} bytes.`
  );
}

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
assert(catalog.schemaVersion === 1, "Catalog has an unsupported schema version.");
assert(Array.isArray(catalog.layers), "Catalog layers must be an array.");
assert(
  catalog.layers.length === results.length,
  "Catalog layer count does not match the number of manifests."
);

const resultIds = new Set(results.map((result) => result.id));
const catalogIds = new Set();

for (const layer of catalog.layers) {
  assert(
    typeof layer.id === "string" && resultIds.has(layer.id),
    `Catalog references an unknown layer: ${layer.id}.`
  );
  assert(!catalogIds.has(layer.id), `Catalog duplicates layer ${layer.id}.`);
  catalogIds.add(layer.id);

  const manifestPath = resolve(dataRoot, layer.manifestPath);
  assert(
    manifestPath.startsWith(`${layersRoot}/`),
    `Catalog manifest path escapes the layers directory: ${layer.manifestPath}.`
  );
  await stat(manifestPath);
}

console.log(`Validated data catalog: ${catalog.layers.length} layer.`);
