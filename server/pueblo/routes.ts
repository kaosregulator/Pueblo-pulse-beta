/**
 * HTTP routes of the Pueblo data hub, mounted under /api/pueblo.
 *
 *   GET /api/pueblo/sources                       catalog + status of every source
 *   GET /api/pueblo/layers/:id                    one source's GeoJSON
 *   GET /api/pueblo/transit/routes                route list with today's service
 *   GET /api/pueblo/transit/stops/:id/departures  next scheduled departures
 */
import express, { type Request, type Response } from "express";
import { fetchBytes } from "./http";
import { PUEBLO_SOURCES } from "./catalog";
import { createRegistry, type Registry } from "./registry";
import type { SourceDefinition } from "./types";
import { nextDepartures, routeSummaries } from "./transit/gtfs";
import { transitModel } from "./transit/sources";

const ID = /^[a-z0-9-]{1,64}$/;

export function describeSource(registry: Registry, source: SourceDefinition) {
  return {
    id: source.id,
    name: source.name,
    category: source.category,
    description: source.description,
    freshness: source.freshness,
    refreshSeconds: Math.round(source.refreshMs / 1000),
    attribution: source.attribution,
    color: source.color,
    defaultOn: Boolean(source.defaultOn),
    status: registry.status(source.id),
  };
}

export function createPuebloRouter(registry: Registry = createRegistry(PUEBLO_SOURCES)) {
  const router = express.Router();

  router.get("/sources", (_req: Request, res: Response) => {
    res.set("Cache-Control", "no-store");
    res.json({
      generatedAt: new Date().toISOString(),
      sources: registry.list().map((s) => describeSource(registry, s)),
    });
  });

  router.get("/layers/:id", async (req: Request, res: Response) => {
    const id = String(req.params.id);
    if (!ID.test(id) || !registry.has(id)) return res.status(404).json({ error: "Unknown layer" });
    try {
      const { source, status, data } = await registry.get(id);
      res.set("Cache-Control", `public, max-age=${Math.max(5, Math.min(60, Math.round(source.refreshMs / 2000)))}`);
      res.status(data ? 200 : status.state === "disabled" ? 409 : 503).json({
        source: describeSource(registry, source),
        data: data ?? { type: "FeatureCollection", features: [] },
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Layer failed" });
    }
  });

  const transitContext = () => ({
    env: process.env,
    now: Date.now,
    fetchBytes: (url: string) => fetchBytes(url, AbortSignal.timeout(60_000)),
  });

  router.get("/transit/routes", async (_req: Request, res: Response) => {
    try {
      const model = await transitModel(transitContext());
      res.set("Cache-Control", "public, max-age=30");
      res.json({
        agency: model.agencyName,
        estimated: true,
        notice:
          "Pueblo Transit does not publish live bus locations. Times and bus positions come from the published schedule.",
        feedVersion: model.feedVersion,
        validUntil: model.validUntil,
        routes: routeSummaries(model, Date.now()),
      });
    } catch (error: any) {
      res.status(503).json({ error: `Schedule unavailable: ${error?.message || error}` });
    }
  });

  router.get("/transit/stops/:id/departures", async (req: Request, res: Response) => {
    try {
      const model = await transitModel(transitContext());
      const stopId = String(req.params.id);
      const stop = model.stops.get(stopId);
      if (!stop) return res.status(404).json({ error: "Unknown stop" });
      res.set("Cache-Control", "public, max-age=30");
      res.json({ stop, estimated: true, departures: nextDepartures(model, stopId, Date.now(), 8) });
    } catch (error: any) {
      res.status(503).json({ error: `Schedule unavailable: ${error?.message || error}` });
    }
  });

  return router;
}
