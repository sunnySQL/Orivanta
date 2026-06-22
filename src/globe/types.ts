import type { Ref } from "react";
import type { PlaceFeature } from "../types/data";
import type { CameraState } from "../utils/urlState";

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
  showRoutes: boolean;
  showRegions: boolean;
  onSelect: (id: string | null) => void;
  onCameraChange: (camera: CameraState) => void;
  onReady: () => void;
  onError: (message: string) => void;
}
