import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bus,
  ChevronDown,
  Crosshair,
  ExternalLink,
  Layers,
  Loader2,
  Wind,
  X,
} from "lucide-react";
import InteractiveMap from "./InteractiveMap";
import type { BusinessItem, EventItem, JobItem, LostFoundItem, SafetyAlert } from "../types";
import {
  agoLabel,
  fetchDepartures,
  fetchLayer,
  freshnessLabel,
  useHubLayers,
  useHubSources,
  type Departure,
  type GeoFeature,
  type HubLayer,
  type HubSource,
} from "../pueblo/hub";
import {
  ENGINE_LAYERS,
  GROUPS,
  PULSE_LAYERS,
  pulseFeatures,
  pulseRecord,
  type EngineLayer,
  type LayerGroup,
  type PulseLayer,
} from "../pueblo/layers";

interface PuebloLiveMapProps {
  events: EventItem[];
  businesses: BusinessItem[];
  jobs: JobItem[];
  lostFound: LostFoundItem[];
  alerts: SafetyAlert[];
  onSelectPin: (type: string, item: any) => void;
}

const GEV_URL: string = String((import.meta as any).env?.VITE_GEV_URL || "").replace(/\/+$/, "");
const STORAGE_KEY = "pueblo-map-layers-v1";
const PUEBLO_VIEW = { lat: 38.2544, lon: -104.6091, range_m: 16000, pitch_deg: -50 };

type Row =
  | { kind: "hub"; id: string; group: LayerGroup; source: HubSource }
  | { kind: "engine"; id: string; group: LayerGroup; layer: EngineLayer }
  | { kind: "pulse"; id: string; group: LayerGroup; layer: PulseLayer };

interface Selection {
  source: HubSource;
  feature: GeoFeature;
}

function loadEnabled(): Set<string> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function saveEnabled(enabled: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]));
  } catch {
    /* private mode: the choice just isn't remembered */
  }
}

export default function PuebloLiveMap(props: PuebloLiveMapProps) {
  if (!GEV_URL) return <EngineMissing {...props} />;
  return <LiveMap {...props} />;
}

/** Without a map engine URL, keep the original Pulse map working. */
function EngineMissing(props: PuebloLiveMapProps) {
  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        The 3D map of Pueblo isn't connected yet. Set <code className="font-mono">VITE_GEV_URL</code> to the God's Eye
        View address to turn it on. The simple map below keeps working until then.
      </p>
      <div className="h-[480px] overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-1">
        <InteractiveMap {...props} />
      </div>
    </div>
  );
}

