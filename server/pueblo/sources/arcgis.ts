/**
 * ArcGIS REST feature layers (Pueblo County GIS and the City of Pueblo's
 * ArcGIS Online services). One factory covers every layer: it finds the layer
 * by name if no id is given, asks only for features inside Pueblo's bounding
 * box, pages through the server's record limit, and asks the server for
 * GeoJSON in WGS84 so nothing needs reprojecting here.
 */
import { PUEBLO_BBOX, type BBox } from "../geo";
import type { Feature, FeatureCollection, FetchContext, SourceDefinition } from "../types";

export const PUEBLO_COUNTY_GIS = "https://maps.co.pueblo.co.us/outside/rest/services";

export interface ArcgisLayerOptions
  extends Omit<SourceDefinition, "fetch" | "attribution" | "freshness" | "refreshMs"> {
  /** MapServer or FeatureServer URL, without a layer id. */
  service: string;
  /** Layer id; or give layerName and the id is looked up once. */
  layerId?: number;
  layerName?: string;
  where?: string;
  /** Fields to keep (the rest are dropped to keep payloads small). */
  outFields?: string[];
  bbox?: Readonly<BBox>;
  /** Simplify geometry to this many metres (server side). */
  simplifyM?: number;
  maxFeatures?: number;
  freshness?: SourceDefinition["freshness"];
  refreshMs?: number;
  attribution?: SourceDefinition["attribution"];
}

const PAGE = 2000;

/** Build the query URL for one page. Exported for tests. */
export function arcgisQueryUrl(
  layerUrl: string,
  { where = "1=1", outFields = ["*"], bbox = PUEBLO_BBOX, simplifyM, offset = 0 }: {
    where?: string;
    outFields?: string[];
    bbox?: Readonly<BBox>;
    simplifyM?: number;
    offset?: number;
  } = {},
): string {
  const params = new URLSearchParams({
    where,
    outFields: outFields.join(","),
    geometry: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outSR: "4326",
    returnGeometry: "true",
    resultOffset: String(offset),
    resultRecordCount: String(PAGE),
    f: "geojson",
  });
  if (simplifyM) params.set("maxAllowableOffset", String(Number((simplifyM / 111_000).toPrecision(2))));
  return `${layerUrl}/query?${params}`;
}

async function resolveLayerUrl(ctx: FetchContext, options: ArcgisLayerOptions): Promise<string> {
  const service = options.service.replace(/\/+$/, "");
  if (Number.isInteger(options.layerId)) return `${service}/${options.layerId}`;
  const info = await ctx.fetchJson(`${service}/layers?f=json`);
  const wanted = String(options.layerName || "").toLowerCase();
  const layer = (info?.layers || []).find(
    (l: any) => String(l?.name || "").toLowerCase() === wanted,
  ) ?? (wanted ? null : info?.layers?.[0]);
  if (!layer) throw new Error(`Layer "${options.layerName}" not found in ${service.split("/services/")[1] || service}`);
  return `${service}/${layer.id}`;
}

export function arcgisLayer(options: ArcgisLayerOptions): SourceDefinition {
  let layerUrl: string | null = null;
  const max = options.maxFeatures ?? 10_000;
  return {
    id: options.id,
    name: options.name,
    category: options.category,
    description: options.description,
    color: options.color,
    nameProperty: options.nameProperty,
    defaultOn: options.defaultOn,
    requiresEnv: options.requiresEnv,
    freshness: options.freshness ?? "static",
    refreshMs: options.refreshMs ?? 24 * 60 * 60 * 1000,
    attribution: options.attribution ?? {
      text: "Pueblo County GIS",
      url: "https://county.pueblo.org/information-technology/geographic-information-gis",
    },
    async fetch(ctx): Promise<FeatureCollection> {
      layerUrl ??= await resolveLayerUrl(ctx, options);
      const features: Feature[] = [];
      // Advance by what the server actually returned: a service may cap a
      // page below PAGE, and stepping by PAGE would skip features.
      for (let offset = 0; offset < max; ) {
        const page = await ctx.fetchJson(
          arcgisQueryUrl(layerUrl, { ...options, offset }),
        );
        if (page?.error) throw new Error(page.error.message || "ArcGIS query failed");
        const batch: Feature[] = Array.isArray(page?.features) ? page.features : [];
        for (const feature of batch) {
          const props = feature.properties || {};
          const name = options.nameProperty ? props[options.nameProperty] : undefined;
          features.push({
            type: "Feature",
            id: (feature.id ?? props.OBJECTID ?? features.length) as string | number,
            geometry: feature.geometry,
            properties: name !== undefined ? { ...props, name } : props,
          });
        }
        const more = page?.exceededTransferLimit === true || page?.properties?.exceededTransferLimit === true;
        if (!more || batch.length === 0) break;
        offset += batch.length;
      }
      return { type: "FeatureCollection", features: features.slice(0, max) };
    },
  };
}
