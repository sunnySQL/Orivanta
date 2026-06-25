import Globe, { type GlobeInstance } from "globe.gl";
import { SRGBColorSpace } from "three";
import earthTextureUrl from "../../node_modules/three-globe/example/img/earth-day.jpg?url";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from "react";
import type {
  GlobeController,
  GlobeViewProps
} from "../globe/types";
import { visibleBoundaries } from "../globe/boundaries";
import type { BoundaryFeature, PlaceFeature } from "../types/data";
import { boundaryCamera } from "../utils/boundary";
import type { CameraState } from "../utils/urlState";

const EARTH_RADIUS_METERS = 6_371_000;
const HOME_CAMERA: CameraState = {
  longitude: 8,
  latitude: 18,
  height: 22_000_000
};

function heightToAltitude(height: number): number {
  return Math.max(0.12, height / EARTH_RADIUS_METERS);
}

function altitudeToHeight(altitude: number): number {
  return altitude * EARTH_RADIUS_METERS;
}

function placeFromObject(value: object): PlaceFeature {
  return value as PlaceFeature;
}

function pointLatitude(value: object): number {
  return placeFromObject(value).geometry.coordinates[1];
}

function pointLongitude(value: object): number {
  return placeFromObject(value).geometry.coordinates[0];
}

function pointLabel(value: object): HTMLElement {
  const place = placeFromObject(value);
  const label = document.createElement("span");
  label.textContent = `${place.properties.name} — ${place.properties.countryName}`;
  return label;
}

function boundaryFromObject(value: object): BoundaryFeature {
  return value as BoundaryFeature;
}

function boundaryLabel(value: object): HTMLElement {
  const boundary = boundaryFromObject(value);
  const label = document.createElement("span");
  const title = document.createElement("strong");
  const detail = document.createElement("span");
  title.textContent = boundary.properties.name;
  detail.textContent =
    boundary.properties.level === "country"
      ? ` — ${boundary.properties.region ?? "Country boundary"}`
      : " — United States";
  label.append(title, detail);
  return label;
}

function publishCamera(
  globe: GlobeInstance,
  onCameraChange: (camera: CameraState) => void
) {
  const pointOfView = globe.pointOfView();
  onCameraChange({
    longitude: pointOfView.lng,
    latitude: pointOfView.lat,
    height: altitudeToHeight(pointOfView.altitude)
  });
}