function LiveMap({ events, businesses, jobs, lostFound, alerts, onSelectPin }: PuebloLiveMapProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const gevOrigin = useMemo(() => new URL(GEV_URL, window.location.href).origin, []);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<LayerGroup>>(new Set(["live", "community"]));
  const [selection, setSelection] = useState<Selection | null>(null);
  const { sources, error: hubError } = useHubSources();

  // ------------------------------------------------------------ layer choice
  const [enabled, setEnabled] = useState<Set<string>>(() => loadEnabled() ?? new Set());
  const seeded = useRef(loadEnabled() !== null);
  useEffect(() => {
    if (seeded.current || !sources) return;
    seeded.current = true;
    const first = new Set<string>(PULSE_LAYERS.filter((l) => l.id !== "pulse:jobs").map((l) => l.id));
    sources.filter((s) => s.defaultOn).forEach((s) => first.add(s.id));
    setEnabled(first);
  }, [sources]);
  useEffect(() => saveEnabled(enabled), [enabled]);

  const toggle = useCallback((id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const s of sources || []) out.push({ kind: "hub", id: s.id, group: s.category, source: s });
    for (const l of ENGINE_LAYERS) out.push({ kind: "engine", id: l.id, group: l.group, layer: l });
    for (const l of PULSE_LAYERS) out.push({ kind: "pulse", id: l.id, group: l.group, layer: l });
    return out;
  }, [sources]);

  // ------------------------------------------------------------ data
  const hubLayers = useHubLayers(sources, enabled);
  const pulse = useMemo(
    () => pulseFeatures({ events, businesses, jobs, lostFound, alerts }),
    [events, businesses, jobs, lostFound, alerts],
  );

  // ------------------------------------------------------------ engine bridge
  const post = useCallback(
    (message: Record<string, unknown>) => frameRef.current?.contentWindow?.postMessage(message, gevOrigin),
    [gevOrigin],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== gevOrigin || event.source !== frameRef.current?.contentWindow) return;
      const data = event.data || {};
      if (data.type === "gev:ready") setReady(true);
      if (data.type === "gev:overlay-select") {
        const overlayId = String(data.overlayId || "");
        const featureId = String(data.featureId || "");
        if (overlayId.startsWith("pulse:")) {
          const record = pulseRecord(overlayId, featureId, { events, businesses, jobs, lostFound, alerts });
          if (record) onSelectPin(record.type, record.item);
          return;
        }
        const layer = hubLayers[overlayId];
        if (layer && "data" in layer) {
          const feature = layer.data.features.find((f) => String(f.id) === featureId);
          if (feature) setSelection({ source: layer.source, feature });
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [gevOrigin, hubLayers, events, businesses, jobs, lostFound, alerts, onSelectPin]);

  // Engine layers: tell the engine the full on/off state once it is ready,
  // then only what changes.
  const engineSent = useRef(new Map<string, boolean>());
  useEffect(() => {
    if (!ready) return;
    for (const layer of ENGINE_LAYERS) {
      const on = enabled.has(layer.id);
      if (engineSent.current.get(layer.id) === on) continue;
      engineSent.current.set(layer.id, on);
      post({ type: "gev:layer", layerId: layer.engineId, enabled: on });
    }
  }, [ready, enabled, post]);

  // Hub and Pulse layers become host overlays. Each is re-sent only when its
  // data object changes, and cleared when switched off.
  const overlaySent = useRef(new Map<string, unknown>());
  useEffect(() => {
    if (!ready) return;
    const wanted = new Map<string, { color: string; label: string; features: GeoFeature[]; ref: unknown }>();
    for (const s of sources || []) {
      const layer = hubLayers[s.id];
      if (enabled.has(s.id) && layer && "data" in layer)
        wanted.set(s.id, { color: s.color, label: s.name, features: layer.data.features, ref: layer.data });
    }
    for (const l of PULSE_LAYERS) {
      if (enabled.has(l.id)) wanted.set(l.id, { color: l.color, label: l.name, features: pulse[l.id] || [], ref: pulse[l.id] });
    }
    for (const [id, overlay] of wanted) {
      if (overlaySent.current.get(id) === overlay.ref) continue;
      overlaySent.current.set(id, overlay.ref);
      post({ type: "gev:overlay", overlay: { id, label: overlay.label, color: overlay.color, features: overlay.features } });
    }
    for (const id of [...overlaySent.current.keys()]) {
      if (wanted.has(id)) continue;
      overlaySent.current.delete(id);
      post({ type: "gev:overlay-clear", overlayId: id });
    }
  }, [ready, enabled, sources, hubLayers, pulse, post]);

  const recenter = () => post({ type: "gev:fly-to", ...PUEBLO_VIEW });

  const onCount = rows.filter((r) => enabled.has(r.id)).length;

  return (
    <section
      className="relative flex h-[calc(100dvh-11rem)] min-h-[560px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 font-sans text-stone-900"
      aria-label="Live map of Pueblo"
    >
      <aside
        id="pueblo-map-layers"
        className={`${drawerOpen ? "flex" : "hidden"} absolute inset-x-0 bottom-0 z-20 max-h-[70%] flex-col rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(28,25,23,0.18)] md:static md:z-auto md:flex md:max-h-none md:w-[300px] md:shrink-0 md:rounded-none md:border-r md:border-stone-200 md:shadow-none`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 pb-3 pt-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-stone-900">Map of Pueblo</h2>
            <p className="mt-0.5 text-xs leading-snug text-stone-500">
              {onCount} {onCount === 1 ? "layer" : "layers"} on. Each one says how fresh it is.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-orange-600 md:hidden"
            aria-label="Close layers"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <ConditionsStrip />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 [scrollbar-color:#d6d3d1_transparent] [scrollbar-width:thin]">
          {hubError && (
            <p className="mx-2 mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
              Pueblo data layers are unavailable right now ({hubError}). Community and engine layers still work.
            </p>
          )}
          {GROUPS.map((group) => {
            const groupRows = rows.filter((r) => r.group === group.id);
            if (!groupRows.length) return null;
            const open = openGroups.has(group.id);
            const on = groupRows.filter((r) => enabled.has(r.id)).length;
            return (
              <div key={group.id} className="mt-2">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() =>
                    setOpenGroups((prev) => {
                      const next = new Set(prev);
                      if (next.has(group.id)) next.delete(group.id);
                      else next.add(group.id);
                      return next;
                    })
                  }
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-orange-600"
                >
                  <span>
                    <span className="block text-[13px] font-semibold text-stone-900">{group.title}</span>
                    <span className="block text-[11.5px] text-stone-500">{group.blurb}</span>
                  </span>
                  <span className="flex items-center gap-2 text-[11px] tabular-nums text-stone-500">
                    {on > 0 && <span>{on} on</span>}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {open && (
                  <ul className="mt-0.5 space-y-px">
                    {groupRows.map((row) => (
                      <LayerRow
                        key={row.id}
                        row={row}
                        on={enabled.has(row.id)}
                        layer={row.kind === "hub" ? hubLayers[row.id] : undefined}
                        count={row.kind === "pulse" ? (pulse[row.id] || []).length : undefined}
                        onToggle={() => toggle(row.id)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <div className="relative min-w-0 flex-1">
        <iframe
          ref={frameRef}
          title="3D map of Pueblo, Colorado"
          src={`${GEV_URL}/?embed=1`}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen; geolocation"
        />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-stone-900/80">
            <p className="flex items-center gap-2 text-sm text-stone-200">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading the 3D map of Pueblo…
            </p>
          </div>
        )}

        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={recenter}
            disabled={!ready}
            className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-stone-800 shadow-[0_2px_8px_rgba(28,25,23,0.25)] hover:bg-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-orange-600"
          >
            <Crosshair className="h-3.5 w-3.5" /> Back to Pueblo
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-controls="pueblo-map-layers"
            aria-expanded={drawerOpen}
            className="flex items-center gap-1.5 rounded-lg bg-orange-700 px-3 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(28,25,23,0.3)] hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
          >
            <Layers className="h-3.5 w-3.5" /> Layers
          </button>
        </div>

        {selection && <FeatureCard selection={selection} onClose={() => setSelection(null)} />}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- rows

interface LayerRowProps {
  row: Row;
  on: boolean;
  layer?: HubLayer | { error: string };
  count?: number;
  onToggle: () => void;
}

const LayerRow: React.FC<LayerRowProps> = ({ row, on, layer, count, onToggle }) => {
  const name = row.kind === "hub" ? row.source.name : row.layer.name;
  const description = row.kind === "hub" ? row.source.description : row.layer.description;
  const color = row.kind === "hub" ? row.source.color : row.layer.color;

  let chip = "";
  if (row.kind === "hub") chip = freshnessLabel(row.source.freshness, row.source.refreshSeconds);
  else if (row.kind === "engine") chip = row.layer.note || freshnessLabel(row.layer.freshness);
  else chip = "Members";

  let status: { tone: "muted" | "warn" | "error"; text: string } | null = null;
  if (row.kind === "hub") {
    const s = row.source.status;
    if (s.state === "disabled") status = { tone: "muted", text: setupHint(row.source) };
    else if (on && layer && "error" in layer) status = { tone: "error", text: "Couldn't load. Retrying shortly." };
    else if (on && s.state === "error") status = { tone: "error", text: "Source is down. Retrying shortly." };
    else if (on && s.state === "stale") status = { tone: "warn", text: `Showing data from ${agoLabel(s.updatedAt)}` };
    else if (on && layer && "data" in layer)
      status = { tone: "muted", text: `${layer.data.features.length} shown · updated ${agoLabel(layer.source.status.updatedAt)}` };
    else if (on) status = { tone: "muted", text: "Loading…" };
  } else if (row.kind === "pulse" && on) {
    status = { tone: "muted", text: count ? `${count} on the map` : "Nothing posted with a location yet" };
  }
  const disabled = row.kind === "hub" && row.source.status.state === "disabled";

  return (
    <li>
      <div className={`group flex gap-3 rounded-lg px-2 py-2 ${disabled ? "opacity-60" : "hover:bg-stone-50"}`}>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={name}
          disabled={disabled}
          onClick={onToggle}
          className={`mt-0.5 h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed ${on ? "bg-orange-700" : "bg-stone-300"}`}
        >
          <span
            className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${on ? "translate-x-4" : ""}`}
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
            <span className="truncate text-[13px] font-medium text-stone-900">{name}</span>
            <span
              className={`ml-auto shrink-0 rounded px-1.5 py-px text-[10.5px] font-medium ${
                chip === "Live"
                  ? "bg-emerald-50 text-emerald-800"
                  : chip === "Schedule"
                    ? "bg-amber-50 text-amber-900"
                    : "bg-stone-100 text-stone-600"
              }`}
            >
              {chip}
            </span>
          </div>
          <p className="mt-0.5 text-[11.5px] leading-snug text-stone-500">{description}</p>
          {status && (
            <p
              className={`mt-0.5 text-[11px] leading-snug ${
                status.tone === "error" ? "text-red-700" : status.tone === "warn" ? "text-amber-800" : "text-stone-400"
              }`}
            >
              {status.text}
            </p>
          )}
        </div>
      </div>
    </li>
  );
};

function setupHint(source: HubSource): string {
  if (source.attribution.text.includes("CDOT") || source.attribution.text.includes("Colorado Department"))
    return "Needs a free CDOT COtrip key to turn on";
  return "Needs setup before it can turn on";
}

// ---------------------------------------------------------------- conditions

/** Weather, air and alerts at a glance, from the hub's own cached layers. */
function ConditionsStrip() {
  const [state, setState] = useState<{ temp?: string; sky?: string; aqi?: string; aqiColor?: string; alerts?: number }>({});
  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchLayer("nws-conditions", 600_000)
        .then((l) => {
          const p = l.data.features[0]?.properties || {};
          if (alive) setState((s) => ({ ...s, temp: p.temperatureF != null ? `${p.temperatureF}°` : undefined, sky: p.sky || undefined }));
        })
        .catch(() => {});
      fetchLayer("air-quality", 1_800_000)
        .then((l) => {
          const p = l.data.features[0]?.properties || {};
          if (alive) setState((s) => ({ ...s, aqi: p.aqi != null ? `AQI ${p.aqi}` : undefined, aqiColor: p.color }));
        })
        .catch(() => {});
      fetchLayer("nws-alerts", 120_000)
        .then((l) => alive && setState((s) => ({ ...s, alerts: l.data.features.length })))
        .catch(() => {});
    };
    load();
    const timer = window.setInterval(load, 300_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);
  if (!state.temp && !state.aqi && state.alerts === undefined) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-stone-100 px-4 py-2.5 text-xs text-stone-700">
      {state.temp && (
        <span className="tabular-nums">
          <span className="text-[15px] font-semibold text-stone-900">{state.temp}</span>
          {state.sky && <span className="ml-1 text-stone-500">{state.sky}</span>}
        </span>
      )}
      {state.aqi && (
        <span className="flex items-center gap-1.5">
          <Wind className="h-3.5 w-3.5 text-stone-400" />
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: state.aqiColor }} aria-hidden />
          {state.aqi}
        </span>
      )}
      {state.alerts !== undefined && (
        <span className={`flex items-center gap-1 ${state.alerts ? "font-medium text-red-700" : "text-stone-500"}`}>
          <AlertTriangle className="h-3.5 w-3.5" />
          {state.alerts ? `${state.alerts} weather ${state.alerts === 1 ? "alert" : "alerts"}` : "No weather alerts"}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- details

const HIDDEN = /^(objectid|fid|globalid.*|shape.*|created.*|last_edi.*|color|name|estimated|approximate|id|url|routeid|stopid|description|instruction)$/i;

const LABELS: Record<string, [string, (v: any) => string]> = {
  status: ["Status", String],
  nextStop: ["Next stop", String],
  nextStopAt: ["Due there", String],
  route: ["Route", String],
  headline: ["Headline", String],
  severity: ["Severity", String],
  areas: ["Areas", String],
  expires: ["Until", (v) => new Date(v).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })],
  flowCfs: ["Flow", (v) => `${Number(v).toLocaleString()} cubic ft/s`],
  gageFt: ["Gauge height", (v) => `${v} ft`],
  readingAt: ["Reading taken", (v) => new Date(v).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })],
  aqi: ["US AQI", String],
  category: ["Category", String],
  pm25: ["PM2.5", (v) => `${v} µg/m³`],
  ozone: ["Ozone", (v) => `${v} µg/m³`],
  temperatureF: ["Temperature", (v) => `${v}°F`],
  windMph: ["Wind", (v) => `${v} mph`],
  windGustMph: ["Gusts", (v) => `${v} mph`],
  humidity: ["Humidity", (v) => `${v}%`],
  ACRES: ["Acres", (v) => Number(v).toFixed(1)],
  hours: ["Weekday hours", String],
  weekendHours: ["Weekend hours", String],
};

const humanKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

function rowsFor(properties: Record<string, any>): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined || value === "" || typeof value === "object" || HIDDEN.test(key)) continue;
    if (typeof value === "string" && !value.trim()) continue;
    const known = LABELS[key];
    out.push(known ? [known[0], known[1](value)] : [humanKey(key), String(value)]);
    if (out.length >= 8) break;
  }
  return out;
}

function FeatureCard({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const { source, feature } = selection;
  const p = feature.properties || {};
  const title = String(p.name || p.title || source.name);
  const [departures, setDepartures] = useState<Departure[] | null | "error">(null);
  const stopId = source.id === "transit-stops" ? String(p.stopId || feature.id || "") : "";

  useEffect(() => {
    setDepartures(null);
    if (!stopId) return;
    fetchDepartures(stopId).then(setDepartures).catch(() => setDepartures("error"));
  }, [stopId]);

  const details = rowsFor(p);
  const long = String(p.description || p.instruction || "").trim();

  return (
    <div
      role="dialog"
      aria-label={title}
      className="absolute bottom-3 left-3 right-3 z-10 max-h-[60%] overflow-y-auto rounded-xl bg-white p-4 shadow-[0_8px_28px_rgba(28,25,23,0.28)] sm:right-auto sm:w-[340px] animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-stone-900">{title}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-stone-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || source.color }} aria-hidden />
            {source.name} · {freshnessLabel(source.freshness, source.refreshSeconds)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-orange-600"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {p.estimated && (
        <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] leading-snug text-amber-900">
          <Bus className="mt-px h-3.5 w-3.5 shrink-0" />
          Scheduled position, not live GPS. Pueblo Transit doesn't publish live bus locations, so this is where the
          timetable says the bus should be.
        </p>
      )}
      {p.approximate && (
        <p className="mt-3 text-[11.5px] text-stone-500">Placed at its neighbourhood, not an exact address.</p>
      )}

      {details.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          {details.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-stone-500">{k}</dt>
              <dd className="min-w-0 break-words text-stone-900 tabular-nums">{v}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}

      {long && <p className="mt-3 line-clamp-6 whitespace-pre-line text-xs leading-relaxed text-stone-700">{long}</p>}

      {stopId && (
        <div className="mt-3">
          <h4 className="text-xs font-semibold text-stone-900">Next scheduled buses</h4>
          {departures === null && <p className="mt-1 text-xs text-stone-500">Checking the timetable…</p>}
          {departures === "error" && <p className="mt-1 text-xs text-red-700">Couldn't read the schedule right now.</p>}
          {Array.isArray(departures) && departures.length === 0 && (
            <p className="mt-1 text-xs text-stone-500">No more buses scheduled here today.</p>
          )}
          {Array.isArray(departures) && departures.length > 0 && (
            <ul className="mt-1.5 space-y-1">
              {departures.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span
                    className="min-w-7 rounded px-1.5 py-px text-center text-[11px] font-semibold text-white"
                    style={{ backgroundColor: d.color }}
                  >
                    {d.routeName}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-stone-700">{d.headsign || "—"}</span>
                  <span className="tabular-nums text-stone-900">{d.clock}</span>
                  <span className="w-12 text-right tabular-nums text-stone-500">
                    {d.minutesAway <= 0 ? "now" : `${d.minutesAway} min`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-2.5 text-[11px] text-stone-500">
        <span>
          {source.attribution.url ? (
            <a
              href={source.attribution.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-stone-300 underline-offset-2 hover:text-stone-800"
            >
              {source.attribution.text}
            </a>
          ) : (
            source.attribution.text
          )}
          {" · updated "}
          {agoLabel(source.status.updatedAt)}
        </span>
        {typeof p.url === "string" && /^https?:\/\//.test(p.url) && (
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1 font-medium text-orange-800 hover:text-orange-900"
          >
            More <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
