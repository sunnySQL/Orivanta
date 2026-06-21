import type { Ref } from "react";
import type { PlaceFeature } from "../types/data";
import type { CameraState } from "../utils/urlState";

export type GlobeEngineId = "globe-gl" | "cesium";

export interface GlobeController {
  home: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  move: (longitudeDelta: number, latitudeDelta: number) => void;
  focus: () => void;
}

export interface GlobeViewProps {
  ref?: Ref<GlobeController>;
  places: PlaceFeature[];
  selectedId: string | null;
  initialCamera: CameraState | null;
  reducedMotion: boolean;
  onSelect: (id: string | null) => void;
  onCameraChange: (camera: CameraState) => void;
  onReady: () => void;
  onError: (message: string) => void;
}

export const globeEngineLabels: Record<GlobeEngineId, string> = {
  "globe-gl": "Globe.gl",
  cesium: "CesiumJS"
};

export function readEngine(search: string): GlobeEngineId {
  return new URLSearchParams(search).get("engine") === "cesium"
    ? "cesium"
    : "globe-gl";
}

export function writeEngine(currentUrl: string, engine: GlobeEngineId): string {
  const url = new URL(currentUrl);

  if (engine === "globe-gl") {
    url.searchParams.delete("engine");
  } else {
    url.searchParams.set("engine", engine);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
