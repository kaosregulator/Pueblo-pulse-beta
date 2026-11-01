/**
 * Browser side of the Pueblo data hub (/api/pueblo). Requests are shared:
 * any number of components asking for the same layer cause one request, and
 * results are reused until the source's own refresh interval passes.
 */
import { useEffect, useState } from "react";

export type Freshness = "live" | "near-live" | "periodic" | "scheduled" | "static";
export type SourceState = "idle" | "ok" | "stale" | "error" | "disabled";

export interface HubSource {
  id: string;
  name: string;
  category: "live" | "geo" | "community" | "safety";
  description: string;
  freshness: Freshness;
  refreshSeconds: number;
  attribution: { text: string; url?: string };
  color: string;
  defaultOn: boolean;
  status: {
    state: SourceState;
    updatedAt: number | null;
    error: string | null;
    count: number;
  };
}

export interface GeoFeature {
  type: "Feature";
  id?: string | number;
  geometry: { type: string; coordinates: any } | null;
  properties: Record<string, any>;
}

export interface FeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

export interface HubLayer {
  source: HubSource;
  data: FeatureCollection;
  fetchedAt: number;
}

const layerCache = new Map<string, { at: number; promise: Promise<HubLayer> }>();

export async function fetchSources(signal?: AbortSignal): Promise<HubSource[]> {
  const res = await fetch("/api/pueblo/sources", { signal });
  if (!res.ok) throw new Error(`Data hub answered ${res.status}`);
  return (await res.json()).sources;
}

/** One layer, reusing a recent answer (minimum 15 s, else the source's own interval). */
export function fetchLayer(id: string, maxAgeMs: number): Promise<HubLayer> {
  const cached = layerCache.get(id);
  if (cached && Date.now() - cached.at < Math.max(15_000, maxAgeMs)) return cached.promise;
  const promise = fetch(`/api/pueblo/layers/${encodeURIComponent(id)}`).then(async (res) => {
    const body = await res.json().catch(() => null);
    // 503/409: the hub has no data for this source (down, or needs a key).
    if (!res.ok || !body?.source)
      throw new Error(body?.source?.status?.error || body?.error || `Layer answered ${res.status}`);
    return { source: body.source as HubSource, data: body.data as FeatureCollection, fetchedAt: Date.now() };
  });
  layerCache.set(id, { at: Date.now(), promise });
  promise.catch(() => layerCache.delete(id));
  return promise;
}

/** The hub catalog, refreshed every minute so status and freshness stay honest. */
export function useHubSources() {
  const [sources, setSources] = useState<HubSource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      fetchSources(controller.signal)
        .then((s) => {
          setSources(s);
          setError(null);
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(e.message || "Data hub unavailable");
        });
    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);
  return { sources, error };
}

/**
 * Data for every enabled hub layer, each refreshed on its own interval.
 * Returns layer id → result or error.
 */
export function useHubLayers(sources: HubSource[] | null, enabled: Set<string>) {
  const [layers, setLayers] = useState<Record<string, HubLayer | { error: string }>>({});
  const key = sources ? sources.filter((s) => enabled.has(s.id) && s.status.state !== "disabled").map((s) => s.id).sort().join(",") : "";
  useEffect(() => {
    if (!sources) return;
    let alive = true;
    const timers: number[] = [];
    for (const source of sources) {
      if (!enabled.has(source.id) || source.status.state === "disabled") continue;
      const every = Math.max(30, source.refreshSeconds) * 1000;
      const load = () =>
        fetchLayer(source.id, source.refreshSeconds * 1000)
          .then((layer) => alive && setLayers((prev) => ({ ...prev, [source.id]: layer })))
          .catch((e) => alive && setLayers((prev) => ({ ...prev, [source.id]: { error: e.message } })));
      load();
      timers.push(window.setInterval(load, every));
    }
    return () => {
      alive = false;
      timers.forEach((t) => window.clearInterval(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return layers;
}

export interface Departure {
  routeName: string;
  color: string;
  headsign: string;
  clock: string;
  minutesAway: number;
}

export async function fetchDepartures(stopId: string): Promise<Departure[]> {
  const res = await fetch(`/api/pueblo/transit/stops/${encodeURIComponent(stopId)}/departures`);
  if (!res.ok) throw new Error("Schedule unavailable");
  return (await res.json()).departures;
}

export interface TransitRouteSummary {
  id: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  url: string;
  runsToday: boolean;
  tripsToday: number;
  firstDeparture: string | null;
  lastArrival: string | null;
  busesNow: number;
  stopCount: number;
}

export async function fetchTransitRoutes(): Promise<{
  agency: string;
  notice: string;
  validUntil: string | null;
  routes: TransitRouteSummary[];
}> {
  const res = await fetch("/api/pueblo/transit/routes");
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.routes) throw new Error(body?.error || "Schedule unavailable");
  return body;
}

// ---------------------------------------------------------------- wording

/** The freshness label shown beside a layer. Never says "live" unless it is. */
export function freshnessLabel(freshness: Freshness, refreshSeconds?: number): string {
  switch (freshness) {
    case "live":
      return "Live";
    case "near-live":
      return refreshSeconds && refreshSeconds >= 60 ? `Every ${Math.round(refreshSeconds / 60)} min` : "Near-live";
    case "periodic":
      return refreshSeconds && refreshSeconds >= 3600 ? `Every ${Math.round(refreshSeconds / 3600)} h` : "Periodic";
    case "scheduled":
      return "Schedule";
    default:
      return "Reference";
  }
}

export function agoLabel(ms: number | null | undefined, now = Date.now()): string {
  if (!ms) return "not loaded yet";
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}
