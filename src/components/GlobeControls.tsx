import type { GlobeController } from "../globe/types";

interface GlobeControlsProps {
  controller: GlobeController | null;
  onFocusGlobe: () => void;
}

export function GlobeControls({
  controller,
  onFocusGlobe
}: GlobeControlsProps) {
  const disabled = controller === null;

  return (
    <div className="globe-controls" aria-label="Globe controls">
      <button
        type="button"
        onClick={() => controller?.zoomIn()}
        aria-label="Zoom in"
        disabled={disabled}
        data-tooltip="Zoom in"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => controller?.zoomOut()}
        aria-label="Zoom out"
        disabled={disabled}
        data-tooltip="Zoom out"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => controller?.home()}
        aria-label="Return to global view"
        disabled={disabled}
        data-tooltip="Reset view"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 12a8 8 0 1 0 2.34-5.66L4 8.68M4 4v4.68h4.68" />
        </svg>
      </button>
      <button
        type="button"
        className="keyboard-button"
        onClick={onFocusGlobe}
        aria-label="Focus globe for keyboard controls"
        disabled={disabled}
        data-tooltip="Keyboard navigation"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 9h.01M11 9h.01M15 9h.01M7 13h.01M11 13h6M7 16h10" />
        </svg>
      </button>
    </div>
  );
}
