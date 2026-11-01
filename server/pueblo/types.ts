/**
 * Pueblo data hub: shared types.
 *
 * Every outside data source the map can show is one SourceDefinition. A
 * definition says what the data is, how fresh it can honestly be called,
 * who to credit, and how to fetch it. The hub (registry.ts) owns caching,
 * de-duplication, refresh and status; sources only fetch and normalise.
 * Adding a source means writing one definition and listing it in catalog.ts.
 */

export type LayerCategory = "live" | "geo" | "community" | "safety";

/**
 * How fresh the data is, in words the UI shows as-is:
 * - live: seconds to a minute old
 * - near-live: a few minutes old
 * - periodic: hourly or daily
 * - scheduled: computed from a timetable, not observed
 * - static: a reference dataset that rarely changes
 */
export type Freshness = "live" | "near-live" | "periodic" | "scheduled" | "static";

export interface Attribution {
  text: string;
  url?: string;
}

export interface Feature {
  type: "Feature";
  id?: string | number;
  geometry: { type: string; coordinates: unknown } | null;
  properties: Record<string, unknown>;
}

export interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}

export interface FetchContext {
  signal: AbortSignal;
  env: Record<string, string | undefined>;
  now: () => number;
  fetchJson: (url: string, init?: { headers?: Record<string, string> }) => Promise<any>;
  fetchBytes: (url: string, init?: { headers?: Record<string, string> }) => Promise<Uint8Array>;
}

export interface SourceDefinition {
  id: string;
  name: string;
  category: LayerCategory;
  /** Short line for the layer drawer: what this shows. */
  description: string;
  freshness: Freshness;
  /** How long a successful result is reused before it is fetched again. */
  refreshMs: number;
  attribution: Attribution;
  /** Default map colour (#rrggbb). */
  color: string;
  /** Environment variable that must be set, or the source stays disabled. */
  requiresEnv?: string;
  /** Feature property shown as a feature's name. */
  nameProperty?: string;
  /** Whether the drawer switches this layer on for a first visit. */
  defaultOn?: boolean;
  fetch: (ctx: FetchContext) => Promise<FeatureCollection>;
}

export type SourceState = "idle" | "ok" | "stale" | "error" | "disabled";

export interface SourceStatus {
  state: SourceState;
  /** When the data now being served was fetched (ms since epoch). */
  updatedAt: number | null;
  lastAttemptAt: number | null;
  error: string | null;
  count: number;
}
