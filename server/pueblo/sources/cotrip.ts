/**
 * CDOT COtrip road data: incidents, closures and construction. Needs a free
 * key from CDOT (https://www.codot.gov/travel/cotrip-data); without
 * COTRIP_API_KEY these layers show as "needs setup" and are never fetched.
 *
 * COtrip publishes GeoJSON for the whole state; the hub keeps only features
 * that touch the Pueblo area.
 */
import { PUEBLO_COUNTY_BBOX, touchesBBox } from "../geo";
import type { Feature, SourceDefinition } from "../types";

const BASE = "https://data.cotrip.org/api/v1";
const ATTRIBUTION = { text: "Colorado Department of Transportation (COtrip)", url: "https://www.cotrip.org/" };

function cotripLayer(
  id: string,
  path: string,
  name: string,
  description: string,
  color: string,
): SourceDefinition {
  return {
    id,
    name,
    category: "live",
    description,
    freshness: "near-live",
    refreshMs: 5 * 60 * 1000,
    attribution: ATTRIBUTION,
    color,
    requiresEnv: "COTRIP_API_KEY",
    nameProperty: "name",
    async fetch(ctx) {
      const key = encodeURIComponent(String(ctx.env.COTRIP_API_KEY));
      const data = await ctx.fetchJson(`${BASE}/${path}?apiKey=${key}`);
      const features: Feature[] = [];
      for (const f of data?.features || []) {
        if (!touchesBBox(f.geometry, PUEBLO_COUNTY_BBOX)) continue;
        const p = f.properties || {};
        features.push({
          type: "Feature",
          id: p.id ?? f.id,
          geometry: f.geometry,
          properties: {
            ...p,
            name: p.travelerInformationMessage || p.name || p.type || name,
          },
        });
      }
      return { type: "FeatureCollection", features };
    },
  };
}

export const cotripIncidents = cotripLayer(
  "road-incidents",
  "incidents",
  "Road incidents",
  "Crashes, closures and hazards reported by CDOT",
  "#dc2626",
);

export const cotripConstruction = cotripLayer(
  "road-construction",
  "plannedEvents",
  "Construction",
  "Planned roadwork and lane closures from CDOT",
  "#d97706",
);
