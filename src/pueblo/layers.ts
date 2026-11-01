/**
 * What the Pueblo map can show, in the four groups the drawer uses. A layer
 * comes from one of three places:
 *
 * - "engine": a layer God's Eye View already owns (radar, wind, fires ...).
 *   Pueblo Pulse only switches it on or off.
 * - "hub": a Pueblo data hub source (/api/pueblo). Listed automatically from
 *   the hub's catalog, so a new hub source needs no change here.
 * - "pulse": Pueblo Pulse's own records (businesses, events, reports).
 */
import type { BusinessItem, EventItem, JobItem, LostFoundItem, NeighborhoodID, SafetyAlert } from "../types";
import type { Freshness, GeoFeature } from "./hub";

export type LayerGroup = "live" | "geo" | "community" | "safety";

export const GROUPS: Array<{ id: LayerGroup; title: string; blurb: string }> = [
  { id: "live", title: "Live conditions", blurb: "Weather, air, traffic and transit" },
  { id: "community", title: "Community", blurb: "From Pueblo Pulse members" },
  { id: "geo", title: "Places and boundaries", blurb: "Parks, trails, districts and zoning" },
  { id: "safety", title: "Safety and environment", blurb: "Alerts, fire, flood and rivers" },
];

export interface EngineLayer {
  kind: "engine";
  id: string;
  /** God's Eye View layer id. */
  engineId: string;
  name: string;
  group: LayerGroup;
  description: string;
  freshness: Freshness;
  /** Shown instead of the freshness label when the layer has a caveat. */
  note?: string;
  color: string;
  attribution: string;
}

/** God's Eye View layers worth offering for Pueblo (see its provider inventory). */
export const ENGINE_LAYERS: EngineLayer[] = [
  { kind: "engine", id: "engine:radar", engineId: "weather-radar", name: "Rain radar", group: "live", description: "NOAA MRMS radar, about every 4 minutes", freshness: "near-live", color: "#0ea5e9", attribution: "NOAA nowCOAST" },
  { kind: "engine", id: "engine:satellite", engineId: "weather-satellite", name: "Satellite clouds", group: "live", description: "GOES infrared cloud imagery", freshness: "near-live", color: "#64748b", attribution: "NOAA nowCOAST" },
  { kind: "engine", id: "engine:wind", engineId: "wind", name: "Wind and temperature", group: "live", description: "Model wind field, updated every 6 hours", freshness: "periodic", color: "#14b8a6", attribution: "NOAA GFS" },
  { kind: "engine", id: "engine:lightning", engineId: "weather-lightning", name: "Lightning", group: "live", description: "Strike density over the last 15 minutes", freshness: "near-live", color: "#eab308", attribution: "NOAA nowCOAST" },
  { kind: "engine", id: "engine:traffic", engineId: "traffic", name: "Traffic flow", group: "live", description: "Road congestion", freshness: "live", note: "Live with a TomTom key", color: "#ef4444", attribution: "TomTom" },
  { kind: "engine", id: "engine:flights", engineId: "flights", name: "Aircraft", group: "live", description: "Planes over Pueblo and Pueblo Memorial Airport", freshness: "live", color: "#6366f1", attribution: "OpenSky / adsb.lol" },
  { kind: "engine", id: "engine:fires", engineId: "fire-perimeters", name: "Wildfire perimeters", group: "safety", description: "Current interagency fire perimeters", freshness: "periodic", color: "#dc2626", attribution: "NIFC WFIGS" },
  { kind: "engine", id: "engine:hotspots", engineId: "local-firms", name: "Satellite fire detections", group: "safety", description: "Heat detections, roughly 3 hours behind", freshness: "near-live", color: "#f97316", attribution: "NASA FIRMS" },
  { kind: "engine", id: "engine:quakes", engineId: "earthquakes", name: "Earthquakes", group: "safety", description: "The last 24 hours", freshness: "near-live", color: "#a855f7", attribution: "USGS" },
  { kind: "engine", id: "engine:dams", engineId: "local-dams", name: "Dams", group: "geo", description: "Including Pueblo Dam", freshness: "static", color: "#0369a1", attribution: "OpenStreetMap" },
];

export interface PulseLayer {
  kind: "pulse";
  id: string;
  name: string;
  group: LayerGroup;
  description: string;
  color: string;
  detailType: string;
}

export const PULSE_LAYERS: PulseLayer[] = [
  { kind: "pulse", id: "pulse:restaurants", name: "Restaurants and food", group: "community", description: "Food businesses listed on Pueblo Pulse", color: "#ea580c", detailType: "business" },
  { kind: "pulse", id: "pulse:businesses", name: "Local businesses", group: "community", description: "Shops and services listed on Pueblo Pulse", color: "#2563eb", detailType: "business" },
  { kind: "pulse", id: "pulse:events", name: "Events", group: "community", description: "Upcoming community events", color: "#7c3aed", detailType: "event" },
  { kind: "pulse", id: "pulse:lost-found", name: "Lost and found", group: "community", description: "Pets and items reported by neighbours", color: "#db2777", detailType: "lost_found" },
  { kind: "pulse", id: "pulse:jobs", name: "Jobs", group: "community", description: "Openings, placed in their neighbourhood", color: "#059669", detailType: "job" },
  { kind: "pulse", id: "pulse:alerts", name: "Community alerts", group: "safety", description: "Notices posted on Pueblo Pulse, placed in their neighbourhood", color: "#d97706", detailType: "alert" },
];

