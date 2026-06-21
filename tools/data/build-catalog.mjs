import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const dataRoot = join(projectRoot, "data");
const layersRoot = join(dataRoot, "layers");
const catalogPath = join(dataRoot, "catalog.json");

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

async function writeAtomically(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, contents);
  await rename(temporaryPath, path);
}

const manifestPaths = await findManifests(layersRoot);
const layers = [];
const ids = new Set();

for (const manifestPath of manifestPaths) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  if (ids.has(manifest.id)) {
    throw new Error(`Duplicate layer ID: ${manifest.id}`);
  }
  ids.add(manifest.id);

  layers.push({
    id: manifest.id,
    version: manifest.version,
    title: manifest.title,
    description: manifest.description,
    manifestPath: relative(dataRoot, manifestPath).replaceAll("\\", "/"),
    defaultVisible: manifest.presentation.defaultVisible
  });
}

layers.sort((left, right) => left.id.localeCompare(right.id, "en"));

const catalog = {
  schemaVersion: 1,
  layers
};

await writeAtomically(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Built data catalog with ${layers.length} layer.`);
