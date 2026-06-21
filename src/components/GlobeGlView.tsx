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
import {
  polygonFixtures,
  routeFixtures,
  type LongitudeLatitude,
  type PolygonFixture,
  type RouteFixture
} from "../globe/fixtures";
import type { PlaceFeature } from "../types/data";
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

function routeFromObject(value: object): RouteFixture {
  return value as RouteFixture;
}

function polygonFromObject(value: object): PolygonFixture {
  return value as PolygonFixture;
}

function coordinateFromObject(value: object): LongitudeLatitude {
  return value as unknown as LongitudeLatitude;
}

function fixtureLabel(name: string, description: string): HTMLElement {
  const label = document.createElement("span");
  const title = document.createElement("strong");
  const detail = document.createElement("span");
  title.textContent = name;
  detail.textContent = ` — ${description}`;
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

export const GlobeGlView = forwardRef<GlobeController, GlobeViewProps>(
  function GlobeGlView(
    {
      places,
      selectedId,
      initialCamera,
      reducedMotion,
      onSelect,
      onCameraChange,
      onReady,
      onError
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<GlobeInstance | null>(null);
    const selectedIdRef = useRef(selectedId);
    const reducedMotionRef = useRef(reducedMotion);
    selectedIdRef.current = selectedId;
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
            return place.id === selectedIdRef.current
              ? "#7ee8fa"
              : place.properties.capitalLevel === "national"
                ? "#f6bf67"
                : "#d8a969";
          })
          .pointAltitude((value) =>
            placeFromObject(value).id === selectedIdRef.current ? 0.035 : 0.012
          )
          .pointRadius((value) => {
            const place = placeFromObject(value);
            if (place.id === selectedIdRef.current) return 0.38;
            return place.properties.capitalLevel === "national" ? 0.2 : 0.13;
          })
          .pointResolution(10)
          .pointsTransitionDuration(reducedMotion ? 0 : 350)
          .pointLabel(pointLabel)
          .onPointClick((value) => onSelect(placeFromObject(value).id))
          .pathsData([...routeFixtures])
          .pathPoints((value) => routeFromObject(value).coordinates)
          .pathPointLng((value) => coordinateFromObject(value)[0])
          .pathPointLat((value) => coordinateFromObject(value)[1])
          .pathColor(() => "#7ee8fa")
          .pathStroke(0.38)
          .pathPointAlt(0.018)
          .pathDashLength(0.7)
          .pathDashGap(0.18)
          .pathDashAnimateTime(reducedMotion ? 0 : 4_800)
          .pathLabel((value) => {
            const route = routeFromObject(value);
            return fixtureLabel(route.name, route.description);
          })
          .polygonsData([...polygonFixtures])
          .polygonCapColor(() => "rgba(246, 191, 103, 0.24)")
          .polygonSideColor(() => "rgba(246, 191, 103, 0.08)")
          .polygonStrokeColor(() => "#f6bf67")
          .polygonAltitude(0.008)
          .polygonLabel((value) => {
            const polygon = polygonFromObject(value);
            return fixtureLabel(
              polygon.properties.name,
              polygon.properties.description
            );
          })
          .onGlobeClick(() => onSelect(null))
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
      onCameraChange,
      onError,
      onReady,
      onSelect,
      places,
      reducedMotion
    ]);

    useEffect(() => {
      const globe = globeRef.current;
      if (!globe) return;

      globe
        .pointColor((value) => {
          const place = placeFromObject(value);
          return place.id === selectedId
            ? "#7ee8fa"
            : place.properties.capitalLevel === "national"
              ? "#f6bf67"
              : "#d8a969";
        })
        .pointAltitude((value) =>
          placeFromObject(value).id === selectedId ? 0.035 : 0.012
        )
        .pointRadius((value) => {
          const place = placeFromObject(value);
          if (place.id === selectedId) return 0.38;
          return place.properties.capitalLevel === "national" ? 0.2 : 0.13;
        });

      const selectedPlace = selectedId
        ? places.find((place) => place.id === selectedId)
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
      }
    }, [places, reducedMotion, selectedId]);

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
        className="globe-interaction globe-gl-interaction"
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
