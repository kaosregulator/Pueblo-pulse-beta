/** Pueblo's geography, shared by every source. */

export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** Downtown Pueblo, near the Riverwalk. */
export const PUEBLO_CENTER = Object.freeze({ lat: 38.2544, lon: -104.6091 });

/**
 * The area the hub asks sources for: the city, Pueblo West, Lake Pueblo,
 * the Mesa, Blende/Avondale and the I-25 approaches. West, south, east, north.
 */
export const PUEBLO_BBOX: Readonly<BBox> = Object.freeze({
  west: -104.95,
  south: 38.1,
  east: -104.4,
  north: 38.45,
});

/** Pueblo County, for county-wide layers. */
export const PUEBLO_COUNTY_BBOX: Readonly<BBox> = Object.freeze({
  west: -105.06,
  south: 37.73,
  east: -104.05,
  north: 38.53,
});

export function inBBox(lon: number, lat: number, box: Readonly<BBox> = PUEBLO_BBOX): boolean {
  return lon >= box.west && lon <= box.east && lat >= box.south && lat <= box.north;
}

/** The first coordinate of any GeoJSON geometry, for bbox filtering. */
export function firstPosition(geometry: any): [number, number] | null {
  let c = geometry?.coordinates;
  while (Array.isArray(c) && Array.isArray(c[0])) c = c[0];
  if (Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1])) return [c[0], c[1]];
  return null;
}
