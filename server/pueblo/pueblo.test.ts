import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, zipSync } from "fflate";
import {
  estimateVehicles,
  formatClock,
  loadGtfs,
  localDay,
  nextDepartures,
  parseCsv,
  parseGtfsTime,
  routeSummaries,
  serviceRuns,
} from "./transit/gtfs";
import { routeFeatures, stopFeatures, vehicleFeatures } from "./transit/sources";
import { createRegistry } from "./registry";
import { arcgisLayer, arcgisQueryUrl } from "./sources/arcgis";
import { PUEBLO_COUNTY_BBOX, touchesBBox } from "./geo";
import { gaugesFromUsgs } from "./sources/water";
import { aqiBand } from "./sources/weather";
import type { SourceDefinition } from "./types";

// A tiny two-stop-plus feed: route 1 runs weekdays, 08:00 to 08:20 via three stops.
function fixtureFeed(extra: Record<string, string> = {}) {
  const files: Record<string, string> = {
    "agency.txt": "agency_id,agency_name,agency_url,agency_timezone\npt,Pueblo Transit,https://pueblo.us,America/Denver\n",
    "routes.txt": 'route_id,route_short_name,route_long_name,route_type,route_color\nr1,1,"Eastside, via 4th",3,A3195B\n',
    "stops.txt":
      "stop_id,stop_name,stop_lat,stop_lon\nA,Transit Center,38.2650,-104.6100\nB,4th & Main,38.2650,-104.6000\nC,Eastside Loop,38.2650,-104.5900\n",
    "trips.txt": "route_id,service_id,trip_id,trip_headsign,shape_id\nr1,wk,t1,Eastside,s1\n",
    "stop_times.txt":
      "trip_id,arrival_time,departure_time,stop_id,stop_sequence\nt1,08:00:00,08:00:00,A,1\nt1,08:10:00,08:12:00,B,2\nt1,08:20:00,08:20:00,C,3\n",
    "calendar.txt":
      "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nwk,1,1,1,1,1,0,0,20260101,20271231\n",
    "calendar_dates.txt": "service_id,date,exception_type\nwk,20261126,2\n",
    "shapes.txt":
      "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\ns1,38.2650,-104.6100,1\ns1,38.2650,-104.6000,2\ns1,38.2650,-104.5900,3\n",
    ...extra,
  };
  const zip: Record<string, Uint8Array> = {};
  for (const [name, text] of Object.entries(files)) zip[name] = strToU8(text);
  return loadGtfs(zipSync(zip));
}

/** A UTC instant for a Denver wall-clock time (MST, UTC-7, in this date range). */
const denver = (ymd: string, hh: number, mm: number) =>
  Date.UTC(Number(ymd.slice(0, 4)), Number(ymd.slice(4, 6)) - 1, Number(ymd.slice(6, 8)), hh + 7, mm);

test("CSV parsing handles quotes, commas, CRLF and a BOM", () => {
  const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n\r\n3,4');
  assert.deepEqual(rows, [
    { a: "x, y", b: 'say "hi"' },
    { a: "3", b: "4" },
  ]);
});

test("GTFS times may pass midnight", () => {
  assert.equal(parseGtfsTime("25:10:00"), 25 * 3600 + 600);
  assert.equal(parseGtfsTime(""), null);
  assert.equal(formatClock(13 * 3600 + 5 * 60), "1:05 PM");
  assert.equal(formatClock(0), "12:00 AM");
});

test("the local day follows Denver time", () => {
  const day = localDay(denver("20261102", 8, 5), "America/Denver");
  assert.equal(day.ymd, "20261102");
  assert.equal(day.weekday, 1);
  assert.equal(day.seconds, 8 * 3600 + 5 * 60);
});

test("service calendars honour exceptions", () => {
  const model = fixtureFeed();
  assert.equal(serviceRuns(model, "wk", localDay(denver("20261102", 9, 0), model.timezone)), true);
  assert.equal(serviceRuns(model, "wk", localDay(denver("20261107", 9, 0), model.timezone)), false); // Saturday
  assert.equal(serviceRuns(model, "wk", localDay(denver("20261126", 9, 0), model.timezone)), false); // Thanksgiving
});

