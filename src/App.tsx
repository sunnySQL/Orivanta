import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BoundaryLayers } from "./components/BoundaryLayers";
import { GlobeControls } from "./components/GlobeControls";
import { PlaceDetails } from "./components/PlaceDetails";
import {
  PlaceList,
  type PlaceFilter
} from "./components/PlaceList";
import { loadBoundaryLayers, loadDefaultLayer } from "./data/loadLayer";
import { isStateDetailVisible } from "./globe/boundaries";
import type { GlobeController } from "./globe/types";
import { useReducedMotion } from "./hooks/useReducedMotion";
import type {
  BoundaryFeature,
  LoadedBoundaryLayers,
  LoadedLayer,
  PlaceFeature
} from "./types/data";
import { markPerformance } from "./utils/performance";
import {
  readUrlState,
  writeUrlState,
  type CameraState
} from "./utils/urlState";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; layer: LoadedLayer }
  | { status: "error"; message: string };

type BoundaryLoadState =
  | { status: "loading" }
  | { status: "ready"; layers: LoadedBoundaryLayers }
  | { status: "error"; message: string };

const initialUrlState = readUrlState(window.location.search);
const GlobeView = lazy(async () => {
  const module = await import("./components/GlobeView");
  return { default: module.GlobeView };
});

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("The view link could not be copied.");
  }
}

