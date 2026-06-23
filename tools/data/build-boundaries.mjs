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
const publicDomainLicense = {
  name: "Public Domain",
  url: "https://www.naturalearthdata.com/about/terms-of-use/"
};

const layerDefinitions = [
  {
    id: "natural-earth-countries",
    version: "5.1.2-project.1",
    sourcePath: join(
      projectRoot,
      "data/sources/natural-earth/admin-0-countries/5.1.2",
      "ne_110m_admin_0_countries.geojson"
    ),
    layerDirectory: join(projectRoot, "data/layers/natural-earth-countries"),
    reportPath: join(
      projectRoot,
      "data/reports/natural-earth-countries.json"
    ),
    dataFile: "countries.geojson",
    title: "World Country Boundaries",
    description:
      "Simplified global country polygons for navigation, context, and future country selection.",
    source: {
      publisher: "Natural Earth",
      dataset: "Admin 0 — Countries",
      version: "5.1.2",
      scale: "1:110m",
      url: "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/",
      downloadUrl:
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson",
      retrievedOn: "2026-06-23",
      sha256: "6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f"
    },
    filter: () => true,
    normalizeProperties(properties, index) {
      const sourceId = positiveInteger(properties.NE_ID, `Country ${index} ID`);
      const name =
        cleanString(properties.NAME_EN) ??
        cleanString(properties.ADMIN) ??
        cleanString(properties.NAME_LONG) ??
        cleanString(properties.NAME);

      if (!name) {
        throw new Error(`Country ${sourceId} is missing a name.`);
      }

      const code = adminCode(properties.ADM0_A3);
      const continent = cleanString(properties.CONTINENT);
      const region = cleanString(properties.SUBREGION);

      return {
        name,
        nameAscii: cleanString(properties.NAME_SORT) ?? name,
        code,
        parentName: null,
        parentCode: null,
        level: "country",
        region,
        detail: {
          maximumCameraHeight: null
        },
        description: `${name} is represented as a simplified country boundary from Natural Earth 5.1.2${continent ? ` in ${continent}` : ""}.`,
        sourceId
      };
    },
    limitations: [
      "Natural Earth displays de facto boundaries and is not a source for legal or diplomatic boundary determinations.",
      "The 1:110m scale is simplified for global views and must not be used for surveying or local parcel accuracy.",
      "Small territories and detailed coastlines may be omitted or generalized.",
      "Names and geopolitical representation reflect the pinned Natural Earth 5.1.2 release."
    ],
    accessibility: {
      listLabel: "World country boundaries",
      itemLabelTemplate: "{name}",
      descriptionProperty: "description"
    }
  },
  {
    id: "natural-earth-us-states",
    version: "5.1.2-project.1",
    sourcePath: join(
      projectRoot,
      "data/sources/natural-earth/admin-1-states-provinces/5.1.2",
      "ne_50m_admin_1_states_provinces.geojson"
    ),
    layerDirectory: join(projectRoot, "data/layers/natural-earth-us-states"),
    reportPath: join(
      projectRoot,
      "data/reports/natural-earth-us-states.json"
    ),
    dataFile: "us-states.geojson",
    title: "United States Boundaries",
    description:
      "State and federal-district polygons that appear as the globe moves into regional detail.",
    source: {
      publisher: "Natural Earth",
      dataset: "Admin 1 — States, Provinces",
      version: "5.1.2",
      scale: "1:50m",
      url: "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/",
      downloadUrl:
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson",
      retrievedOn: "2026-06-23",
      sha256: "69a0e06e640b2d505858ae1cb63034e4677f3000b35a98e16312932b98c426b9"
    },
    filter: (properties) => properties.adm0_a3 === "USA",
    normalizeProperties(properties, index) {
      const sourceId = positiveInteger(properties.ne_id, `State ${index} ID`);
      const name =
        cleanString(properties.name_en) ?? cleanString(properties.name);

      if (!name) {
        throw new Error(`State ${sourceId} is missing a name.`);
      }

      return {
        name,
        nameAscii: name,
        code: subdivisionCode(properties.iso_3166_2),
        parentName: "United States of America",
        parentCode: "USA",
        level: "us-state",
        region: cleanString(properties.region),
        detail: {
          maximumCameraHeight: 10_000_000
        },
        description: `${name} is represented as a simplified first-order United States administrative boundary from Natural Earth 5.1.2.`,
        sourceId
      };
    },
    limitations: [
      "This layer includes the 50 U.S. states and Washington, D.C.; it does not include counties or lower administrative levels.",
      "The 1:50m scale is designed for regional visualization, not legal, surveying, or parcel-level use.",
      "Coastlines and boundaries are cartographically generalized and become less accurate at close zoom levels.",
      "Authoritative U.S. boundary workflows should use a pinned U.S. Census Bureau source in a future higher-detail tier."
    ],
    accessibility: {
      listLabel: "United States state boundaries",
      itemLabelTemplate: "{name}, United States",
      descriptionProperty: "description"
    }
  }
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanString(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 && cleaned !== "-99" ? cleaned : null;
}

function positiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return value;
}

function adminCode(value) {
  const code = cleanString(value);
  return code && /^[A-Z0-9]{3}$/.test(code) ? code : null;
}

function subdivisionCode(value) {
  const code = cleanString(value);
  return code && /^US-[A-Z0-9]{2,3}$/.test(code) ? code : null;
}

function samePosition(left, right) {
  return left[0] === right[0] && left[1] === right[1];
}

