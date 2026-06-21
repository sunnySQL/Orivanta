import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { GlobeControls } from "./components/GlobeControls";
import { PlaceDetails } from "./components/PlaceDetails";
import { PlaceList } from "./components/PlaceList";
import { loadDefaultLayer } from "./data/loadLayer";
import {
  globeEngineLabels,
  readEngine,
  writeEngine,
  type GlobeController,
  type GlobeEngineId
} from "./globe/types";
import { useReducedMotion } from "./hooks/useReducedMotion";
import type { LoadedLayer, PlaceFeature } from "./types/data";
import {
  readUrlState,
  writeUrlState,
  type CameraState
} from "./utils/urlState";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; layer: LoadedLayer }
  | { status: "error"; message: string };

const initialUrlState = readUrlState(window.location.search);
const CesiumGlobeView = lazy(async () => {
  const module = await import("./components/GlobeView");
  return { default: module.GlobeView };
});
const GlobeGlView = lazy(async () => {
  const module = await import("./components/GlobeGlView");
  return { default: module.GlobeGlView };
});

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState<GlobeEngineId>(() =>
    readEngine(window.location.search)
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialUrlState.placeId
  );
  const [globeReady, setGlobeReady] = useState(false);
  const [globeError, setGlobeError] = useState<string | null>(null);
  const [controller, setController] = useState<GlobeController | null>(null);
  const controllerRef = useRef<GlobeController>(null);
  const reducedMotion = useReducedMotion();
  const ActiveGlobeView =
    engine === "cesium" ? CesiumGlobeView : GlobeGlView;

  useEffect(() => {
    setGlobeReady(false);
    setGlobeError(null);
    setController(null);
    controllerRef.current = null;
  }, [engine]);

  useEffect(() => {
    const abortController = new AbortController();
    loadDefaultLayer(abortController.signal)
      .then((layer) => setLoadState({ status: "ready", layer }))
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

  const places = loadState.status === "ready" ? loadState.layer.places : [];
  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedId) ?? null,
    [places, selectedId]
  );

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

  const selectPlace = useCallback((id: string | null) => {
    setSelectedId(id);
    window.history.replaceState(
      null,
      "",
      writeUrlState(window.location.href, { placeId: id })
    );
  }, []);

  const updateCamera = useCallback((camera: CameraState) => {
    window.history.replaceState(
      null,
      "",
      writeUrlState(window.location.href, { camera })
    );
  }, []);

  const handleGlobeReady = useCallback(() => {
    setGlobeReady(true);
  }, []);

  const handleGlobeError = useCallback((message: string) => {
    setGlobeError(message);
  }, []);

  const registerController = useCallback(
    (value: GlobeController | null) => {
      controllerRef.current = value;
      setController(value);
    },
    []
  );

  function handlePlaceSelect(place: PlaceFeature) {
    selectPlace(place.id);
  }

  function selectEngine(nextEngine: GlobeEngineId) {
    if (nextEngine === engine) return;
    setEngine(nextEngine);
    window.history.replaceState(
      null,
      "",
      writeEngine(window.location.href, nextEngine)
    );
  }

  if (loadState.status === "loading") {
    return (
      <main className="center-state">
        <div className="loading-orbit" aria-hidden="true" />
        <p className="eyebrow">Orivanta</p>
        <h1>Preparing the globe</h1>
        <p>Loading the versioned foundation dataset…</p>
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
        Skip to place browser
      </a>

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            O
          </span>
          <div>
            <p>Orivanta</p>
            <span>Globe foundation · Phase 0</span>
          </div>
        </div>
        <div className="topbar-tools">
          <div className="engine-switch" aria-label="Globe engine comparison">
            {(["globe-gl", "cesium"] as const).map((candidate) => (
              <button
                key={candidate}
                type="button"
                aria-pressed={engine === candidate}
                onClick={() => selectEngine(candidate)}
              >
                {globeEngineLabels[candidate]}
              </button>
            ))}
          </div>
          <div className="topbar-status">
            <span
              className={`status-dot ${globeReady ? "is-ready" : ""}`}
              aria-hidden="true"
            />
            {globeError
              ? "Text experience available"
              : globeReady
                ? `${globeEngineLabels[engine]} ready`
                : `Starting ${globeEngineLabels[engine]}`}
          </div>
        </div>
      </header>

      <main className="workspace">
        <PlaceList
          places={places}
          query={query}
          selectedId={selectedId}
          onQueryChange={setQuery}
          onSelect={handlePlaceSelect}
        />

        <section className="globe-stage" aria-labelledby="globe-title">
          <div className="globe-stage-heading">
            <div>
              <p className="eyebrow">Foundation layer</p>
              <h1 id="globe-title">{manifest.title}</h1>
            </div>
            <p>{manifest.attribution}</p>
          </div>

          {globeError ? (
            <div className="globe-fallback" role="status">
              <p className="eyebrow">3D view unavailable</p>
              <h2>The place browser still works.</h2>
              <p>{globeError}</p>
            </div>
          ) : (
            <>
              <Suspense
                fallback={
                  <div className="globe-fallback" role="status">
                    <p className="eyebrow">Starting 3D view</p>
                    <h2>The place browser is ready.</h2>
                    <p>Loading the globe engine…</p>
                  </div>
                }
              >
                <ActiveGlobeView
                  key={engine}
                  ref={registerController}
                  places={places}
                  selectedId={selectedId}
                  initialCamera={initialUrlState.camera}
                  reducedMotion={reducedMotion}
                  onSelect={selectPlace}
                  onCameraChange={updateCamera}
                  onReady={handleGlobeReady}
                  onError={handleGlobeError}
                />
              </Suspense>
              <GlobeControls
                controller={controller}
                onFocusGlobe={() => controllerRef.current?.focus()}
              />
              <div className="globe-hint">
                <span>{globeEngineLabels[engine]} candidate</span>
                <span aria-hidden="true">Drag to rotate · Scroll to zoom</span>
              </div>
            </>
          )}
        </section>

        <PlaceDetails
          place={selectedPlace}
          manifest={manifest}
          onClose={() => selectPlace(null)}
        />
      </main>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedPlace
          ? `${selectedPlace.properties.name}, ${selectedPlace.properties.countryName}, selected.`
          : ""}
      </div>
    </div>
  );
}