/**
 * Approximate centre of each Pueblo Pulse neighbourhood, used for records that
 * carry a neighbourhood but no coordinates. Points placed this way say so.
 */
export const NEIGHBORHOOD_CENTERS: Record<NeighborhoodID, [number, number]> = {
  pueblo_west: [-104.735, 38.324],
  north_side: [-104.61, 38.29],
  south_side: [-104.615, 38.235],
  east_side: [-104.58, 38.265],
  west_side: [-104.65, 38.27],
  downtown: [-104.6095, 38.2665],
  mesa: [-104.5, 38.23],
  bessemer: [-104.615, 38.24],
  belmont: [-104.575, 38.295],
  mesa_junction: [-104.61, 38.258],
  grove: [-104.6, 38.26],
  eilers: [-104.605, 38.245],
  goat_hill: [-104.606, 38.272],
  aberdeen: [-104.62, 38.225],
  walking_stick: [-104.585, 38.31],
  university: [-104.578, 38.306],
  state_fair: [-104.631, 38.256],
  salt_creek: [-104.58, 38.23],
  sunset: [-104.675, 38.27],
  union_district: [-104.612, 38.264],
  riverwalk: [-104.6106, 38.2647],
};

/** Every Pueblo Pulse business category except "Other" is a place to eat or drink. */
const isFood = (b: BusinessItem) => b.category !== "Other";

const point = (lon: number, lat: number) => ({ type: "Point", coordinates: [lon, lat] });
const valid = (lat: unknown, lng: unknown) =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;

/** Spread records that share one neighbourhood centre so they do not stack. */
function jitter(index: number): [number, number] {
  if (index === 0) return [0, 0];
  const angle = index * 2.399963; // golden angle
  const r = 0.0012 * Math.sqrt(index);
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

function byNeighborhood<T extends { id: string; neighborhood?: NeighborhoodID }>(
  items: T[],
  props: (item: T) => Record<string, unknown>,
): GeoFeature[] {
  const counts = new Map<string, number>();
  const out: GeoFeature[] = [];
  for (const item of items) {
    const centre = item.neighborhood ? NEIGHBORHOOD_CENTERS[item.neighborhood] : undefined;
    if (!centre) continue;
    const n = counts.get(item.neighborhood!) ?? 0;
    counts.set(item.neighborhood!, n + 1);
    const [dx, dy] = jitter(n);
    out.push({
      type: "Feature",
      id: item.id,
      geometry: point(centre[0] + dx, centre[1] + dy),
      properties: { ...props(item), approximate: true },
    });
  }
  return out;
}

export interface PulseData {
  events: EventItem[];
  businesses: BusinessItem[];
  jobs: JobItem[];
  lostFound: LostFoundItem[];
  alerts: SafetyAlert[];
}

/** Turn Pueblo Pulse records into GeoJSON, one collection per Pulse layer. */
export function pulseFeatures(data: PulseData): Record<string, GeoFeature[]> {
  const business = (b: BusinessItem): GeoFeature => ({
    type: "Feature",
    id: b.id,
    geometry: point(b.lng, b.lat),
    properties: { name: b.name },
  });
  const food = data.businesses.filter((b) => valid(b.lat, b.lng) && isFood(b));
  const other = data.businesses.filter((b) => valid(b.lat, b.lng) && !isFood(b));
  return {
    "pulse:restaurants": food.map(business),
    "pulse:businesses": other.map(business),
    "pulse:events": data.events
      .filter((e) => valid(e.lat, e.lng))
      .map((e) => ({ type: "Feature", id: e.id, geometry: point(e.lng, e.lat), properties: { name: e.title } })),
    "pulse:lost-found": data.lostFound
      .filter((l) => valid(l.lat, l.lng))
      .map((l) => ({ type: "Feature", id: l.id, geometry: point(l.lng, l.lat), properties: { name: l.title } })),
    "pulse:jobs": byNeighborhood(data.jobs, (j) => ({ name: j.title })),
    "pulse:alerts": byNeighborhood(data.alerts, (a) => ({
      name: a.title,
      color: a.level === "critical" ? "#dc2626" : a.level === "warning" ? "#d97706" : "#0284c7",
    })),
  };
}

/** The Pulse record behind a clicked Pulse feature. */
export function pulseRecord(layerId: string, featureId: string, data: PulseData): { type: string; item: any } | null {
  const find = <T extends { id: string }>(list: T[]) => list.find((x) => String(x.id) === featureId);
  const layer = PULSE_LAYERS.find((l) => l.id === layerId);
  if (!layer) return null;
  const item =
    layerId === "pulse:events"
      ? find(data.events)
      : layerId === "pulse:lost-found"
        ? find(data.lostFound)
        : layerId === "pulse:jobs"
          ? find(data.jobs)
          : layerId === "pulse:alerts"
            ? find(data.alerts)
            : find(data.businesses);
  return item ? { type: layer.detailType, item } : null;
}
