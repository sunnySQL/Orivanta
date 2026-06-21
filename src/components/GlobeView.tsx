import {
  Cartesian2,
  Cartesian3,
  Color,
  ConstantProperty,
  DistanceDisplayCondition,
  EllipsoidTerrainProvider,
  Entity,
  HeightReference,
  LabelStyle,
  Math as CesiumMath,
  TileMapServiceImageryProvider,
  Viewer,
  buildModuleUrl
} from "cesium";
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
import type { CameraState } from "../utils/urlState";
import type { PlaceFeature } from "../types/data";

const HOME_CAMERA: CameraState = {
  longitude: 8,
  latitude: 18,
  height: 22_000_000
};

const DEFAULT_POINT = Color.fromCssColorString("#f6bf67");
const SELECTED_POINT = Color.fromCssColorString("#7ee8fa");

function flyDuration(reducedMotion: boolean): number {
  return reducedMotion ? 0 : 1.2;
}

function publishCamera(
  viewer: Viewer,
  onCameraChange: (camera: CameraState) => void
) {
  const position = viewer.camera.positionCartographic;
  onCameraChange({
    longitude: CesiumMath.toDegrees(position.longitude),
    latitude: CesiumMath.toDegrees(position.latitude),
    height: position.height
  });
}

export const GlobeView = forwardRef<GlobeController, GlobeViewProps>(
  function GlobeView(
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
    const viewerRef = useRef<Viewer | null>(null);
    const entitiesRef = useRef(new Map<string, Entity>());
    const previousSelectionRef = useRef<string | null>(null);
    const reducedMotionRef = useRef(reducedMotion);
    reducedMotionRef.current = reducedMotion;

    useImperativeHandle(
      ref,
      () => ({
        home() {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              HOME_CAMERA.longitude,
              HOME_CAMERA.latitude,
              HOME_CAMERA.height
            ),
            duration: flyDuration(reducedMotionRef.current)
          });
        },
        zoomIn() {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.zoomIn(
            Math.max(viewer.camera.positionCartographic.height * 0.3, 50_000)
          );
          publishCamera(viewer, onCameraChange);
        },
        zoomOut() {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.zoomOut(
            Math.max(viewer.camera.positionCartographic.height * 0.3, 50_000)
          );
          publishCamera(viewer, onCameraChange);
        },
        move(longitudeDelta, latitudeDelta) {
          const viewer = viewerRef.current;
          if (!viewer) return;
          const current = viewer.camera.positionCartographic;
          const longitude = CesiumMath.toDegrees(current.longitude);
          const latitude = CesiumMath.toDegrees(current.latitude);
          viewer.camera.setView({
            destination: Cartesian3.fromDegrees(
              longitude + longitudeDelta,
              Math.max(-85, Math.min(85, latitude + latitudeDelta)),
              current.height
            )
          });
          publishCamera(viewer, onCameraChange);
        },
        focus() {
          interactionRef.current?.focus();
        }
      }),
      []
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const target = container;

      let disposed = false;
      let viewer: Viewer | null = null;
      const entityMap = new Map<string, Entity>();

      async function initialize() {
        try {
          viewer = new Viewer(target, {
            animation: false,
            baseLayer: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            navigationHelpButton: false,
            sceneModePicker: false,
            selectionIndicator: false,
            scene3DOnly: true,
            requestRenderMode: true,
            maximumRenderTimeChange: Number.POSITIVE_INFINITY,
            timeline: false,
            terrainProvider: new EllipsoidTerrainProvider()
          });

          if (disposed) {
            viewer.destroy();
            return;
          }

          viewerRef.current = viewer;
          viewer.scene.globe.enableLighting = true;
          viewer.scene.globe.showGroundAtmosphere = true;
          viewer.scene.fog.enabled = true;
          viewer.scene.highDynamicRange = true;
          viewer.scene.screenSpaceCameraController.minimumZoomDistance = 80_000;
          viewer.scene.screenSpaceCameraController.maximumZoomDistance =
            30_000_000;

          const imagery = await TileMapServiceImageryProvider.fromUrl(
            buildModuleUrl("Assets/Textures/NaturalEarthII")
          );

          if (disposed || viewer.isDestroyed()) {
            return;
          }
          viewer.imageryLayers.addImageryProvider(imagery);

          for (const place of places) {
            const [longitude, latitude] = place.geometry.coordinates;
            const isNational = place.properties.capitalLevel === "national";
            const entity = viewer.entities.add({
              id: place.id,
              name: place.properties.name,
              position: Cartesian3.fromDegrees(longitude, latitude),
              point: {
                pixelSize: isNational ? 8 : 6,
                color: DEFAULT_POINT,
                outlineColor: Color.fromCssColorString("#07111f"),
                outlineWidth: 2,
                heightReference: HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
              },
              label: {
                text: place.properties.name,
                font: "600 14px system-ui",
                fillColor: Color.WHITE,
                outlineColor: Color.fromCssColorString("#07111f"),
                outlineWidth: 4,
                style: LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cartesian2(0, -18),
                distanceDisplayCondition: new DistanceDisplayCondition(
                  0,
                  isNational ? 6_500_000 : 2_500_000
                ),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
              }
            });
            entityMap.set(place.id, entity);
          }

          entitiesRef.current = entityMap;

          viewer.selectedEntityChanged.addEventListener((entity) => {
            if (!entity) {
              onSelect(null);
              return;
            }

            if (entityMap.has(entity.id)) {
              onSelect(entity.id);
            }
          });

          viewer.camera.moveEnd.addEventListener(() => {
            const position = viewer?.camera.positionCartographic;
            if (!position) return;
            onCameraChange({
              longitude: CesiumMath.toDegrees(position.longitude),
              latitude: CesiumMath.toDegrees(position.latitude),
              height: position.height
            });
          });

          const camera = initialCamera ?? HOME_CAMERA;
          viewer.camera.setView({
            destination: Cartesian3.fromDegrees(
              camera.longitude,
              camera.latitude,
              camera.height
            )
          });

          if (selectedId) {
            const selectedEntity = entityMap.get(selectedId);
            const selectedPlace = places.find(
              (place) => place.id === selectedId
            );
            viewer.selectedEntity = selectedEntity;
            if (selectedEntity?.point) {
              selectedEntity.point.color = new ConstantProperty(SELECTED_POINT);
              selectedEntity.point.pixelSize = new ConstantProperty(14);
            }
            if (selectedPlace) {
              const [longitude, latitude] = selectedPlace.geometry.coordinates;
              viewer.camera.setView({
                destination: Cartesian3.fromDegrees(
                  longitude,
                  latitude,
                  1_800_000
                )
              });
            }
            previousSelectionRef.current = selectedId;
          }

          onReady();
        } catch (error) {
          console.error("Globe initialization failed.", error);
          onError(
            error instanceof Error ? error.message : "The globe could not start."
          );
        }
      }

      void initialize();

      return () => {
        disposed = true;
        entitiesRef.current = new Map();
        viewerRef.current = null;
        if (viewer && !viewer.isDestroyed()) {
          viewer.destroy();
        }
      };
    }, [
      initialCamera,
      onCameraChange,
      onError,
      onReady,
      onSelect,
      places
    ]);

    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer) return;

      const previousId = previousSelectionRef.current;
      const previousEntity = previousId
        ? entitiesRef.current.get(previousId)
        : undefined;
      if (previousEntity?.point) {
        previousEntity.point.color = new ConstantProperty(DEFAULT_POINT);
        previousEntity.point.pixelSize = new ConstantProperty(
          previousId &&
            places.find((place) => place.id === previousId)?.properties
              .capitalLevel === "national"
            ? 8
            : 6
        );
      }

      const entity = selectedId
        ? entitiesRef.current.get(selectedId)
        : undefined;
      viewer.selectedEntity = entity;

      if (entity?.point) {
        entity.point.color = new ConstantProperty(SELECTED_POINT);
        entity.point.pixelSize = new ConstantProperty(14);
        const place = places.find((candidate) => candidate.id === selectedId);
        if (place) {
          const [longitude, latitude] = place.geometry.coordinates;
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(longitude, latitude, 1_800_000),
            duration: flyDuration(reducedMotion)
          });
        }
      }

      previousSelectionRef.current = selectedId;
    }, [places, reducedMotion, selectedId]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      const controller = {
        ArrowLeft: () => refMove(-6, 0),
        ArrowRight: () => refMove(6, 0),
        ArrowUp: () => refMove(0, 5),
        ArrowDown: () => refMove(0, -5),
        "+": () => refZoom(true),
        "=": () => refZoom(true),
        "-": () => refZoom(false),
        h: () => refHome(),
        H: () => refHome()
      }[event.key];

      if (controller) {
        event.preventDefault();
        controller();
      }
    }

    function refMove(longitudeDelta: number, latitudeDelta: number) {
      const viewer = viewerRef.current;
      if (!viewer) return;
      const current = viewer.camera.positionCartographic;
      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(
          CesiumMath.toDegrees(current.longitude) + longitudeDelta,
          Math.max(
            -85,
            Math.min(
              85,
              CesiumMath.toDegrees(current.latitude) + latitudeDelta
            )
          ),
          current.height
        )
      });
      publishCamera(viewer, onCameraChange);
    }

    function refZoom(zoomIn: boolean) {
      const viewer = viewerRef.current;
      if (!viewer) return;
      const amount = Math.max(
        viewer.camera.positionCartographic.height * 0.3,
        50_000
      );
      if (zoomIn) viewer.camera.zoomIn(amount);
      else viewer.camera.zoomOut(amount);
      publishCamera(viewer, onCameraChange);
    }

    function refHome() {
      const viewer = viewerRef.current;
      if (!viewer) return;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          HOME_CAMERA.longitude,
          HOME_CAMERA.latitude,
          HOME_CAMERA.height
        ),
        duration: flyDuration(reducedMotion)
      });
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