test("a bus between stops is placed along the route shape", () => {
  const model = fixtureFeed();
  const [bus] = estimateVehicles(model, denver("20261102", 8, 5));
  assert.equal(bus.tripId, "t1");
  assert.equal(bus.atStop, null);
  assert.ok(bus.lon > -104.61 && bus.lon < -104.6, `lon ${bus.lon}`);
  assert.ok(Math.abs(bus.lon - -104.605) < 0.0005);
  assert.equal(bus.nextStop?.name, "4th & Main");
});

test("a bus dwelling at a stop is shown at that stop", () => {
  const model = fixtureFeed();
  const [bus] = estimateVehicles(model, denver("20261102", 8, 11));
  assert.equal(bus.atStop, "4th & Main");
  assert.equal(bus.lon, -104.6);
});

test("no buses outside service hours or days", () => {
  const model = fixtureFeed();
  assert.equal(estimateVehicles(model, denver("20261102", 7, 59)).length, 0);
  assert.equal(estimateVehicles(model, denver("20261102", 8, 21)).length, 0);
  assert.equal(estimateVehicles(model, denver("20261107", 8, 5)).length, 0);
});

test("next departures skip the final stop and count minutes", () => {
  const model = fixtureFeed();
  const deps = nextDepartures(model, "B", denver("20261102", 8, 2));
  assert.equal(deps.length, 1);
  assert.equal(deps[0].minutesAway, 10);
  assert.equal(deps[0].clock, "8:12 AM");
  assert.equal(nextDepartures(model, "C", denver("20261102", 8, 2)).length, 0);
});

test("map features carry the route colour and say they are estimates", () => {
  const model = fixtureFeed();
  const vehicles = vehicleFeatures(model, denver("20261102", 8, 5));
  assert.equal(vehicles[0].properties.estimated, true);
  assert.equal(vehicles[0].properties.color, "#a3195b");
  assert.equal(vehicles[0].properties.name, "Route 1 to Eastside");
  const routes = routeFeatures(model);
  assert.equal(routes[0].geometry?.type, "MultiLineString");
  assert.equal(stopFeatures(model).length, 3);
});

test("route summaries describe today's service", () => {
  const model = fixtureFeed();
  const [route] = routeSummaries(model, denver("20261102", 8, 5));
  assert.equal(route.longName, "Eastside, via 4th");
  assert.equal(route.runsToday, true);
  assert.equal(route.firstDeparture, "8:00 AM");
  assert.equal(route.busesNow, 1);
  assert.equal(route.stopCount, 3);
});

test("flex-only stop times are ignored rather than breaking the feed", () => {
  const model = fixtureFeed({
    "stop_times.txt":
      "trip_id,arrival_time,departure_time,stop_id,location_id,stop_sequence\nt1,08:00:00,08:00:00,A,,1\nt1,,,,zone9,2\nt1,08:20:00,08:20:00,C,,3\n",
  });
  assert.equal(model.trips[0].times.length, 2);
});

// ---------------------------------------------------------------- registry

function counter(overrides: Partial<SourceDefinition> = {}) {
  let calls = 0;
  let fail = false;
  const source: SourceDefinition = {
    id: "demo",
    name: "Demo",
    category: "geo",
    description: "",
    freshness: "static",
    refreshMs: 1000,
    attribution: { text: "x" },
    color: "#000000",
    async fetch() {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
      if (fail) throw new Error("upstream down");
      return { type: "FeatureCollection", features: [{ type: "Feature", geometry: null, properties: { n: calls } }] };
    },
    ...overrides,
  };
  return { source, calls: () => calls, setFail: (v: boolean) => (fail = v) };
}

test("the registry caches, shares in-flight fetches and serves stale data on failure", async () => {
  let clock = 1_000_000;
  const demo = counter();
  const registry = createRegistry([demo.source], { now: () => clock, env: {} });
  assert.equal(registry.status("demo")?.state, "idle");
  await Promise.all([registry.get("demo"), registry.get("demo"), registry.get("demo")]);
  assert.equal(demo.calls(), 1);
  assert.equal(registry.status("demo")?.state, "ok");

  clock += 500;
  await registry.get("demo");
  assert.equal(demo.calls(), 1, "fresh data is reused");

  clock += 1000;
  demo.setFail(true);
  const result = await registry.get("demo");
  assert.equal(demo.calls(), 2);
  assert.equal(result.status.state, "stale");
  assert.equal(result.status.error, "upstream down");
  assert.equal(result.data?.features[0].properties.n, 1, "last good data still served");

  clock += 1000;
  await registry.get("demo");
  assert.equal(demo.calls(), 2, "backs off after a failure");
  clock += 30_000;
  demo.setFail(false);
  await registry.get("demo");
  assert.equal(demo.calls(), 3);
  assert.equal(registry.status("demo")?.state, "ok");
});

