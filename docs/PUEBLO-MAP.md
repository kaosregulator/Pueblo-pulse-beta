# The Pueblo live map

The **Interactive Map** tab shows Pueblo on the God's Eye View 3D engine, with
Pueblo Pulse's own content and a set of Pueblo data layers on top.

## How it fits together

```
 Pueblo Pulse (this repo, one Railway service)            God's Eye View (second Railway service)
 ┌──────────────────────────────────────────────┐         ┌──────────────────────────────────┐
 │ React app                                    │ iframe  │ 3D globe, opens on Pueblo        │
 │  PuebloLiveMap ── layer drawer, detail cards ├────────►│ ?embed=1                          │
 │        │   postMessage: gev:overlay,         │◄────────┤ gev:ready, gev:overlay-select    │
 │        │   gev:layer, gev:fly-to             │         │ own layers: radar, wind, fires,  │
 │        ▼                                     │         │ flights, traffic, earthquakes... │
 │  /api/pueblo (Express, server/pueblo)        │         └──────────────────────────────────┘
 │   registry: cache · de-dupe · backoff ·      │
 │             status · freshness · credits     │
 │   sources: County GIS (ArcGIS), NWS, USGS,   │
 │            Open-Meteo, CDOT, Pueblo Transit  │
 └──────────────────────────────────────────────┘
```

- **Retrieval and rendering are separate.** The hub fetches and caches; the
  engine only draws GeoJSON it is handed and reports clicks. Firestore content
  (businesses, events, lost and found, jobs, alerts) is turned into GeoJSON in
  the browser (`src/pueblo/layers.ts`) and sent the same way.
- **One upstream request per interval, not per visitor.** Each source has its
  own refresh interval; concurrent requests share one fetch; failures back off
  from 30 seconds to 15 minutes and keep serving the last good data, marked
  stale.
- **Freshness is never overstated.** Every source declares `live`,
  `near-live`, `periodic`, `scheduled` or `static`, and the drawer shows that
  label. Buses are `scheduled`: Pueblo Transit publishes no live GPS feed, so
  bus positions come from the timetable and every bus card says so.

## Adding a data source

Most Pueblo GIS layers are one entry in `server/pueblo/catalog.ts`:

```ts
arcgisLayer({
  id: "historic-districts",
  name: "Historic districts",
  category: "geo",            // live | geo | community | safety
  description: "Locally designated historic districts",
  color: "#7c2d12",
  service: `${PUEBLO_COUNTY_GIS}/Landbase/SomeService/MapServer`,
  layerName: "Historic Districts", // or layerId: 3
  nameProperty: "NAME",
}),
```

Anything else implements `SourceDefinition` (`server/pueblo/types.ts`): return
a GeoJSON FeatureCollection from `fetch(ctx)` using `ctx.fetchJson`. Set
`requiresEnv` if it needs a key; it then shows as "needs setup" until the key
is present. The map's layer drawer lists new sources automatically.

## API

| Route | Returns |
|---|---|
| `GET /api/pueblo/sources` | Every source with category, freshness, refresh interval, credit and live status |
| `GET /api/pueblo/layers/:id` | One source's GeoJSON plus its status (503 when the source is down and has no cached data, 409 when it needs a key) |
| `GET /api/pueblo/transit/routes` | Pueblo Transit routes with today's service window and buses scheduled now |
| `GET /api/pueblo/transit/stops/:id/departures` | Next scheduled departures from a stop |

## Deploying on Railway

Two services in one Railway project:

1. **God's Eye View** from `kaosregulator/gods-eye-view` (its `railway.json`
   uses the Dockerfile). Variables: `GEV_ALLOWED_HOSTS` = its own Railway
   domain, `GEV_EMBED_FRAME_ANCESTORS` = `https://<pueblo pulse domain>`.
   See that repo's `docs/PUEBLO.md` for optional keys.
2. **Pueblo Pulse** from this repo (`railway.json` builds with
   `npm run build` and starts with `npm start`). Variables:
   `VITE_GEV_URL` = `https://<god's eye view domain>`, `GEMINI_API_KEY`, and
   optionally `COTRIP_API_KEY`. `VITE_GEV_URL` is read at build time, so
   redeploy after changing it.

Railway sets `PORT` for both; the servers read it.

## Tests

`npm test` runs the hub tests: the GTFS reader and schedule estimator, the
cache/backoff registry, the ArcGIS query builder and the USGS and AQI parsers.
