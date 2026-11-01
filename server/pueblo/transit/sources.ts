/**
 * Map layers built from the Pueblo Transit schedule: route lines, stops and
 * scheduled bus positions. The GTFS zip itself is downloaded at most once a
 * day and shared by all three layers and the transit API.
 */
import { arcgisLayer, PUEBLO_COUNTY_GIS } from "../sources/arcgis";
import type { Feature, FeatureCollection, FetchContext, SourceDefinition } from "../types";
import {
  DEFAULT_GTFS_URL,
  estimateVehicles,
  formatClock,
  loadGtfs,
  type GtfsModel,
} from "./gtfs";

const FEED_TTL_MS = 24 * 60 * 60 * 1000;
const ATTRIBUTION = {
  text: "Pueblo Transit schedule (GTFS via CDOT)",
  url: "https://www.pueblo.us/492/Bus-Schedules",
};

let feed: { model: GtfsModel; loadedAt: number } | null = null;
let loading: Promise<GtfsModel> | null = null;

/** The current schedule model, downloading the feed when it is a day old. */
export async function transitModel(ctx: Pick<FetchContext, "fetchBytes" | "env" | "now">): Promise<GtfsModel> {
  if (feed && ctx.now() - feed.loadedAt < FEED_TTL_MS) return feed.model;
  loading ??= (async () => {
    try {
      const url = String(ctx.env.PUEBLO_GTFS_URL || "").trim() || DEFAULT_GTFS_URL;
      const model = loadGtfs(await ctx.fetchBytes(url));
      if (!model.trips.length) throw new Error("Schedule feed has no timed trips");
      feed = { model, loadedAt: ctx.now() };
      return model;
    } catch (error) {
      // Keep serving yesterday's schedule if today's download fails.
      if (feed) return feed.model;
      throw error;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** For tests: forget the cached feed. */
export function resetTransitModel() {
  feed = null;
  loading = null;
}

export function vehicleFeatures(model: GtfsModel, nowMs: number): Feature[] {
  return estimateVehicles(model, nowMs).map((v) => {
    const routeName = [v.route.shortName, v.route.longName].filter(Boolean).join(" · ");
    return {
      type: "Feature",
      id: v.tripId,
      geometry: { type: "Point", coordinates: [v.lon, v.lat] },
      properties: {
        name: `Route ${v.route.shortName || v.route.longName}${v.headsign ? ` to ${v.headsign}` : ""}`,
        route: routeName,
        routeId: v.route.id,
        headsign: v.headsign,
        color: v.route.color,
        status: v.atStop ? `Scheduled at ${v.atStop}` : "Scheduled between stops",
        nextStop: v.nextStop?.name ?? null,
        nextStopAt: v.nextStopAt !== null ? formatClock(v.nextStopAt) : null,
        estimated: true,
      },
    };
  });
}

export function routeFeatures(model: GtfsModel): Feature[] {
  const out: Feature[] = [];
  for (const route of model.routes.values()) {
    const trips = model.trips.filter((t) => t.routeId === route.id);
    const lines: [number, number][][] = [];
    const seenShapes = new Set<string>();
    for (const trip of trips) {
      const shape = model.shapes.get(trip.shapeId);
      if (shape && !seenShapes.has(trip.shapeId)) {
        seenShapes.add(trip.shapeId);
        lines.push(shape.coords);
      }
    }
    if (!lines.length && trips.length) {
      // No shapes in the feed: connect the stops of the longest trip.
      const longest = trips.reduce((a, b) => (b.times.length > a.times.length ? b : a));
      lines.push(
        longest.times.map((t) => {
          const s = model.stops.get(t.stopId)!;
          return [s.lon, s.lat];
        }),
      );
    }
    if (!lines.length) continue;
    out.push({
      type: "Feature",
      id: route.id,
      geometry: { type: "MultiLineString", coordinates: lines },
      properties: {
        name: `Route ${route.shortName}${route.longName ? ` · ${route.longName}` : ""}`,
        routeId: route.id,
        color: route.color,
        url: route.url || undefined,
      },
    });
  }
  return out;
}

export function stopFeatures(model: GtfsModel): Feature[] {
  const served = new Set(model.tripsByStop.keys());
  return [...model.stops.values()]
    .filter((s) => served.has(s.id))
    .map((s) => ({
      type: "Feature" as const,
      id: s.id,
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
      properties: { name: s.name, stopId: s.id },
    }));
}

const collection = (features: Feature[]): FeatureCollection => ({ type: "FeatureCollection", features });

/** County GIS bus routes: the fallback when the GTFS feed cannot be read. */
const countyRoutes = arcgisLayer({
  id: "transit-routes-county",
  name: "Bus routes (county map)",
  category: "live",
  description: "Pueblo Transit routes as drawn by Pueblo County GIS",
  color: "#c2410c",
  service: `${PUEBLO_COUNTY_GIS}/Transportation/PuebloCounty_CityBusTransitRoutes/MapServer`,
  layerId: 1,
  outFields: ["ROUTE_NAME", "ROUTE_NO", "DIRECTION", "MIDAY_HOUR", "WEEKEND_HR", "SCHEDULE_W"],
  nameProperty: "ROUTE_NAME",
});

export const transitVehicles: SourceDefinition = {
  id: "transit-vehicles",
  name: "Buses",
  category: "live",
  description:
    "Where each Pueblo Transit bus should be by the timetable. Pueblo Transit publishes no live GPS feed, so these are estimates.",
  freshness: "scheduled",
  refreshMs: 30 * 1000,
  attribution: ATTRIBUTION,
  color: "#c2410c",
  nameProperty: "name",
  defaultOn: true,
  async fetch(ctx) {
    const model = await transitModel(ctx);
    return collection(vehicleFeatures(model, ctx.now()));
  },
};

export const transitRoutes: SourceDefinition = {
  id: "transit-routes",
  name: "Bus routes",
  category: "live",
  description: "Pueblo Transit route lines",
  freshness: "static",
  refreshMs: 6 * 60 * 60 * 1000,
  attribution: ATTRIBUTION,
  color: "#c2410c",
  nameProperty: "name",
  defaultOn: true,
  async fetch(ctx) {
    try {
      const model = await transitModel(ctx);
      return collection(routeFeatures(model));
    } catch (error) {
      console.warn("[pueblo-hub] transit-routes: schedule unavailable, using county GIS routes", error);
      const county = await countyRoutes.fetch(ctx);
      return collection(
        county.features.map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            name: `Route ${f.properties.ROUTE_NO} · ${f.properties.ROUTE_NAME} (${f.properties.DIRECTION})`,
            hours: f.properties.MIDAY_HOUR,
            weekendHours: f.properties.WEEKEND_HR,
            url: f.properties.SCHEDULE_W,
          },
        })),
      );
    }
  },
};

export const transitStops: SourceDefinition = {
  id: "transit-stops",
  name: "Bus stops",
  category: "live",
  description: "Every Pueblo Transit stop, with its next scheduled departures",
  freshness: "static",
  refreshMs: 6 * 60 * 60 * 1000,
  attribution: ATTRIBUTION,
  color: "#9a3412",
  nameProperty: "name",
  async fetch(ctx) {
    return collection(stopFeatures(await transitModel(ctx)));
  },
};