test("a source without its key is disabled and never fetched", async () => {
  const demo = counter({ requiresEnv: "DEMO_KEY" });
  const registry = createRegistry([demo.source], { env: {} });
  const result = await registry.get("demo");
  assert.equal(result.status.state, "disabled");
  assert.equal(result.data, null);
  assert.equal(demo.calls(), 0);
});

test("duplicate source ids are refused", () => {
  const a = counter().source;
  assert.throws(() => createRegistry([a, a]));
});

// ---------------------------------------------------------------- sources

test("ArcGIS queries ask for Pueblo's box in WGS84 GeoJSON", () => {
  const url = new URL(arcgisQueryUrl("https://gis.example/rest/services/Parks/MapServer/1", { offset: 2000, simplifyM: 11.1 }));
  assert.equal(url.pathname, "/rest/services/Parks/MapServer/1/query");
  assert.equal(url.searchParams.get("f"), "geojson");
  assert.equal(url.searchParams.get("outSR"), "4326");
  assert.equal(url.searchParams.get("geometry"), "-104.95,38.1,-104.4,38.45");
  assert.equal(url.searchParams.get("resultOffset"), "2000");
  assert.equal(url.searchParams.get("maxAllowableOffset"), "0.0001");
});

test("USGS series merge into one point per gauge", () => {
  const series = (code: string, value: string) => ({
    sourceInfo: {
      siteName: "ARKANSAS RIVER AT PUEBLO, CO",
      siteCode: [{ value: "07099970" }],
      geoLocation: { geogLocation: { latitude: 38.26, longitude: -104.6 } },
    },
    variable: { variableCode: [{ value: code }], noDataValue: -999999 },
    values: [{ value: [{ value, dateTime: "2026-11-01T08:00:00.000-07:00" }] }],
  });
  const gauges = gaugesFromUsgs({ value: { timeSeries: [series("00060", "412"), series("00065", "3.1")] } });
  assert.equal(gauges.length, 1);
  assert.equal(gauges[0].properties.flowCfs, 412);
  assert.equal(gauges[0].properties.gageFt, 3.1);
  assert.equal(gauges[0].properties.name, "Arkansas River At Pueblo, CO");
});

test("AQI bands follow the EPA scale", () => {
  assert.equal(aqiBand(42).label, "Good");
  assert.equal(aqiBand(101).label, "Unhealthy for sensitive groups");
  assert.equal(aqiBand(500).label, "Hazardous");
});

test("ArcGIS paging advances by the features the server returned", async () => {
  const offsets: number[] = [];
  const layer = arcgisLayer({
    id: "paged",
    name: "Paged",
    category: "geo",
    description: "",
    color: "#000000",
    service: "https://gis.example/MapServer",
    layerId: 0,
  });
  const fetchJson = async (url: string) => {
    const offset = Number(new URL(url).searchParams.get("resultOffset"));
    offsets.push(offset);
    const n = offset < 2500 ? 1000 : 300; // server caps pages at 1,000
    return {
      features: Array.from({ length: n }, (_, i) => ({
        type: "Feature",
        id: offset + i,
        geometry: { type: "Point", coordinates: [-104.6, 38.25] },
        properties: {},
      })),
      exceededTransferLimit: n === 1000,
    };
  };
  const out = await layer.fetch({ fetchJson, fetchBytes: async () => new Uint8Array(), env: {}, now: () => 0 } as any);
  assert.deepEqual(offsets, [0, 1000, 2000, 3000]);
  assert.equal(out.features.length, 3300);
});

test("a road that enters the county between vertices still counts", () => {
  const crossing = { type: "LineString", coordinates: [[-105.5, 38.2], [-104.0, 38.2]] };
  const elsewhere = { type: "LineString", coordinates: [[-105.5, 39.7], [-104.0, 39.7]] };
  assert.equal(touchesBBox(crossing, PUEBLO_COUNTY_BBOX), true);
  assert.equal(touchesBBox(elsewhere, PUEBLO_COUNTY_BBOX), false);
  assert.equal(touchesBBox({ type: "Point", coordinates: [-104.6, 38.25] }, PUEBLO_COUNTY_BBOX), true);
});
