export interface CameraState {
  longitude: number;
  latitude: number;
  height: number;
}

export interface GlobeUrlState {
  placeId: string | null;
  camera: CameraState | null;
}

function finiteParam(params: URLSearchParams, name: string): number | null {
  const value = params.get(name);
  if (value === null) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function readUrlState(search: string): GlobeUrlState {
  const params = new URLSearchParams(search);
  const longitude = finiteParam(params, "lon");
  const latitude = finiteParam(params, "lat");
  const height = finiteParam(params, "height");
  const camera =
    longitude !== null &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    height !== null &&
    height > 0
      ? { longitude, latitude, height }
      : null;

  return {
    placeId: params.get("place"),
    camera
  };
}

export function writeUrlState(
  currentUrl: string,
  updates: {
    placeId?: string | null;
    camera?: CameraState;
  }
): string {
  const url = new URL(currentUrl);

  if ("placeId" in updates) {
    if (updates.placeId) {
      url.searchParams.set("place", updates.placeId);
    } else {
      url.searchParams.delete("place");
    }
  }

  if (updates.camera) {
    url.searchParams.set("lon", updates.camera.longitude.toFixed(3));
    url.searchParams.set("lat", updates.camera.latitude.toFixed(3));
    url.searchParams.set("height", Math.round(updates.camera.height).toString());
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
