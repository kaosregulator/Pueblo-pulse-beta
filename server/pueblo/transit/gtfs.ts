/**
 * Pueblo Transit from its published GTFS schedule.
 *
 * Pueblo Transit publishes a static GTFS feed (through CDOT's statewide GTFS
 * site) but no real-time vehicle positions. So this module answers "where
 * should each bus be right now, according to the timetable?" Every result is
 * marked `estimated: true` and the UI says "scheduled position". If Pueblo
 * Transit ever publishes GTFS-Realtime, real positions replace these.
 */
import { unzipSync, strFromU8 } from "fflate";

export const DEFAULT_GTFS_URL =
  "https://data.trilliumtransit.com/gtfs/pueblo-co-us/pueblo-co-us--flex-v2.zip";

// ---------------------------------------------------------------- CSV

/** Parse RFC 4180 CSV (quoted fields, doubled quotes, CRLF) into records. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  const [header, ...body] = rows;
  if (!header) return [];
  const keys = header.map((h) => h.trim());
  return body.map((cells) => {
    const record: Record<string, string> = {};
    keys.forEach((key, index) => (record[key] = (cells[index] ?? "").trim()));
    return record;
  });
}

/** "25:10:00" → seconds after the service day's noon-minus-12h. */
export function parseGtfsTime(value: string | undefined): number | null {
  const m = /^(\d{1,3}):(\d{2}):(\d{2})$/.exec(String(value ?? "").trim());
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

export function formatClock(seconds: number): string {
  const s = ((seconds % 86400) + 86400) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ---------------------------------------------------------------- model

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
}
export interface Route {
  id: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  url: string;
}
export interface StopTime {
  stopId: string;
  arr: number;
  dep: number;
}
export interface Trip {
  id: string;
  routeId: string;
  serviceId: string;
  headsign: string;
  shapeId: string;
  directionId: string;
  times: StopTime[];
}
export interface Shape {
  coords: [number, number][];
  /** Cumulative metres along the shape at each vertex. */
  dist: number[];
}

export interface GtfsModel {
  timezone: string;
  agencyName: string;
  routes: Map<string, Route>;
  stops: Map<string, Stop>;
  trips: Trip[];
  shapes: Map<string, Shape>;
  calendar: Map<string, { days: boolean[]; start: string; end: string }>;
  exceptions: Map<string, Map<string, 1 | 2>>;
  /** Stop ids in visit order per stop, for departures. */
  tripsByStop: Map<string, Array<{ trip: Trip; index: number }>>;
  feedVersion: string | null;
  validUntil: string | null;
}

const toColor = (hex: string | undefined, fallback: string) =>
  /^[0-9a-f]{6}$/i.test(String(hex ?? "")) ? `#${String(hex).toLowerCase()}` : fallback;

function metres(a: [number, number], b: [number, number]): number {
  const R = 6371008.8;
  const toRad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toRad;
  const dLon = (b[0] - a[0]) * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Read a GTFS zip into the model the estimator uses. */
export function loadGtfs(zip: Uint8Array): GtfsModel {
  const files = unzipSync(zip, {
    filter: (file) => /(^|\/)[a-z_]+\.txt$/.test(file.name),
  });
  const read = (name: string) => {
    const key = Object.keys(files).find((k) => k === name || k.endsWith(`/${name}`));
    return key ? parseCsv(strFromU8(files[key])) : [];
  };

  const agency = read("agency.txt")[0] || {};
  const feedInfo = read("feed_info.txt")[0] || {};

  const routes = new Map<string, Route>();
  for (const r of read("routes.txt")) {
    if (!r.route_id) continue;
    routes.set(r.route_id, {
      id: r.route_id,
      shortName: r.route_short_name || "",
      longName: r.route_long_name || r.route_desc || "",
      color: toColor(r.route_color, "#c2410c"),
      textColor: toColor(r.route_text_color, "#ffffff"),
      url: r.route_url || "",
    });
  }

  const stops = new Map<string, Stop>();
  for (const s of read("stops.txt")) {
    const lat = Number(s.stop_lat);
    const lon = Number(s.stop_lon);
    if (!s.stop_id || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (s.location_type && s.location_type !== "0") continue;
    stops.set(s.stop_id, { id: s.stop_id, name: s.stop_name || s.stop_id, lat, lon });
  }

  const shapePoints = new Map<string, Array<{ seq: number; c: [number, number] }>>();
  for (const p of read("shapes.txt")) {
    const lat = Number(p.shape_pt_lat);
    const lon = Number(p.shape_pt_lon);
    if (!p.shape_id || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    let list = shapePoints.get(p.shape_id);
    if (!list) shapePoints.set(p.shape_id, (list = []));
    list.push({ seq: Number(p.shape_pt_sequence), c: [lon, lat] });
  }
  const shapes = new Map<string, Shape>();
  for (const [id, list] of shapePoints) {
    list.sort((a, b) => a.seq - b.seq);
    const coords = list.map((p) => p.c);
    const dist = [0];
    for (let i = 1; i < coords.length; i++) dist.push(dist[i - 1] + metres(coords[i - 1], coords[i]));
    if (coords.length >= 2) shapes.set(id, { coords, dist });
  }

  const tripsById = new Map<string, Trip>();
  for (const t of read("trips.txt")) {
    if (!t.trip_id || !routes.has(t.route_id)) continue;
    tripsById.set(t.trip_id, {
      id: t.trip_id,
      routeId: t.route_id,
      serviceId: t.service_id,
      headsign: t.trip_headsign || "",
      shapeId: t.shape_id || "",
      directionId: t.direction_id || "",
      times: [],
    });
  }
  const seqs = new Map<string, number[]>();
  for (const st of read("stop_times.txt")) {
    const trip = tripsById.get(st.trip_id);
    // Flex rows name a zone (location_id) and a window, not a stop and a time.
    if (!trip || !st.stop_id || !stops.has(st.stop_id)) continue;
    const arr = parseGtfsTime(st.arrival_time);
    const dep = parseGtfsTime(st.departure_time);
    if (arr === null && dep === null) continue;
    trip.times.push({ stopId: st.stop_id, arr: arr ?? dep!, dep: dep ?? arr! });
    let s = seqs.get(trip.id);
    if (!s) seqs.set(trip.id, (s = []));
    s.push(Number(st.stop_sequence));
  }
  const trips: Trip[] = [];
  for (const trip of tripsById.values()) {
    const s = seqs.get(trip.id) || [];
    const order = trip.times.map((_, i) => i).sort((a, b) => s[a] - s[b]);
    trip.times = order.map((i) => trip.times[i]);
    if (trip.times.length >= 2) trips.push(trip);
  }

  const calendar = new Map<string, { days: boolean[]; start: string; end: string }>();
  for (const c of read("calendar.txt")) {
    calendar.set(c.service_id, {
      // Index by JavaScript weekday: 0 = Sunday.
      days: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map(
        (d) => c[d] === "1",
      ),
      start: c.start_date,
      end: c.end_date,
    });
  }
  const exceptions = new Map<string, Map<string, 1 | 2>>();
  for (const e of read("calendar_dates.txt")) {
    let byService = exceptions.get(e.date);
    if (!byService) exceptions.set(e.date, (byService = new Map()));
    byService.set(e.service_id, e.exception_type === "2" ? 2 : 1);
  }

  const tripsByStop = new Map<string, Array<{ trip: Trip; index: number }>>();
  for (const trip of trips) {
    trip.times.forEach((t, index) => {
      let list = tripsByStop.get(t.stopId);
      if (!list) tripsByStop.set(t.stopId, (list = []));
      list.push({ trip, index });
    });
  }

  return {
    timezone: agency.agency_timezone || "America/Denver",
    agencyName: agency.agency_name || "Pueblo Transit",
    routes,
    stops,
    trips,
    shapes,
    calendar,
    exceptions,
    tripsByStop,
    feedVersion: feedInfo.feed_version || null,
    validUntil: feedInfo.feed_end_date || null,
  };
}

// ---------------------------------------------------------------- time

export interface LocalDay {
  ymd: string;
  weekday: number;
  /** Seconds since local midnight. */
  seconds: number;
}

/** The local calendar day and time in a timezone. */
export function localDay(nowMs: number, timeZone: string): LocalDay {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(new Date(nowMs));
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    ymd: `${get("year")}${get("month")}${get("day")}`,
    weekday,
    seconds: Number(get("hour")) * 3600 + Number(get("minute")) * 60 + Number(get("second")),
  };
}

function previousDay(day: LocalDay): LocalDay {
  const y = Number(day.ymd.slice(0, 4));
  const m = Number(day.ymd.slice(4, 6));
  const d = Number(day.ymd.slice(6, 8));
  const prev = new Date(Date.UTC(y, m - 1, d - 1));
  const ymd = `${prev.getUTCFullYear()}${String(prev.getUTCMonth() + 1).padStart(2, "0")}${String(prev.getUTCDate()).padStart(2, "0")}`;
  return { ymd, weekday: (day.weekday + 6) % 7, seconds: day.seconds + 86400 };
}

/** Whether a service runs on a day, honouring calendar_dates exceptions. */
export function serviceRuns(model: GtfsModel, serviceId: string, day: LocalDay): boolean {
  const exception = model.exceptions.get(day.ymd)?.get(serviceId);
  if (exception === 1) return true;
  if (exception === 2) return false;
  const cal = model.calendar.get(serviceId);
  return Boolean(cal && cal.days[day.weekday] && day.ymd >= cal.start && day.ymd <= cal.end);
}

// ---------------------------------------------------------------- geometry

/** Index of the shape vertex nearest a point, searching from `from`. */
function nearestVertex(shape: Shape, lon: number, lat: number, from = 0): number {
  let best = from;
  let bestD = Infinity;
  for (let i = from; i < shape.coords.length; i++) {
    const [x, y] = shape.coords[i];
    const d = (x - lon) ** 2 + (y - lat) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** The point `metresAlong` metres along a shape. */
function alongShape(shape: Shape, metresAlong: number): [number, number] {
  const { coords, dist } = shape;
  if (metresAlong <= 0) return coords[0];
  for (let i = 1; i < coords.length; i++) {
    if (dist[i] >= metresAlong) {
      const span = dist[i] - dist[i - 1] || 1;
      const f = (metresAlong - dist[i - 1]) / span;
      return [
        coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * f,
        coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * f,
      ];
    }
  }
  return coords[coords.length - 1];
}

const shapeStopCache = new WeakMap<Trip, number[] | null>();

/** Distance along the trip's shape at each of its stops, or null. */
function stopDistances(model: GtfsModel, trip: Trip): number[] | null {
  if (shapeStopCache.has(trip)) return shapeStopCache.get(trip)!;
  const shape = model.shapes.get(trip.shapeId);
  let result: number[] | null = null;
  if (shape) {
    result = [];
    let from = 0;
    for (const t of trip.times) {
      const stop = model.stops.get(t.stopId)!;
      from = nearestVertex(shape, stop.lon, stop.lat, from);
      result.push(shape.dist[from]);
    }
  }
  shapeStopCache.set(trip, result);
  return result;
}

// ---------------------------------------------------------------- estimates

export interface VehicleEstimate {
  tripId: string;
  route: Route;
  headsign: string;
  lon: number;
  lat: number;
  atStop: string | null;
  nextStop: Stop | null;
  nextStopAt: number | null;
  /** The service-day seconds the estimate was made for. */
  serviceSeconds: number;
}

/** Where each running trip should be at `nowMs` according to the timetable. */
export function estimateVehicles(model: GtfsModel, nowMs: number): VehicleEstimate[] {
  const today = localDay(nowMs, model.timezone);
  const days = [today, previousDay(today)];
  const out: VehicleEstimate[] = [];
  for (const trip of model.trips) {
    for (const day of days) {
      const t = day.seconds;
      const first = trip.times[0].dep;
      const last = trip.times[trip.times.length - 1].arr;
      if (t < first || t > last) continue;
      if (!serviceRuns(model, trip.serviceId, day)) continue;
      const route = model.routes.get(trip.routeId)!;
      const times = trip.times;
      let i = 0;
      while (i < times.length - 1 && times[i + 1].arr <= t) i++;
      const here = times[i];
      const next = times[Math.min(i + 1, times.length - 1)];
      const stop = model.stops.get(here.stopId)!;
      const nextStop = model.stops.get(next.stopId) || null;
      let lon = stop.lon;
      let lat = stop.lat;
      let atStop: string | null = stop.name;
      if (t > here.dep && next !== here) {
        atStop = null;
        const f = Math.min(1, Math.max(0, (t - here.dep) / Math.max(1, next.arr - here.dep)));
        const dists = stopDistances(model, trip);
        const shape = model.shapes.get(trip.shapeId);
        if (dists && shape && dists[i + 1] > dists[i]) {
          [lon, lat] = alongShape(shape, dists[i] + (dists[i + 1] - dists[i]) * f);
        } else if (nextStop) {
          lon = stop.lon + (nextStop.lon - stop.lon) * f;
          lat = stop.lat + (nextStop.lat - stop.lat) * f;
        }
      }
      out.push({
        tripId: trip.id,
        route,
        headsign: trip.headsign,
        lon,
        lat,
        atStop,
        nextStop,
        nextStopAt: next !== here ? next.arr : null,
        serviceSeconds: t,
      });
      break;
    }
  }
  return out;
}

export interface Departure {
  routeId: string;
  routeName: string;
  color: string;
  headsign: string;
  /** Seconds since today's local midnight (may exceed 86400). */
  at: number;
  clock: string;
  minutesAway: number;
}

/** The next scheduled departures from a stop. */
export function nextDepartures(model: GtfsModel, stopId: string, nowMs: number, limit = 6): Departure[] {
  const today = localDay(nowMs, model.timezone);
  const days = [previousDay(today), today];
  const out: Departure[] = [];
  for (const { trip, index } of model.tripsByStop.get(stopId) || []) {
    if (index === trip.times.length - 1) continue; // arrivals at the last stop are not departures
    for (const day of days) {
      const dep = trip.times[index].dep;
      if (dep < day.seconds || !serviceRuns(model, trip.serviceId, day)) continue;
      const route = model.routes.get(trip.routeId)!;
      const offset = day === today ? 0 : -86400;
      out.push({
        routeId: route.id,
        routeName: route.shortName || route.longName,
        color: route.color,
        headsign: trip.headsign,
        at: dep + offset,
        clock: formatClock(dep),
        minutesAway: Math.round((dep - day.seconds) / 60),
      });
    }
  }
  return out.sort((a, b) => a.minutesAway - b.minutesAway).slice(0, limit);
}

/** One summary row per route for the transit tab. */
export function routeSummaries(model: GtfsModel, nowMs: number) {
  const today = localDay(nowMs, model.timezone);
  const running = estimateVehicles(model, nowMs);
  return [...model.routes.values()]
    .map((route) => {
      const todays = model.trips.filter(
        (t) => t.routeId === route.id && serviceRuns(model, t.serviceId, today),
      );
      const firstDep = todays.length ? Math.min(...todays.map((t) => t.times[0].dep)) : null;
      const lastArr = todays.length ? Math.max(...todays.map((t) => t.times[t.times.length - 1].arr)) : null;
      const stopIds = new Set<string>();
      for (const t of model.trips) if (t.routeId === route.id) t.times.forEach((s) => stopIds.add(s.stopId));
      return {
        id: route.id,
        shortName: route.shortName,
        longName: route.longName,
        color: route.color,
        textColor: route.textColor,
        url: route.url,
        runsToday: todays.length > 0,
        tripsToday: todays.length,
        firstDeparture: firstDep !== null ? formatClock(firstDep) : null,
        lastArrival: lastArr !== null ? formatClock(lastArr) : null,
        busesNow: running.filter((v) => v.route.id === route.id).length,
        stopCount: stopIds.size,
      };
    })
    .sort((a, b) => {
      const na = Number(a.shortName);
      const nb = Number(b.shortName);
      return Number.isFinite(na) && Number.isFinite(nb) ? na - nb : a.shortName.localeCompare(b.shortName);
    });
}
