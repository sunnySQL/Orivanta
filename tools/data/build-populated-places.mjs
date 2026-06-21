import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourcePath = join(
  projectRoot,
  "data/sources/natural-earth/populated-places/5.1.2",
  "ne_110m_populated_places_simple.geojson"
);
const layerDirectory = join(
  projectRoot,
  "data/layers/natural-earth-populated-places"
);
const dataPath = join(layerDirectory, "places.geojson");
const manifestPath = join(layerDirectory, "layer.json");
const reportPath = join(
  projectRoot,
  "data/reports/natural-earth-populated-places.json"
);

const source = {
  publisher: "Natural Earth",
  dataset: "Populated Places (Simple)",
  version: "5.1.2",
  scale: "1:110m",
  url: "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-populated-places/",
  downloadUrl:
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_populated_places_simple.geojson",
  retrievedOn: "2026-06-20",
  sha256: "0dbd25c9ad8bd797ddf164b067f563be5c16be2c002254eb594862377963f9dc"
};

const placeTypes = new Map([
  ["Admin-0 capital", "national-capital"],
  ["Admin-0 capital alt", "national-capital-alternate"],
  ["Admin-0 region capital", "national-region-capital"],
  ["Admin-1 capital", "regional-capital"],
  ["Admin-1 region capital", "regional-region-capital"],
  ["Populated place", "populated-place"]
]);

const readablePlaceTypes = new Map([
  ["national-capital", "national capital"],
  ["national-capital-alternate", "alternate national capital"],
  ["national-region-capital", "national region capital"],
  ["regional-capital", "regional capital"],
  ["regional-region-capital", "regional region capital"],
  ["populated-place", "populated place"]
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function nonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function finiteNumber(value, label) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }

  return value;
}

function countryCode(value) {
  const code = cleanString(value);
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

function capitalLevel(properties) {
  if (properties.adm0cap === 1) {
    return "national";
  }

  if (
    properties.featurecla === "Admin-1 capital" ||
    properties.featurecla === "Admin-1 region capital"
  ) {
    return "regional";
  }

  return null;
}

function readablePlaceType(placeType) {
  return readablePlaceTypes.get(placeType) ?? placeType.replaceAll("-", " ");
}

function buildDescription({ name, countryName, regionName, placeType }) {
  const location = regionName
    ? `${regionName}, ${countryName}`
    : countryName;

  return `${name} is classified by Natural Earth 5.1.2 as a ${readablePlaceType(placeType)} in ${location}.`;
}

function normalizeFeature(feature, index) {
  if (feature?.type !== "Feature" || feature.geometry?.type !== "Point") {
    throw new Error(`Feature ${index} must be a GeoJSON Point feature.`);
  }

  const [longitude, latitude] = feature.geometry.coordinates ?? [];
  finiteNumber(longitude, `Feature ${index} longitude`);
  finiteNumber(latitude, `Feature ${index} latitude`);

  if (longitude < -180 || longitude > 180) {
    throw new Error(`Feature ${index} longitude is outside [-180, 180].`);
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error(`Feature ${index} latitude is outside [-90, 90].`);
  }

  const properties = feature.properties ?? {};
  const sourceId = properties.ne_id;
  const name = cleanString(properties.name);
  const nameAscii = cleanString(properties.nameascii) ?? name;
  const countryName =
    cleanString(properties.adm0name) ??
    cleanString(properties.sov0name);
  const regionName = cleanString(properties.adm1name);
  const placeType = placeTypes.get(properties.featurecla);

  if (!Number.isInteger(sourceId) || sourceId <= 0) {
    throw new Error(`Feature ${index} has an invalid Natural Earth ID.`);
  }

  if (!name || !nameAscii || !countryName || !placeType) {
    throw new Error(`Feature ${sourceId} is missing required label data.`);
  }

  const normalizedProperties = {
    name,
    nameAscii,
    countryName,
    countryCode: countryCode(properties.iso_a2),
    regionName,
    placeType,
    capitalLevel: capitalLevel(properties),
    population: {
      minimumEstimate: nonNegativeInteger(properties.pop_min),
      maximumEstimate: nonNegativeInteger(properties.pop_max)
    },
    ranking: {
      scaleRank: finiteNumber(
        properties.scalerank,
        `Feature ${sourceId} scale rank`
      ),
      labelRank: finiteNumber(
        properties.labelrank,
        `Feature ${sourceId} label rank`
      ),
      minimumZoom: finiteNumber(
        properties.min_zoom,
        `Feature ${sourceId} minimum zoom`
      )
    },
    description: buildDescription({
      name,
      countryName,
      regionName,
      placeType
    }),
    sourceId
  };

  return {
    type: "Feature",
    id: `natural-earth:${sourceId}`,
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude]
    },
    properties: normalizedProperties
  };
}