export const GlobeView = forwardRef<GlobeController, GlobeViewProps>(
  function GlobeView(
    {
      places,
      countries,
      usStates,
      selectedPlaceId,
      selectedBoundaryId,
      initialCamera,
      reducedMotion,
      showCountries,
      showUsStates,
      showStateDetail,
      onSelectPlace,
      onSelectBoundary,
      onClearSelection,
      onCameraChange,
      onReady,
      onError
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<GlobeInstance | null>(null);
    const selectedPlaceIdRef = useRef(selectedPlaceId);
    const selectedBoundaryIdRef = useRef(selectedBoundaryId);
    const reducedMotionRef = useRef(reducedMotion);
    selectedPlaceIdRef.current = selectedPlaceId;
    selectedBoundaryIdRef.current = selectedBoundaryId;
    reducedMotionRef.current = reducedMotion;

    useImperativeHandle(
      ref,
      () => ({
        home() {
          const globe = globeRef.current;
          if (!globe) return;
          globe.pointOfView(
            {
              lat: HOME_CAMERA.latitude,
              lng: HOME_CAMERA.longitude,
              altitude: heightToAltitude(HOME_CAMERA.height)
            },
            reducedMotionRef.current ? 0 : 850
          );
          publishCamera(globe, onCameraChange);
        },
        zoomIn() {
          const globe = globeRef.current;
          if (!globe) return;
          const current = globe.pointOfView();
          globe.pointOfView({
            altitude: Math.max(0.16, current.altitude * 0.72)
          });
          publishCamera(globe, onCameraChange);
        },
        zoomOut() {
          const globe = globeRef.current;
          if (!globe) return;
          const current = globe.pointOfView();
          globe.pointOfView({
            altitude: Math.min(4.5, current.altitude * 1.38)
          });
          publishCamera(globe, onCameraChange);
        },
        move(longitudeDelta, latitudeDelta) {
          const globe = globeRef.current;
          if (!globe) return;
          const current = globe.pointOfView();
          globe.pointOfView({
            lng: current.lng + longitudeDelta,
            lat: Math.max(-85, Math.min(85, current.lat + latitudeDelta))
          });
          publishCamera(globe, onCameraChange);
        },
        focus() {
          interactionRef.current?.focus();
        }
      }),
      [onCameraChange]
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let disposed = false;

      try {
        const globe = new Globe(container, {
          animateIn: !reducedMotion,
          waitForGlobeReady: true,
          rendererConfig: {
            alpha: false,
            antialias: true,
            powerPreference: "high-performance"
          }
        })
          .width(container.clientWidth)
          .height(container.clientHeight)
          .backgroundColor("#02050a")
          .globeImageUrl(earthTextureUrl)
          .showAtmosphere(true)
          .atmosphereColor("#7ee8fa")
          .atmosphereAltitude(0.16)
          .pointsData(places)
          .pointLat(pointLatitude)
          .pointLng(pointLongitude)
          .pointColor((value) => {
            const place = placeFromObject(value);
            return place.id === selectedPlaceIdRef.current
              ? "#7ee8fa"
              : place.properties.capitalLevel === "national"
                ? "#f6bf67"
                : "#d8a969";
          })
          .pointAltitude((value) =>
            placeFromObject(value).id === selectedPlaceIdRef.current
              ? 0.035
              : 0.012
          )
          .pointRadius((value) => {
            const place = placeFromObject(value);
            if (place.id === selectedPlaceIdRef.current) return 0.38;
            return place.properties.capitalLevel === "national" ? 0.2 : 0.13;
          })
          .pointResolution(10)
          .pointsTransitionDuration(reducedMotion ? 0 : 350)
          .pointLabel(pointLabel)
          .onPointClick((value) => onSelectPlace(placeFromObject(value).id))
          .polygonsData(
            visibleBoundaries(
              countries,
              usStates,
              showCountries,
              showUsStates,
              showStateDetail
            )
          )
          .polygonCapColor((value) => {
            const boundary = boundaryFromObject(value);
            if (boundary.id === selectedBoundaryIdRef.current) {
              return "rgba(115, 229, 209, 0.18)";
            }
            return boundary.properties.level === "country"
              ? "rgba(18, 37, 49, 0.14)"
              : "rgba(246, 191, 103, 0.025)";
          })
          .polygonSideColor(() => "rgba(0, 0, 0, 0)")
          .polygonStrokeColor((value) => {
            const boundary = boundaryFromObject(value);
            if (boundary.id === selectedBoundaryIdRef.current) {
              return "#73e5d1";
            }
            return boundary.properties.level === "country"
              ? "rgba(163, 207, 221, 0.72)"
              : "rgba(246, 191, 103, 0.92)";
          })
          .polygonAltitude((value) => {
            const boundary = boundaryFromObject(value);
            if (boundary.id === selectedBoundaryIdRef.current) return 0.012;
            return boundary.properties.level === "country" ? 0.003 : 0.006;
          })
          .polygonLabel(boundaryLabel)
          .onPolygonClick((value) =>
            onSelectBoundary(boundaryFromObject(value).id)
          )
          .onGlobeClick(onClearSelection)
          .onZoom(() => {
            if (!disposed) publishCamera(globe, onCameraChange);
          })
          .onGlobeReady(() => {
            if (!disposed) onReady();
          });

        globeRef.current = globe;
        globe.renderer().outputColorSpace = SRGBColorSpace;
        globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

        const controls = globe.controls();
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.42;
        controls.zoomSpeed = 0.75;
        controls.minDistance = 112;
        controls.maxDistance = 570;

        const camera = initialCamera ?? HOME_CAMERA;
        globe.pointOfView({
          lat: camera.latitude,
          lng: camera.longitude,
          altitude: heightToAltitude(camera.height)
        });
        publishCamera(globe, onCameraChange);

        const resizeObserver = new ResizeObserver(([entry]) => {
          if (!entry || disposed) return;
          globe
            .width(Math.max(1, entry.contentRect.width))
            .height(Math.max(1, entry.contentRect.height));
        });
        resizeObserver.observe(container);

        const handleVisibility = () => {
          if (document.hidden) globe.pauseAnimation();
          else globe.resumeAnimation();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
          disposed = true;
          document.removeEventListener("visibilitychange", handleVisibility);
          resizeObserver.disconnect();
          globeRef.current = null;
          globe._destructor();
        };
      } catch (error) {
        console.error("Globe.gl initialization failed.", error);
        onError(
          error instanceof Error
            ? error.message
            : "The lighter globe could not start."
        );
      }
    }, [
      initialCamera,
      onClearSelection,
      onCameraChange,
      onError,
      onReady,
      onSelectBoundary,
      onSelectPlace,
      places,
      reducedMotion
    ]);

    useEffect(() => {
      const globe = globeRef.current;
      if (!globe) return;

      globe
        .polygonsData(
        visibleBoundaries(
          countries,
          usStates,
          showCountries,
          showUsStates,
          showStateDetail
        )
        )
        .polygonCapColor((value) => {
          const boundary = boundaryFromObject(value);
          if (boundary.id === selectedBoundaryId) {
            return "rgba(115, 229, 209, 0.18)";
          }
          return boundary.properties.level === "country"
            ? "rgba(18, 37, 49, 0.14)"
            : "rgba(246, 191, 103, 0.025)";
        })
        .polygonStrokeColor((value) => {
          const boundary = boundaryFromObject(value);
          if (boundary.id === selectedBoundaryId) {
            return "#73e5d1";
          }
          return boundary.properties.level === "country"
            ? "rgba(163, 207, 221, 0.72)"
            : "rgba(246, 191, 103, 0.92)";
        })
        .polygonAltitude((value) => {
          const boundary = boundaryFromObject(value);
          if (boundary.id === selectedBoundaryId) return 0.012;
          return boundary.properties.level === "country" ? 0.003 : 0.006;
        });
    }, [
      countries,
      selectedBoundaryId,
      showCountries,
      showStateDetail,
      showUsStates,
      usStates
    ]);

    useEffect(() => {
      const globe = globeRef.current;
      if (!globe) return;

      globe
        .pointColor((value) => {
          const place = placeFromObject(value);
          return place.id === selectedPlaceId
            ? "#7ee8fa"
            : place.properties.capitalLevel === "national"
              ? "#f6bf67"
              : "#d8a969";
        })
        .pointAltitude((value) =>
          placeFromObject(value).id === selectedPlaceId ? 0.035 : 0.012
        )
        .pointRadius((value) => {
          const place = placeFromObject(value);
          if (place.id === selectedPlaceId) return 0.38;
          return place.properties.capitalLevel === "national" ? 0.2 : 0.13;
        });

      const selectedPlace = selectedPlaceId
        ? places.find((place) => place.id === selectedPlaceId)
        : null;

      globe
        .ringsData(selectedPlace && !reducedMotion ? [selectedPlace] : [])
        .ringLat(pointLatitude)
        .ringLng(pointLongitude)
        .ringColor(() => ["#7ee8fa", "rgba(126, 232, 250, 0)"])
        .ringMaxRadius(2.8)
        .ringPropagationSpeed(1.4)
        .ringRepeatPeriod(750);

      if (selectedPlace) {
        const [longitude, latitude] = selectedPlace.geometry.coordinates;
        globe.pointOfView(
          { lat: latitude, lng: longitude, altitude: 0.72 },
          reducedMotion ? 0 : 900
        );
        publishCamera(globe, onCameraChange);
      }
    }, [onCameraChange, places, reducedMotion, selectedPlaceId]);

    useEffect(() => {
      const globe = globeRef.current;
      if (!globe || !selectedBoundaryId) return;

      const selectedBoundary = [...countries, ...usStates].find(
        (boundary) => boundary.id === selectedBoundaryId
      );

      if (!selectedBoundary) return;

      const nextCamera = boundaryCamera(selectedBoundary);
      globe.pointOfView(
        {
          lat: nextCamera.latitude,
          lng: nextCamera.longitude,
          altitude: heightToAltitude(nextCamera.height)
        },
        reducedMotion ? 0 : 900
      );
      publishCamera(globe, onCameraChange);
    }, [
      countries,
      onCameraChange,
      reducedMotion,
      selectedBoundaryId,
      usStates
    ]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      const globe = globeRef.current;
      if (!globe) return;

      const current = globe.pointOfView();
      const actions: Record<string, () => void> = {
        ArrowLeft: () => globe.pointOfView({ lng: current.lng - 6 }, 0),
        ArrowRight: () => globe.pointOfView({ lng: current.lng + 6 }, 0),
        ArrowUp: () =>
          globe.pointOfView({ lat: Math.min(85, current.lat + 5) }, 0),
        ArrowDown: () =>
          globe.pointOfView({ lat: Math.max(-85, current.lat - 5) }, 0),
        "+": () =>
          globe.pointOfView({
            altitude: Math.max(0.16, current.altitude * 0.72)
          }),
        "=": () =>
          globe.pointOfView({
            altitude: Math.max(0.16, current.altitude * 0.72)
          }),
        "-": () =>
          globe.pointOfView({
            altitude: Math.min(4.5, current.altitude * 1.38)
          }),
        h: () =>
          globe.pointOfView({
            lat: HOME_CAMERA.latitude,
            lng: HOME_CAMERA.longitude,
            altitude: heightToAltitude(HOME_CAMERA.height)
          }),
        H: () =>
          globe.pointOfView({
            lat: HOME_CAMERA.latitude,
            lng: HOME_CAMERA.longitude,
            altitude: heightToAltitude(HOME_CAMERA.height)
          })
      };

      const action = actions[event.key];
      if (action) {
        event.preventDefault();
        action();
        publishCamera(globe, onCameraChange);
      }
    }

    return (
      <div
        ref={interactionRef}
        className="globe-interaction"
        role="region"
        aria-label="Interactive globe. Use arrow keys to move, plus and minus to zoom, or H to return home."
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div ref={containerRef} className="globe-canvas" aria-hidden="true" />
      </div>
    );
  }
);
