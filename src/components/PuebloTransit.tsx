import React, { useEffect, useMemo, useState } from "react";
import { Bus, ExternalLink, Info, Pin, PinOff } from "lucide-react";
import { fetchLayer, fetchTransitRoutes, type GeoFeature, type TransitRouteSummary } from "../pueblo/hub";

/** Real Pueblo Transit routes from the published schedule, refreshed every 30 s. */
function useTransit() {
  const [routes, setRoutes] = useState<TransitRouteSummary[] | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<GeoFeature[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchTransitRoutes()
        .then((body) => {
          if (!alive) return;
          setRoutes(body.routes);
          setNotice(body.notice);
          setError(null);
        })
        .catch((e) => alive && setError(e.message));
      fetchLayer("transit-vehicles", 30_000)
        .then((layer) => alive && setVehicles(layer.data.features))
        .catch(() => {});
    };
    load();
    const timer = window.setInterval(load, 30_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);
  return { routes, notice, error, vehicles };
}

const RouteBadge: React.FC<{ route: Pick<TransitRouteSummary, "shortName" | "color" | "textColor">; size?: "sm" | "md" }> = ({
  route,
  size = "md",
}) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-md font-semibold tabular-nums ${
      size === "sm" ? "h-5 min-w-5 px-1 text-[10.5px]" : "h-7 min-w-7 px-1.5 text-xs"
    }`}
    style={{ backgroundColor: route.color, color: route.textColor }}
  >
    {route.shortName || "•"}
  </span>
);

interface BoardProps {
  favoritedRouteIds?: string[];
  onToggleFavoriteRoute?: (id: string) => void;
}

/** The transit half of the Weather & Transit hub. */
export default function PuebloTransitBoard({ favoritedRouteIds = [], onToggleFavoriteRoute }: BoardProps) {
  const { routes, notice, error, vehicles } = useTransit();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => routes?.find((r) => r.id === selectedId) ?? routes?.find((r) => r.runsToday) ?? routes?.[0] ?? null,
    [routes, selectedId],
  );
  const buses = vehicles.filter((v) => v.properties.routeId === selected?.id);
  const running = routes?.reduce((n, r) => n + r.busesNow, 0) ?? 0;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-4 font-sans text-stone-900">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
            <Bus className="h-4.5 w-4.5 text-orange-700" /> Pueblo Transit
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {routes ? `${routes.length} routes · ${running} ${running === 1 ? "bus" : "buses"} scheduled right now` : "Reading the schedule…"}
          </p>
        </div>
        <a
          href="https://www.pueblo.us/492/Bus-Schedules"
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-orange-800 hover:text-orange-900"
        >
          Official schedules <ExternalLink className="h-3 w-3" />
        </a>
      </header>

      <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] leading-snug text-amber-900">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        {notice ||
          "Pueblo Transit does not publish live bus locations. Times and bus positions come from the published schedule."}
      </p>

      {error && !routes && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
          The bus schedule couldn't be loaded right now. For times, call Pueblo Transit at (719) 553-2727.
        </p>
      )}

      {!routes && !error && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="h-8 w-24 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      )}

      {routes && (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Routes">
            {routes.map((route) => {
              const active = route.id === selected?.id;
              return (
                <button
                  key={route.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedId(route.id)}
                  className={`flex items-center gap-1.5 rounded-lg border py-1 pl-1 pr-2.5 text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-orange-600 ${
                    active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  } ${route.runsToday ? "" : "opacity-60"}`}
                >
                  <RouteBadge route={route} size="sm" />
                  <span className="max-w-[9rem] truncate">{route.longName || `Route ${route.shortName}`}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <RouteBadge route={selected} />
                  <div>
                    <h4 className="text-sm font-semibold leading-tight">{selected.longName || `Route ${selected.shortName}`}</h4>
                    <p className="text-xs text-stone-500">
                      {selected.runsToday
                        ? `Today ${selected.firstDeparture} – ${selected.lastArrival} · ${selected.tripsToday} trips · ${selected.stopCount} stops`
                        : "No service today"}
                    </p>
                  </div>
                </div>
                {onToggleFavoriteRoute && (
                  <button
                    type="button"
                    onClick={() => onToggleFavoriteRoute(selected.id)}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-orange-600"
                  >
                    {favoritedRouteIds.includes(selected.id) ? (
                      <>
                        <PinOff className="h-3.5 w-3.5" /> Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="h-3.5 w-3.5" /> Pin route
                      </>
                    )}
                  </button>
                )}
              </div>

              <h5 className="mt-4 text-xs font-semibold text-stone-900">Buses on this route now (by schedule)</h5>
              {buses.length === 0 ? (
                <p className="mt-1 text-xs text-stone-500">
                  {selected.runsToday ? "No bus is scheduled to be on the road right now." : "This route doesn't run today."}
                </p>
              ) : (
                <ul className="mt-1.5 divide-y divide-stone-100">
                  {buses.map((bus) => (
                    <li key={String(bus.id)} className="flex items-center justify-between gap-3 py-2 text-xs">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-stone-900">
                          {bus.properties.headsign ? `To ${bus.properties.headsign}` : "In service"}
                        </span>
                        <span className="block truncate text-stone-500">{bus.properties.status}</span>
                      </span>
                      {bus.properties.nextStop && (
                        <span className="shrink-0 text-right">
                          <span className="block text-stone-700">{bus.properties.nextStop}</span>
                          <span className="block tabular-nums text-stone-500">due {bus.properties.nextStopAt}</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-stone-400">
                See every bus and stop on the Interactive Map. Tap a stop there for its next departures.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** Pinned routes in the sidebar: today's service window, from the schedule. */
export function PinnedRoutes({ routeIds, onOpen }: { routeIds: string[]; onOpen: () => void }) {
  const { routes } = useTransit();
  const pinned = (routes || []).filter((r) => routeIds.includes(r.id));
  if (!pinned.length)
    return (
      <p className="py-1 text-[11px] leading-snug text-stone-500">
        No pinned routes yet. Pin one from Weather &amp; Transit to keep it here.
      </p>
    );
  return (
    <ul className="space-y-1.5">
      {pinned.map((route) => (
        <li key={route.id}>
          <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center gap-2 rounded-lg border border-stone-200 bg-white p-2 text-left hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-orange-600"
          >
            <RouteBadge route={route} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-medium text-stone-900">{route.longName}</span>
              <span className="block truncate text-[10.5px] text-stone-500">
                {route.runsToday ? `${route.firstDeparture} – ${route.lastArrival}` : "No service today"}
              </span>
            </span>
            <span className="shrink-0 text-[10.5px] tabular-nums text-stone-600">
              {route.busesNow ? `${route.busesNow} scheduled` : "—"}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