function calculateBounds(features) {
  const bounds = [180, 90, -180, -90];

  for (const feature of features) {
    const [longitude, latitude] = feature.geometry.coordinates;
    bounds[0] = Math.min(bounds[0], longitude);
    bounds[1] = Math.min(bounds[1], latitude);
    bounds[2] = Math.max(bounds[2], longitude);
    bounds[3] = Math.max(bounds[3], latitude);
  }

  return bounds;
}

function countBy(features, selector) {
  const counts = {};

  for (const feature of features) {
    const key = selector(feature) ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  );
}

async function writeAtomically(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, contents);
  await rename(temporaryPath, path);
}

async function main() {
  const sourceBytes = await readFile(sourcePath);
  const actualSourceHash = sha256(sourceBytes);

  if (actualSourceHash !== source.sha256) {
    throw new Error(
      `Source checksum mismatch. Expected ${source.sha256}, received ${actualSourceHash}.`
    );
  }

  const raw = JSON.parse(sourceBytes.toString("utf8"));

  if (raw.type !== "FeatureCollection" || !Array.isArray(raw.features)) {
    throw new Error("Source must be a GeoJSON FeatureCollection.");
  }

  const normalizedFeatures = raw.features
    .map(normalizeFeature)
    .sort((left, right) => {
      const nameOrder = left.properties.name.localeCompare(
        right.properties.name,
        "en"
      );
      return nameOrder !== 0
        ? nameOrder
        : left.id.localeCompare(right.id, "en");
    });

  const ids = new Set(normalizedFeatures.map((feature) => feature.id));
  if (ids.size !== normalizedFeatures.length) {
    throw new Error("Normalized feature IDs must be unique.");
  }

  const featureCollection = {
    type: "FeatureCollection",
    features: normalizedFeatures
  };
  const dataContents = `${JSON.stringify(featureCollection)}\n`;
  const dataBytes = Buffer.byteLength(dataContents);
  const dataHash = sha256(dataContents);
  const bounds = calculateBounds(normalizedFeatures);

  const limitations = [
    "This is a cartographic selection of globally significant places, not a complete list of world settlements.",
    "Population values are broad Natural Earth estimates and must not be presented as current official census counts.",
    "The 1:110m scale is intended for global views and does not provide street- or neighborhood-level precision.",
    "Names, administrative status, and geopolitical representation reflect the pinned Natural Earth release and may change over time."
  ];

  const manifest = {
    schemaVersion: 1,
    id: "natural-earth-populated-places",
    version: "5.1.2-project.1",
    title: "World Populated Places",
    description:
      "A global sample of capitals and selected significant cities for Orivanta foundation testing.",
    license: {
      name: "Public Domain",
      url: "https://www.naturalearthdata.com/about/terms-of-use/"
    },
    attribution: "Made with Natural Earth.",
    source,
    data: {
      path: "places.geojson",
      format: "GeoJSON",
      geometryTypes: ["Point"],
      featureCount: normalizedFeatures.length,
      bounds,
      bytes: dataBytes,
      sha256: dataHash
    },
    presentation: {
      defaultVisible: true,
      minimumZoomProperty: "ranking.minimumZoom",
      labelProperty: "name"
    },
    accessibility: {
      listLabel: "World populated places",
      itemLabelTemplate: "{name}, {countryName}",
      descriptionProperty: "description"
    },
    limitations
  };

  const report = {
    layerId: manifest.id,
    layerVersion: manifest.version,
    sourceVersion: source.version,
    sourceSha256: source.sha256,
    outputSha256: dataHash,
    featureCount: normalizedFeatures.length,
    bounds,
    countsByPlaceType: countBy(
      normalizedFeatures,
      (feature) => feature.properties.placeType
    ),
    countsByCountry: countBy(
      normalizedFeatures,
      (feature) => feature.properties.countryName
    ),
    missingCountryCodes: normalizedFeatures.filter(
      (feature) => feature.properties.countryCode === null
    ).length,
    missingPopulationEstimates: normalizedFeatures.filter(
      (feature) =>
        feature.properties.population.minimumEstimate === null ||
        feature.properties.population.maximumEstimate === null
    ).length
  };

  await writeAtomically(dataPath, dataContents);
  await writeAtomically(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  await writeAtomically(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await rm(`${dataPath}.tmp`, { force: true });
  await rm(`${manifestPath}.tmp`, { force: true });
  await rm(`${reportPath}.tmp`, { force: true });

  console.log(
    `Built ${manifest.id} ${manifest.version}: ${normalizedFeatures.length} features, ${dataBytes} bytes.`
  );
}

await main();
