import type { Ref } from "react";
import type { BoundaryFeature, PlaceFeature } from "../types/data";
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
  countries: BoundaryFeature[];
  usStates: BoundaryFeature[];
  selectedId: string | null;
  initialCamera: CameraState | null;
  reducedMotion: boolean;
  showCountries: boolean;
  showUsStates: boolean;
  showStateDetail: boolean;
  onSelect: (id: string | null) => void;
  onCameraChange: (camera: CameraState) => void;
  onReady: () => void;
  onError: (message: string) => void;
}
