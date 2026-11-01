/**
 * The hub's cache and scheduler. One cache entry per source:
 *
 * - A result is reused until its source's refreshMs passes, so a hundred
 *   people opening the map cost one upstream request.
 * - Concurrent requests for the same source share one fetch.
 * - When a refresh fails, the last good data keeps being served and is
 *   marked stale, with the error, so the UI can say so.
 * - Repeated failures back off (30 s, 1 min, 2 min ... 15 min) so a broken
 *   upstream is not hammered.
 * - Sources whose key is missing are reported as disabled and never fetched.
 */
import { fetchBytes, fetchJson } from "./http";
import type { FeatureCollection, SourceDefinition, SourceStatus } from "./types";

interface Entry {
  data: FeatureCollection | null;
  updatedAt: number | null;
  lastAttemptAt: number | null;
  error: string | null;
  failures: number;
  retryAt: number;
  inflight: Promise<void> | null;
}

const BACKOFF_MS = [30_000, 60_000, 120_000, 300_000, 900_000];

export interface RegistryOptions {
  env?: Record<string, string | undefined>;
  now?: () => number;
  fetchJsonImpl?: typeof fetchJson;
  fetchBytesImpl?: typeof fetchBytes;
}

export function createRegistry(sources: SourceDefinition[], options: RegistryOptions = {}) {
  const env = options.env ?? process.env;
  const now = options.now ?? Date.now;
  const fetchJsonImpl = options.fetchJsonImpl ?? fetchJson;
  const fetchBytesImpl = options.fetchBytesImpl ?? fetchBytes;
  const byId = new Map<string, SourceDefinition>();
  for (const source of sources) {
    if (byId.has(source.id)) throw new Error(`Duplicate source id ${source.id}`);
    byId.set(source.id, source);
  }
  const entries = new Map<string, Entry>();
  const entry = (id: string): Entry => {
    let e = entries.get(id);
    if (!e) {
      e = { data: null, updatedAt: null, lastAttemptAt: null, error: null, failures: 0, retryAt: 0, inflight: null };
      entries.set(id, e);
    }
    return e;
  };

  const isEnabled = (source: SourceDefinition) =>
    !source.requiresEnv || Boolean(String(env[source.requiresEnv] ?? "").trim());

  const refresh = (source: SourceDefinition, e: Entry): Promise<void> => {
    if (e.inflight) return e.inflight;
    const controller = new AbortController();
    e.lastAttemptAt = now();
    e.inflight = source
      .fetch({
        signal: controller.signal,
        env,
        now,
        fetchJson: (url, init) => fetchJsonImpl(url, controller.signal, init),
        fetchBytes: (url, init) => fetchBytesImpl(url, controller.signal, init),
      })
      .then((data) => {
        if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features))
          throw new Error("Source returned no features");
        e.data = data;
        e.updatedAt = now();
        e.error = null;
        e.failures = 0;
        e.retryAt = 0;
      })
      .catch((error: any) => {
        e.error = error?.message || String(error);
        e.retryAt = now() + BACKOFF_MS[Math.min(e.failures, BACKOFF_MS.length - 1)];
        e.failures++;
        console.warn(`[pueblo-hub] ${source.id}: ${e.error}`);
      })
      .finally(() => {
        e.inflight = null;
      });
    return e.inflight;
  };

  const status = (source: SourceDefinition): SourceStatus => {
    const e = entry(source.id);
    if (!isEnabled(source))
      return { state: "disabled", updatedAt: null, lastAttemptAt: null, error: `Needs ${source.requiresEnv}`, count: 0 };
    const fresh = e.updatedAt !== null && now() - e.updatedAt < source.refreshMs;
    const state = e.data ? (e.error || !fresh ? "stale" : "ok") : e.error ? "error" : "idle";
    return {
      state,
      updatedAt: e.updatedAt,
      lastAttemptAt: e.lastAttemptAt,
      error: e.error,
      count: e.data?.features.length ?? 0,
    };
  };

  return {
    has: (id: string) => byId.has(id),
    list: () => [...byId.values()],
    status: (id: string) => {
      const source = byId.get(id);
      return source ? status(source) : null;
    },
    /**
     * The source's data, fetched first if it is missing or older than its
     * refresh interval (and not inside a failure backoff).
     */
    async get(id: string) {
      const source = byId.get(id);
      if (!source) throw new Error(`Unknown source ${id}`);
      if (!isEnabled(source)) return { source, status: status(source), data: null };
      const e = entry(id);
      const due = e.updatedAt === null || now() - e.updatedAt >= source.refreshMs;
      if (due && now() >= e.retryAt) await refresh(source, e);
      return { source, status: status(source), data: e.data };
    },
  };
}

export type Registry = ReturnType<typeof createRegistry>;