function validateRing(ring, label, visitPosition) {
  if (!Array.isArray(ring) || ring.length < 4) {
    throw new Error(`${label} must contain at least four positions.`);
  }

  for (const position of ring) {
    if (
      !Array.isArray(position) ||
      !Number.isFinite(position[0]) ||
      !Number.isFinite(position[1])
    ) {
      throw new Error(`${label} contains an invalid position.`);
    }

    const [longitude, latitude] = position;
    if (longitude < -180 || longitude > 180) {
      throw new Error(`${label} longitude is outside [-180, 180].`);
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error(`${label} latitude is outside [-90, 90].`);
    }
    visitPosition(longitude, latitude);
  }

  if (!samePosition(ring[0], ring.at(-1))) {
    throw new Error(`${label} must be closed.`);
  }
}

function validatePolygon(coordinates, label, visitPosition) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error(`${label} must contain at least one ring.`);
  }

  coordinates.forEach((ring, ringIndex) =>
    validateRing(ring, `${label} ring ${ringIndex}`, visitPosition)
  );
}

function validateGeometry(geometry, label, visitPosition) {
  if (geometry?.type === "Polygon") {
    validatePolygon(geometry.coordinates, label, visitPosition);
    return;
  }

  if (geometry?.type === "MultiPolygon") {
    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
      throw new Error(`${label} must contain at least one polygon.`);
    }
    geometry.coordinates.forEach((polygon, polygonIndex) =>
      validatePolygon(
        polygon,
        `${label} polygon ${polygonIndex}`,
        visitPosition
      )
    );
    return;
  }

  throw new Error(`${label} must use Polygon or MultiPolygon geometry.`);
}

function normalizeLayerFeatures(rawFeatures, definition) {
  const bounds = [180, 90, -180, -90];

  const features = rawFeatures
    .filter((feature) => definition.filter(feature.properties ?? {}))
    .map((feature, index) => {
      if (feature?.type !== "Feature") {
        throw new Error(`${definition.id} feature ${index} is invalid.`);
      }

      validateGeometry(
        feature.geometry,
        `${definition.id} feature ${index}`,
        (longitude, latitude) => {
          bounds[0] = Math.min(bounds[0], longitude);
          bounds[1] = Math.min(bounds[1], latitude);
          bounds[2] = Math.max(bounds[2], longitude);
          bounds[3] = Math.max(bounds[3], latitude);
        }
      );

      const properties = definition.normalizeProperties(
        feature.properties ?? {},
        index
      );

      return {
        type: "Feature",
        id: `natural-earth:${properties.level}:${properties.sourceId}`,
        geometry: feature.geometry,
        properties
      };
    })
    .sort((left, right) => {
      const nameOrder = left.properties.name.localeCompare(
        right.properties.name,
        "en"
      );
      return nameOrder !== 0
        ? nameOrder
        : left.id.localeCompare(right.id, "en");
    });

  if (features.length === 0) {
    throw new Error(`${definition.id} produced no features.`);
  }

  const ids = new Set(features.map((feature) => feature.id));
  if (ids.size !== features.length) {
    throw new Error(`${definition.id} produced duplicate feature IDs.`);
  }

  return { features, bounds };
}

async function writeAtomically(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, contents);
  await rename(temporaryPath, path);
}

async function buildLayer(definition) {
  const sourceBytes = await readFile(definition.sourcePath);
  const actualSourceHash = sha256(sourceBytes);
  if (actualSourceHash !== definition.source.sha256) {
    throw new Error(
      `${definition.id} source checksum mismatch. Expected ${definition.source.sha256}, received ${actualSourceHash}.`
    );
  }

  const raw = JSON.parse(sourceBytes.toString("utf8"));
  if (raw.type !== "FeatureCollection" || !Array.isArray(raw.features)) {
    throw new Error(`${definition.id} source must be a FeatureCollection.`);
  }

  const { features, bounds } = normalizeLayerFeatures(
    raw.features,
    definition
  );
  const featureCollection = {
    type: "FeatureCollection",
    features
  };
  const dataContents = `${JSON.stringify(featureCollection)}\n`;
  const dataBytes = Buffer.byteLength(dataContents);
  const dataHash = sha256(dataContents);
  const geometryTypes = [...new Set(features.map(({ geometry }) => geometry.type))]
    .sort();

  const manifest = {
    schemaVersion: 1,
    id: definition.id,
    version: definition.version,
    title: definition.title,
    description: definition.description,
    license: publicDomainLicense,
    attribution: "Made with Natural Earth.",
    source: definition.source,
    data: {
      path: definition.dataFile,
      format: "GeoJSON",
      geometryTypes,
      featureCount: features.length,
      bounds,
      bytes: dataBytes,
      sha256: dataHash
    },
    presentation: {
      defaultVisible: true,
      minimumZoomProperty: "detail.maximumCameraHeight",
      labelProperty: "name"
    },
    accessibility: definition.accessibility,
    limitations: definition.limitations
  };

  const report = {
    layerId: definition.id,
    layerVersion: definition.version,
    sourceVersion: definition.source.version,
    sourceSha256: definition.source.sha256,
    outputSha256: dataHash,
    featureCount: features.length,
    bounds,
    geometryTypes,
    missingCodes: features.filter(({ properties }) => properties.code === null)
      .length
  };

  const dataPath = join(definition.layerDirectory, definition.dataFile);
  const manifestPath = join(definition.layerDirectory, "layer.json");
  await writeAtomically(dataPath, dataContents);
  await writeAtomically(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeAtomically(
    definition.reportPath,
    `${JSON.stringify(report, null, 2)}\n`
  );
  await rm(`${dataPath}.tmp`, { force: true });
  await rm(`${manifestPath}.tmp`, { force: true });
  await rm(`${definition.reportPath}.tmp`, { force: true });

  console.log(
    `Built ${definition.id} ${definition.version}: ${features.length} features, ${dataBytes} bytes.`
  );
}

for (const definition of layerDefinitions) {
  await buildLayer(definition);
}