function formatCameraCoordinate(
  value: number,
  positive: string,
  negative: string
) {
  return `${Math.abs(value).toFixed(1)}° ${value >= 0 ? positive : negative}`;
}

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [boundaryLoadState, setBoundaryLoadState] =
    useState<BoundaryLoadState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlaceFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialUrlState.placeId
  );
  const [selectedBoundaryId, setSelectedBoundaryId] = useState<string | null>(
    initialUrlState.placeId ? null : initialUrlState.boundaryId
  );
  const [globeReady, setGlobeReady] = useState(false);
  const [globeError, setGlobeError] = useState<string | null>(null);
  const [controller, setController] = useState<GlobeController | null>(null);
  const [camera, setCamera] = useState<CameraState | null>(
    initialUrlState.camera
  );
  const [showCountries, setShowCountries] = useState(true);
  const [showUsStates, setShowUsStates] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shareState, setShareState] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const controllerRef = useRef<GlobeController>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shareResetRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("engine")) {
      url.searchParams.delete("engine");
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    loadBoundaryLayers(abortController.signal)
      .then((layers) => {
        setBoundaryLoadState({ status: "ready", layers });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setBoundaryLoadState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Boundary layers could not be loaded."
        });
      });

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    loadDefaultLayer(abortController.signal)
      .then((layer) => {
        markPerformance("data-ready");
        setLoadState({ status: "ready", layer });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "The dataset could not be loaded."
        });
      });

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (loadState.status !== "ready") return;

    const frame = window.requestAnimationFrame(() => {
      markPerformance("interface-ready");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loadState.status]);

  const places = loadState.status === "ready" ? loadState.layer.places : [];
  const countries =
    boundaryLoadState.status === "ready"
      ? boundaryLoadState.layers.countries.boundaries
      : [];
  const usStates =
    boundaryLoadState.status === "ready"
      ? boundaryLoadState.layers.usStates.boundaries
      : [];
  const boundaries = useMemo(
    () => [...countries, ...usStates],
    [countries, usStates]
  );
  const boundaryCount = boundaries.length;
  const stateDetailVisible = isStateDetailVisible(
    camera?.height ?? null,
    showUsStates
  );
  const capitalCount = useMemo(
    () =>
      places.filter(
        (place) => place.properties.placeType !== "populated-place"
      ).length,
    [places]
  );
  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedId) ?? null,
    [places, selectedId]
  );
  const selectedBoundary = useMemo(
    () =>
      boundaries.find((boundary) => boundary.id === selectedBoundaryId) ?? null,
    [boundaries, selectedBoundaryId]
  );
  const selectedBoundaryManifest =
    selectedBoundary && boundaryLoadState.status === "ready"
      ? selectedBoundary.properties.level === "country"
        ? boundaryLoadState.layers.countries.manifest
        : boundaryLoadState.layers.usStates.manifest
      : null;

  useEffect(() => {
    if (
      loadState.status === "ready" &&
      selectedId &&
      !loadState.layer.places.some((place) => place.id === selectedId)
    ) {
      setSelectedId(null);
      window.history.replaceState(
        null,
        "",
        writeUrlState(window.location.href, { placeId: null })
      );
    }
  }, [loadState, selectedId]);

  useEffect(() => {
    if (
      boundaryLoadState.status === "ready" &&
      selectedBoundaryId &&
      !boundaries.some((boundary) => boundary.id === selectedBoundaryId)
    ) {
      setSelectedBoundaryId(null);
      window.history.replaceState(
        null,
        "",
        writeUrlState(window.location.href, { boundaryId: null })
      );
    }
  }, [boundaries, boundaryLoadState.status, selectedBoundaryId]);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedBoundaryId(null);
    window.history.replaceState(
      null,
      "",
      writeUrlState(window.location.href, {
        placeId: null,
        boundaryId: null
      })
    );
  }, []);

  const selectPlace = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedBoundaryId(null);
    window.history.replaceState(
      null,
      "",
      writeUrlState(window.location.href, {
        placeId: id,
        boundaryId: null
      })
    );
  }, []);

  const selectBoundary = useCallback(
    (id: string) => {
      const boundary = boundaries.find((candidate) => candidate.id === id);

      if (boundary?.properties.level === "country") {
        setShowCountries(true);
      }
      if (boundary?.properties.level === "us-state") {
        setShowUsStates(true);
      }

      setSelectedBoundaryId(id);
      setSelectedId(null);
      window.history.replaceState(
        null,
        "",
        writeUrlState(window.location.href, {
          placeId: null,
          boundaryId: id
        })
      );
    },
    [boundaries]
  );

  const updateCamera = useCallback((nextCamera: CameraState) => {
    setCamera(nextCamera);
    window.history.replaceState(
      null,
      "",
      writeUrlState(window.location.href, { camera: nextCamera })
    );
  }, []);

  const handleGlobeReady = useCallback(() => {
    markPerformance("globe-ready");
    setGlobeReady(true);
  }, []);

  const handleGlobeError = useCallback((message: string) => {
    setGlobeError(message);
  }, []);

  const registerController = useCallback((value: GlobeController | null) => {
    controllerRef.current = value;
    setController(value);
  }, []);

  const selectPlaceAndReveal = useCallback(
    (id: string) => {
      selectPlace(id);
      setDetailsOpen(true);
    },
    [selectPlace]
  );

  const selectBoundaryAndReveal = useCallback(
    (id: string) => {
      selectBoundary(id);
      setDetailsOpen(true);
    },
    [selectBoundary]
  );

  const exploreRandom = useCallback(() => {
    if (places.length === 0) return;

    const currentIndex = selectedId
      ? places.findIndex((place) => place.id === selectedId)
      : -1;
    const offset = Math.max(1, Math.floor(Math.random() * places.length));
    const nextPlace = places[(currentIndex + offset) % places.length];

    if (nextPlace) {
      selectPlaceAndReveal(nextPlace.id);
    }
  }, [places, selectPlaceAndReveal, selectedId]);

  const globeFocused = !directoryOpen && !detailsOpen;

  const focusGlobe = useCallback(() => {
    setDirectoryOpen(false);
    setDetailsOpen(false);
    window.requestAnimationFrame(() => controllerRef.current?.focus());
  }, []);

  const shareCurrentView = useCallback(async () => {
    try {
      await copyText(window.location.href);
      setShareState("copied");
    } catch {
      setShareState("failed");
    }

    if (shareResetRef.current !== null) {
      window.clearTimeout(shareResetRef.current);
    }
    shareResetRef.current = window.setTimeout(() => {
      setShareState("idle");
      shareResetRef.current = null;
    }, 2_500);
  }, []);

  useEffect(
    () => () => {
      if (shareResetRef.current !== null) {
        window.clearTimeout(shareResetRef.current);
      }
    },
    []
  );

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (event.key === "Escape") {
        if (showHelp) {
          setShowHelp(false);
        } else if (selectedId || selectedBoundaryId) {
          clearSelection();
        }
        return;
      }

      if (isTyping) return;

      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "?") {
        event.preventDefault();
        setShowHelp((visible) => !visible);
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [clearSelection, selectedBoundaryId, selectedId, showHelp]);

  function handlePlaceSelect(place: PlaceFeature) {
    selectPlaceAndReveal(place.id);
  }

  function handleBoundarySelect(boundary: BoundaryFeature) {
    selectBoundaryAndReveal(boundary.id);
  }

  if (loadState.status === "loading") {
    return (
      <main className="center-state">
        <div className="loading-brand" aria-hidden="true">
          <span className="brand-core">O</span>
          <span className="loading-orbit" />
        </div>
        <p className="eyebrow">Orivanta workspace</p>
        <h1>Building your world view</h1>
        <p>Loading the secure, versioned geographic workspace…</p>
      </main>
    );
  }

  if (loadState.status === "error") {
    return (
      <main className="center-state error-state">
        <p className="eyebrow">Dataset unavailable</p>
        <h1>The globe has nothing to show yet.</h1>
        <p>{loadState.message}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  const { manifest } = loadState.layer;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#place-browser-title">
        Skip to atlas search
      </a>

      <header className="topbar">
        <div className="topbar-primary">
          <a className="brand" href="/" aria-label="Orivanta home">
            <span className="brand-mark" aria-hidden="true">
              <span>O</span>
            </span>
            <span className="brand-copy">
              <strong>Orivanta</strong>
              <small>Spatial intelligence</small>
            </span>
          </a>
          <span className="topbar-divider" aria-hidden="true" />
          <div className="workspace-identity">
            <span className="workspace-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
                <path d="M4 12h16M12 4c2.3 2.2 3.5 4.9 3.5 8S14.3 17.8 12 20c-2.3-2.2-3.5-4.9-3.5-8S9.7 6.2 12 4Z" />
              </svg>
            </span>
            <div>
              <strong>World Atlas</strong>
              <small>Exploration workspace</small>
            </div>
          </div>
        </div>

        <div className="topbar-tools">
          <div className="topbar-status" role="status">
            <span
              className={`status-dot ${globeReady ? "is-ready" : ""}`}
              aria-hidden="true"
            />
            {globeError
              ? "Text experience available"
              : globeReady
                ? "Globe ready"
                : "Starting globe"}
          </div>
          <button
            type="button"
            className="topbar-button icon-only"
            onClick={() => setShowHelp((visible) => !visible)}
            aria-label="Open keyboard shortcuts"
            aria-expanded={showHelp}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-1 .65-1.5 1.1-1.5 2M12 17h.01" />
            </svg>
          </button>
          <button
            type="button"
            className="topbar-button"
            onClick={exploreRandom}
            aria-label="Explore a random place"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 7h3.5c4.5 0 4.5 10 9 10H20M17 4l3 3-3 3M4 17h3.5c1.2 0 2.1-.7 2.9-1.7M17 14l3 3-3 3M13.6 8.7c.8-1 1.7-1.7 2.9-1.7H20" />
            </svg>
            <span>Explore</span>
          </button>
          {!globeFocused ? (
            <button
              type="button"
              className="topbar-button focus-globe-button"
              onClick={focusGlobe}
              aria-label="Focus globe view"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
              </svg>
              <span>Globe only</span>
            </button>
          ) : null}
          <button
            type="button"
            className={`share-button ${
              shareState !== "idle" ? `is-${shareState}` : ""
            }`}
            onClick={shareCurrentView}
            aria-label="Share current view"
          >
            {shareState === "copied" ? (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m5 12 4 4L19 6" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M8.5 12.5 15.5 8m-7 3.5 7 4.5M18 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-1a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
            )}
            <span>
              {shareState === "copied"
                ? "Copied"
                : shareState === "failed"
                  ? "Try again"
                  : "Share view"}
            </span>
          </button>
        </div>

        {showHelp ? (
          <section className="shortcut-panel" aria-label="Keyboard shortcuts">
            <div className="shortcut-heading">
              <div>
                <p className="eyebrow">Move faster</p>
                <h2>Keyboard shortcuts</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                aria-label="Close keyboard shortcuts"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <dl className="shortcut-list">
              <div>
                <dt><kbd>/</kbd></dt>
                <dd>Search atlas</dd>
              </div>
              <div>
                <dt><kbd>?</kbd></dt>
                <dd>Toggle shortcuts</dd>
              </div>
              <div>
                <dt><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd></dt>
                <dd>Move the globe</dd>
              </div>
              <div>
                <dt><kbd>+</kbd><kbd>−</kbd></dt>
                <dd>Zoom in or out</dd>
              </div>
              <div>
                <dt><kbd>H</kbd></dt>
                <dd>Return home</dd>
              </div>
              <div>
                <dt><kbd>Esc</kbd></dt>
                <dd>Close the active panel</dd>
              </div>
            </dl>
          </section>
        ) : null}
      </header>

      <main
        className={`workspace ${
          !directoryOpen ? "is-directory-collapsed" : ""
        } ${!detailsOpen ? "is-details-collapsed" : ""} ${
          globeFocused ? "is-globe-focused" : ""
        }`}
      >
        <PlaceList
          places={places}
          countries={countries}
          usStates={usStates}
          query={query}
          filter={filter}
          selectedId={selectedId}
          selectedBoundaryId={selectedBoundaryId}
          collapsed={!directoryOpen}
          searchInputRef={searchInputRef}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onSelect={handlePlaceSelect}
          onSelectBoundary={handleBoundarySelect}
          onCollapse={() => setDirectoryOpen(false)}
        />

        <section className="globe-stage" aria-labelledby="globe-title">
          <div className="globe-stage-heading">
            <div>
              <div className="stage-kicker">
                <span className="live-indicator" aria-hidden="true" />
                Interactive atlas
              </div>
              <h1 id="globe-title">{manifest.title}</h1>
              <p>{manifest.description}</p>
            </div>
            <div className="dataset-chip">
              <span>{manifest.source.publisher}</span>
              <strong>{manifest.source.version}</strong>
            </div>
          </div>

          {globeError ? (
            <div className="globe-fallback" role="status">
              <p className="eyebrow">3D view unavailable</p>
              <h2>The atlas search still works.</h2>
              <p>{globeError}</p>
            </div>
          ) : (
            <>
              <Suspense
                fallback={
                  <div className="globe-fallback" role="status">
                    <p className="eyebrow">Starting 3D view</p>
                    <h2>The atlas search is ready.</h2>
                    <p>Loading the globe engine…</p>
                  </div>
                }
              >
                <GlobeView
                  ref={registerController}
                  places={places}
                  countries={countries}
                  usStates={usStates}
                  selectedPlaceId={selectedId}
                  selectedBoundaryId={selectedBoundaryId}
                  initialCamera={initialUrlState.camera}
                  reducedMotion={reducedMotion}
                  showCountries={showCountries}
                  showUsStates={showUsStates}
                  showStateDetail={stateDetailVisible}
                  onSelectPlace={selectPlaceAndReveal}
                  onSelectBoundary={selectBoundaryAndReveal}
                  onClearSelection={clearSelection}
                  onCameraChange={updateCamera}
                  onReady={handleGlobeReady}
                  onError={handleGlobeError}
                />
              </Suspense>
              <GlobeControls
                controller={controller}
                onFocusGlobe={() => controllerRef.current?.focus()}
              />
              <BoundaryLayers
                status={boundaryLoadState.status}
                placeCount={places.length}
                countryCount={countries.length}
                usStateCount={usStates.length}
                showCountries={showCountries}
                showUsStates={showUsStates}
                stateDetailVisible={stateDetailVisible}
                onShowCountriesChange={setShowCountries}
                onShowUsStatesChange={setShowUsStates}
              />
              <div className="globe-statusbar">
                <div
                  className="camera-readout"
                  aria-label="Current globe camera"
                >
                  <span>
                    <small>Latitude</small>
                    <strong>
                      {camera
                        ? formatCameraCoordinate(camera.latitude, "N", "S")
                        : "—"}
                    </strong>
                  </span>
                  <span>
                    <small>Longitude</small>
                    <strong>
                      {camera
                        ? formatCameraCoordinate(camera.longitude, "E", "W")
                        : "—"}
                    </strong>
                  </span>
                  <span>
                    <small>Altitude</small>
                    <strong>
                      {camera
                        ? `${Math.round(
                            camera.height / 1_000
                          ).toLocaleString()} km`
                        : "—"}
                    </strong>
                  </span>
                </div>
                <div className="globe-hint" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M8 11V7a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v3-1a2 2 0 0 1 4 0v3c0 4-2.8 7-7 7h-1.5a6 6 0 0 1-4.8-2.4L4 15a2 2 0 0 1 3-2.6L8 13.5V11Z" />
                  </svg>
                  Drag to orbit · Scroll to zoom
                </div>
              </div>
            </>
          )}
          <div className="collapsed-panel-launchers">
            {!directoryOpen ? (
              <button
                type="button"
                className="panel-launcher panel-launcher-left"
                onClick={() => setDirectoryOpen(true)}
                aria-label="Explore atlas"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M4 5h16M4 12h16M4 19h10" />
                </svg>
                <span>Explore atlas</span>
              </button>
            ) : null}
            {!detailsOpen && (selectedPlace || selectedBoundary) ? (
              <button
                type="button"
                className="panel-launcher panel-launcher-right"
                onClick={() => setDetailsOpen(true)}
                aria-label="Open details"
              >
                <span>Details</span>
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M5 5h14v14H5zM9 9h6M9 13h6M9 17h3" />
                </svg>
              </button>
            ) : null}
          </div>
        </section>

        <PlaceDetails
          place={selectedPlace}
          boundary={selectedBoundary}
          manifest={manifest}
          boundaryManifest={selectedBoundaryManifest}
          placeCount={places.length}
          capitalCount={capitalCount}
          boundaryCount={boundaryCount}
          collapsed={!detailsOpen}
          onClose={clearSelection}
          onCollapse={() => setDetailsOpen(false)}
          onExploreRandom={exploreRandom}
          onOpenHelp={() => setShowHelp(true)}
          onShare={shareCurrentView}
        />
      </main>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {shareState === "copied"
          ? "View link copied to clipboard."
          : shareState === "failed"
            ? "The view link could not be copied."
            : selectedPlace
              ? `${selectedPlace.properties.name}, ${selectedPlace.properties.countryName}, selected.`
              : selectedBoundary
                ? `${selectedBoundary.properties.name}, ${selectedBoundary.properties.level === "country" ? "country" : "U.S. state"}, selected.`
              : ""}
      </div>
    </div>
  );
}
