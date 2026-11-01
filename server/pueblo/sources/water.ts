/**
 * USGS stream gauges around Pueblo: the Arkansas River below Pueblo Dam and
 * through town, Fountain Creek, and the St. Charles River. Values are the
 * instantaneous readings USGS publishes, usually every 15 minutes.
 */
import { PUEBLO_BBOX } from "../geo";
import type { Feature, SourceDefinition } from "../types";

const PARAMS: Record<string, { key: string; label: string; unit: string }> = {
  "00060": { key: "flowCfs", label: "Flow", unit: "cfs" },
  "00065": { key: "gageFt", label: "Gauge height", unit: "ft" },
};

/** Turn a USGS instantaneous-values response into one point per site. */
export function gaugesFromUsgs(data: any): Feature[] {
  const sites = new Map<string, Feature>();
  for (const series of data?.value?.timeSeries || []) {
    const info = series.sourceInfo || {};
    const code = info.siteCode?.[0]?.value;
    const geo = info.geoLocation?.geogLocation || {};
    const param = PARAMS[series.variable?.variableCode?.[0]?.value];
    const latest = series.values?.[0]?.value?.at?.(-1);
    if (!code || !param || !Number.isFinite(geo.latitude) || !Number.isFinite(geo.longitude)) continue;
    let feature = sites.get(code);
    if (!feature) {
      feature = {
        type: "Feature",
        id: code,
        geometry: { type: "Point", coordinates: [geo.longitude, geo.latitude] },
        properties: {
          name: String(info.siteName || code)
            .toLowerCase()
            .replace(/\b\w/g, (ch: string) => ch.toUpperCase())
            .replace(/\bCo\b/, "CO"),
          site: code,
          url: `https://waterdata.usgs.gov/monitoring-location/${code}/`,
        },
      };
      sites.set(code, feature);
    }
    const value = Number(latest?.value);
    const noData = Number(series.variable?.noDataValue);
    if (Number.isFinite(value) && value !== noData) {
      feature.properties[param.key] = value;
      feature.properties.readingAt = latest.dateTime;
    }
  }
  return [...sites.values()].filter(
    (f) => f.properties.flowCfs !== undefined || f.properties.gageFt !== undefined,
  );
}

export const streamGauges: SourceDefinition = {
  id: "stream-gauges",
  name: "River and creek levels",
  category: "safety",
  description: "USGS gauges on the Arkansas River, Fountain Creek and nearby streams",
  freshness: "near-live",
  refreshMs: 15 * 60 * 1000,
  attribution: { text: "U.S. Geological Survey", url: "https://waterdata.usgs.gov/" },
  color: "#0369a1",
  nameProperty: "name",
  defaultOn: false,
  async fetch(ctx) {
    const b = PUEBLO_BBOX;
    const bbox = [b.west, b.south, b.east, b.north].map((n) => n.toFixed(2)).join(",");
    const data = await ctx.fetchJson(
      `https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${bbox}&parameterCd=00060,00065&siteStatus=active&siteType=ST`,
    );
    return { type: "FeatureCollection", features: gaugesFromUsgs(data) };
  },
};
