/**
 * National Weather Service (alerts, latest observation) and Open-Meteo air
 * quality. All keyless; NWS asks for an identifying User-Agent, which the
 * hub's HTTP client always sends.
 */
import { PUEBLO_CENTER } from "../geo";
import type { Feature, SourceDefinition } from "../types";

const NWS = "https://api.weather.gov";
const NWS_ATTRIBUTION = { text: "National Weather Service", url: "https://www.weather.gov/pub/" };
/** Pueblo Memorial Airport, the NWS observing station for the city. */
export const PUEBLO_STATION = "KPUB";

const centerPoint = () => ({ type: "Point", coordinates: [PUEBLO_CENTER.lon, PUEBLO_CENTER.lat] });

const SEVERITY_COLOR: Record<string, string> = {
  Extreme: "#b91c1c",
  Severe: "#dc2626",
  Moderate: "#ea580c",
  Minor: "#ca8a04",
};

export const nwsAlerts: SourceDefinition = {
  id: "nws-alerts",
  name: "Weather alerts",
  category: "safety",
  description: "Active National Weather Service watches, warnings and advisories for Pueblo",
  freshness: "near-live",
  refreshMs: 2 * 60 * 1000,
  attribution: NWS_ATTRIBUTION,
  color: "#dc2626",
  nameProperty: "event",
  defaultOn: true,
  async fetch(ctx) {
    const data = await ctx.fetchJson(
      `${NWS}/alerts/active?point=${PUEBLO_CENTER.lat},${PUEBLO_CENTER.lon}`,
      { headers: { Accept: "application/geo+json" } },
    );
    const features: Feature[] = (data?.features || []).map((f: any) => {
      const p = f.properties || {};
      return {
        type: "Feature",
        id: p.id || f.id,
        // Zone-based alerts carry no polygon; show them at the city centre.
        geometry: f.geometry || centerPoint(),
        properties: {
          name: p.event,
          headline: p.headline,
          severity: p.severity,
          urgency: p.urgency,
          areas: p.areaDesc,
          description: p.description,
          instruction: p.instruction,
          effective: p.effective,
          expires: p.expires,
          sender: p.senderName,
          color: SEVERITY_COLOR[p.severity] || "#dc2626",
          url: p["@id"] || undefined,
        },
      };
    });
    return { type: "FeatureCollection", features };
  },
};

const cToF = (c: unknown) => (typeof c === "number" ? Math.round((c * 9) / 5 + 32) : null);
const kmhToMph = (v: unknown) => (typeof v === "number" ? Math.round(v * 0.621371) : null);

export const nwsObservation: SourceDefinition = {
  id: "nws-conditions",
  name: "Current conditions",
  category: "live",
  description: "Latest observation at Pueblo Memorial Airport (temperature, wind, sky)",
  freshness: "near-live",
  refreshMs: 10 * 60 * 1000,
  attribution: NWS_ATTRIBUTION,
  color: "#0284c7",
  nameProperty: "summary",
  defaultOn: false,
  async fetch(ctx) {
    const data = await ctx.fetchJson(`${NWS}/stations/${PUEBLO_STATION}/observations/latest`, {
      headers: { Accept: "application/geo+json" },
    });
    const p = data?.properties || {};
    const tempF = cToF(p.temperature?.value);
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: PUEBLO_STATION,
          geometry: data?.geometry || centerPoint(),
          properties: {
            summary: [tempF !== null ? `${tempF}°F` : null, p.textDescription].filter(Boolean).join(" · "),
            station: PUEBLO_STATION,
            observedAt: p.timestamp,
            temperatureF: tempF,
            dewpointF: cToF(p.dewpoint?.value),
            humidity: typeof p.relativeHumidity?.value === "number" ? Math.round(p.relativeHumidity.value) : null,
            windMph: kmhToMph(p.windSpeed?.value),
            windGustMph: kmhToMph(p.windGust?.value),
            windDirectionDeg: p.windDirection?.value ?? null,
            sky: p.textDescription || null,
          },
        },
      ],
    };
  },
};

const AQI_BANDS: Array<[number, string, string]> = [
  [50, "Good", "#16a34a"],
  [100, "Moderate", "#ca8a04"],
  [150, "Unhealthy for sensitive groups", "#ea580c"],
  [200, "Unhealthy", "#dc2626"],
  [300, "Very unhealthy", "#7e22ce"],
  [Infinity, "Hazardous", "#7f1d1d"],
];

export function aqiBand(aqi: number) {
  const [, label, color] = AQI_BANDS.find(([max]) => aqi <= max) || AQI_BANDS[AQI_BANDS.length - 1];
  return { label, color };
}

export const airQuality: SourceDefinition = {
  id: "air-quality",
  name: "Air quality",
  category: "live",
  description: "Modelled US AQI, fine particles and ozone for central Pueblo (not a monitor reading)",
  freshness: "periodic",
  refreshMs: 30 * 60 * 1000,
  attribution: { text: "Open-Meteo air quality (CAMS model)", url: "https://open-meteo.com/en/docs/air-quality-api" },
  color: "#16a34a",
  nameProperty: "summary",
  async fetch(ctx) {
    const url =
      "https://air-quality-api.open-meteo.com/v1/air-quality" +
      `?latitude=${PUEBLO_CENTER.lat}&longitude=${PUEBLO_CENTER.lon}` +
      "&current=us_aqi,pm2_5,pm10,ozone&timezone=America%2FDenver";
    const data = await ctx.fetchJson(url);
    const c = data?.current || {};
    if (typeof c.us_aqi !== "number") throw new Error("No air quality value in response");
    const band = aqiBand(c.us_aqi);
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "pueblo-aqi",
          geometry: centerPoint(),
          properties: {
            summary: `AQI ${Math.round(c.us_aqi)} · ${band.label}`,
            aqi: Math.round(c.us_aqi),
            category: band.label,
            pm25: c.pm2_5 ?? null,
            pm10: c.pm10 ?? null,
            ozone: c.ozone ?? null,
            modelTime: c.time ?? null,
            color: band.color,
          },
        },
      ],
    };
  },
};
