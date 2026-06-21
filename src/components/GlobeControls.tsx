import type { GlobeController } from "../globe/types";

interface GlobeControlsProps {
  controller: GlobeController | null;
  onFocusGlobe: () => void;
}

export function GlobeControls({
  controller,
  onFocusGlobe
}: GlobeControlsProps) {
  return (
    <div className="globe-controls" aria-label="Globe controls">
      <button type="button" onClick={() => controller?.zoomIn()} aria-label="Zoom in">
        +
      </button>
      <button type="button" onClick={() => controller?.zoomOut()} aria-label="Zoom out">
        −
      </button>
      <button type="button" onClick={() => controller?.home()} aria-label="Return to global view">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9.5 20v-6h5v6" />
        </svg>
      </button>
      <button
        type="button"
        className="keyboard-button"
        onClick={onFocusGlobe}
        aria-label="Focus globe for keyboard controls"
      >
        Keys
      </button>
    </div>
  );
}
