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
import { FoundationFixtures } from "./components/FoundationFixtures";
import { PlaceDetails } from "./components/PlaceDetails";
import { PlaceList } from "./components/PlaceList";
import { loadDefaultLayer } from "./data/loadLayer";
import type { GlobeController } from "./globe/types";
import { useReducedMotion } from "./hooks/useReducedMotion";
import type { LoadedLayer, PlaceFeature } from "./types/data";
import {
  readUrlState,
  writeUrlState,
  type CameraState
} from "./utils/urlState";
import { markPerformance } from "./utils/performance";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; layer: LoadedLayer }
  | { status: "error"; message: string };

const initialUrlState = readUrlState(window.location.search);
const GlobeView = lazy(async () => {
  const module = await import("./components/GlobeView");
  return { default: module.GlobeView };
});

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialUrlState.placeId
  );
  const [globeReady, setGlobeReady] = useState(false);
  const [globeError, setGlobeError] = useState<string | null>(null);
  const [controller, setController] = useState<GlobeController | null>(null);
  const controllerRef = useRef<GlobeController>(null);
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
    markPerformance("globe-ready");
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
            <span>Product skeleton · Phase 1</span>
          </div>
        </div>
        <div className="topbar-tools">
          <div className="topbar-status">
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
                <GlobeView
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
              <FoundationFixtures />
              <div className="globe-hint">
                <span>Globe.gl foundation</span>
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
