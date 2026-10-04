import React, { useState } from "react";
import { MapPin, Info, AlertTriangle, Briefcase, Footprints } from "lucide-react";
import { EventItem, BusinessItem, JobItem, LostFoundItem, SafetyAlert, NeighborhoodID } from "../types";

interface InteractiveMapProps {
  events: EventItem[];
  businesses: BusinessItem[];
  jobs: JobItem[];
  lostFound: LostFoundItem[];
  alerts: SafetyAlert[];
  onSelectPin: (type: string, item: any) => void;
}

// Map coordinate system mapping Latitude/Longitude to SVG viewBox (0,0) - (800, 500)
// Pueblo bounds approximately:
// Lat: 38.2200 to 38.3300 (roughly 12km)
// Lng: -104.7600 to -104.4800 (roughly 24km)
function scaleCoords(lat: number, lng: number) {
  const minLat = 38.2200;
  const maxLat = 38.3300;
  const minLng = -104.7600;
  const maxLng = -104.4800;

  // Percentage-based scaling
  const pctX = (lng - minLng) / (maxLng - minLng);
  // Lat is reversed because Y increases downwards in SVG
  const pctY = 1 - (lat - minLat) / (maxLat - minLat);

  return {
    x: Math.round(pctX * 800),
    y: Math.round(pctY * 500),
  };
}

export default function InteractiveMap({
  events,
  businesses,
  jobs,
  lostFound,
  alerts,
  onSelectPin,
}: InteractiveMapProps) {
  const [filter, setFilter] = useState<"all" | "events" | "food" | "jobs" | "lost" | "alerts">("all");
  const [hoveredPin, setHoveredPin] = useState<{ id: string; name: string; category: string; x: number; y: number } | null>(null);

  // Collate all points of interest
  const pins: Array<{
    id: string;
    type: "event" | "business" | "job" | "lost_found" | "alert";
    title: string;
    description: string;
    neighborhood: NeighborhoodID;
    color: string;
    lat: number;
    lng: number;
    rawItem: any;
  }> = [];

  // Add Events
  events.forEach((e) => {
    pins.push({
      id: `event-${e.id}`,
      type: "event",
      title: e.title,
      description: e.category,
      neighborhood: e.neighborhood,
      color: "border-purple-600 bg-purple-100 text-purple-800 hover:bg-purple-200",
      lat: e.lat,
      lng: e.lng,
      rawItem: e,
    });
  });

  // Add Food Businesses
  businesses.forEach((b) => {
    pins.push({
      id: `business-${b.id}`,
      type: "business",
      title: b.name,
      description: `${b.category} Restaurant (${b.tier})`,
      neighborhood: b.neighborhood,
      color: "border-red-600 bg-red-100 text-red-800 hover:bg-red-200",
      lat: b.lat,
      lng: b.lng,
      rawItem: b,
    });
  });

  // Add Lost Pet / Found Pet
  lostFound.forEach((lf) => {
    pins.push({
      id: `lost-${lf.id}`,
      type: "lost_found",
      title: lf.title,
      description: lf.type,
      neighborhood: lf.neighborhood,
      color: "border-amber-600 bg-amber-100 text-amber-800 hover:bg-amber-200",
      lat: lf.lat,
      lng: lf.lng,
      rawItem: lf,
    });
  });

  // Add Alerts (that have lat/lng or neighborhood centers)
  alerts.forEach((alt) => {
    // Map with coordinates or approximate centers
    if (alt.neighborhood) {
      let lat = 38.2678;
      let lng = -104.6111; // downtown default
      if (alt.neighborhood === "pueblo_west") { lat = 38.3121; lng = -104.7188; }
      if (alt.neighborhood === "bessemer") { lat = 38.2411; lng = -104.6205; }
      if (alt.neighborhood === "union_district") { lat = 38.2652; lng = -104.6105; }
      
      pins.push({
        id: `alert-${alt.id}`,
        type: "alert",
        title: alt.title,
        description: alt.category,
        neighborhood: alt.neighborhood,
        color: "border-orange-600 bg-orange-100 text-orange-850 hover:bg-orange-200 animate-pulse",
        lat,
        lng,
        rawItem: alt,
      });
    }
  });

  // Apply filters
  const filteredPins = pins.filter((pin) => {
    if (filter === "all") return true;
    if (filter === "events" && pin.type === "event") return true;
    if (filter === "food" && pin.type === "business") return true;
    if (filter === "jobs" && pin.type === "job") return true;
    if (filter === "lost" && pin.type === "lost_found") return true;
    if (filter === "alerts" && pin.type === "alert") return true;
    return false;
  });

  return (
    <div className="flex flex-col h-full bg-stone-100 text-stone-900 overflow-hidden" id="pueblo-interactive-map-root">
      {/* Map Filter Bar */}
      <div className="p-3 bg-white border-b border-stone-200 flex flex-wrap gap-1.5 justify-center sm:justify-start">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all ${
            filter === "all" ? "bg-stone-900 text-white font-medium" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="map-filter-all-btn"
        >
          🌐 All Pins
        </button>
        <button
          onClick={() => setFilter("events")}
          className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all flex items-center gap-1 ${
            filter === "events" ? "bg-purple-750 text-white font-medium" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="map-filter-events-btn"
        >
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Events
        </button>
        <button
          onClick={() => setFilter("food")}
          className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all flex items-center gap-1 ${
            filter === "food" ? "bg-red-700 text-white font-medium" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="map-filter-food-btn"
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          Restaurants
        </button>
        <button
          onClick={() => setFilter("lost")}
          className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all flex items-center gap-1 ${
            filter === "lost" ? "bg-amber-600 text-white font-medium" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="map-filter-lost-btn"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Lost & Found
        </button>
        <button
          onClick={() => setFilter("alerts")}
          className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all flex items-center gap-1 ${
            filter === "alerts" ? "bg-orange-600 text-white font-medium" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="map-filter-alerts-btn"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          Roads & Alerts
        </button>
      </div>

      {/* Vector SVG Map Stage */}
      <div className="relative flex-1 bg-stone-50 min-h-[300px] border border-stone-200 rounded-b shadow-inner overflow-hidden select-none">
        
        {/* Legends on top */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded border border-stone-200 text-[10px] text-stone-600 space-y-0.5 z-10 pointer-events-none shadow-sm font-sans">
          <div className="font-semibold text-stone-800 text-[11px] mb-0.5">Pueblo Geography</div>
          <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block"></span> Arkansas River</div>
          <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-dashed border-t border-stone-400 inline-block"></span> Highway I-25 / Route 50</div>
          <div className="flex items-center gap-1"><span className="w-3 h-2 bg-emerald-100 border border-emerald-300 inline-block"></span> Parks & Forests</div>
        </div>

        {/* Outer Bounds and Roads Vector Canvas */}
        <svg viewBox="0 0 800 500" className="w-full h-full max-h-[80px] sm:max-h-none" style={{ background: "#f5f5f4" }}>
          {/* Grids */}
          <g stroke="#e7e5e4" strokeWidth="0.5">
            <line x1="100" y1="0" x2="100" y2="500" />
            <line x1="200" y1="0" x2="200" y2="500" />
            <line x1="300" y1="0" x2="300" y2="500" />
            <line x1="400" y1="0" x2="400" y2="500" />
            <line x1="500" y1="0" x2="500" y2="500" />
            <line x1="600" y1="0" x2="600" y2="500" />
            <line x1="700" y1="0" x2="700" y2="500" />

            <line x1="0" y1="100" x2="800" y2="100" />
            <line x1="0" y1="200" x2="800" y2="200" />
            <line x1="0" y1="300" x2="800" y2="300" />
            <line x1="0" y1="400" x2="800" y2="400" />
          </g>

          {/* Lake Pueblo State Park (West) */}
          <path d="M 0 180 Q 25 150, 40 170 T 80 190 T 120 180 T 130 200 T 90 220 T 40 230 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1.5" />
          <text x="50" y="200" fill="#0369a1" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Lake Pueblo</text>

          {/* Arkansas River flowing Eastward from Lake Pueblo */}
          <path d="M 125 190 Q 200 185, 270 210 T 360 212 T 420 220 T 520 250 T 600 240 T 700 245 T 800 238" fill="none" stroke="#7dd3fc" strokeWidth="6" />
          <path d="M 125 190 Q 200 185, 270 210 T 360 212 T 420 220 T 520 250 T 600 240 T 700 245 T 800 238" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="2,2" />
          <text x="210" y="205" fill="#1e3a8a" fontSize="9" transform="rotate(3 210 205)" fontWeight="medium">Arkansas River</text>

          {/* Historic Riverwalk Channel loop Downtown */}
          <path d="M 405 218 Q 418 200, 430 218 T 445 220" fill="none" stroke="#93c5fd" strokeWidth="3" />
          <text x="408" y="196" fill="#1e3a8a" fontSize="8" fontWeight="bold">Riverwalk</text>

          {/* Minnequa Lake (South Bessemer Side) */}
          <ellipse cx="400" cy="380" rx="40" ry="22" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1" />
          <text x="372" y="382" fill="#0369a1" fontSize="8" fontWeight="medium">Lake Minnequa</text>

          {/* Parks & Fairgrounds Areas */}
          {/* City Park (West) */}
          <rect x="250" y="230" width="60" height="40" rx="5" fill="#d1fae5" stroke="#a7f3d0" strokeWidth="1" />
          <text x="260" y="254" fill="#065f46" fontSize="8">City Park</text>

          {/* State Fairgrounds */}
          <rect x="330" y="320" width="50" height="40" rx="3" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1" />
          <text x="334" y="344" fill="#065f46" fontSize="8" fontWeight="bold">Fairgrounds</text>

          {/* Roads: Interstate I-25 (North-South Center) */}
          <path d="M 450 0 L 450 180 Q 450 250, 460 280 L 470 500" fill="none" stroke="#d6d3d1" strokeWidth="8" />
          <path d="M 450 0 L 450 180 Q 450 250, 460 280 L 470 500" fill="none" stroke="#78716c" strokeWidth="0.75" strokeDasharray="5,5" />
          <text x="455" y="40" fill="#44403c" fontSize="9" fontWeight="bold" transform="rotate(90 455 40)">INTERSTATE 25</text>

          {/* Roads: Highway 50 (East-West Northside) */}
          <path d="M 0 110 L 800 110" fill="none" stroke="#d6d3d1" strokeWidth="6" />
          <path d="M 0 110 L 800 110" fill="none" stroke="#78716c" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x="680" y="104" fill="#44403c" fontSize="8" fontWeight="bold">HWY 50</text>

          {/* Roads: Route 45 Pueblo Blvd (Loop West Side) */}
          <path d="M 220 0 L 220 180 Q 215 300, 230 420 Q 240 470, 290 500" fill="none" stroke="#e7e5e4" strokeWidth="4" />
          <text x="225" y="140" fill="#57534e" fontSize="7" transform="rotate(90 225 140)">Pueblo Blvd</text>

          {/* Neighborhood Region Labels (Styled text overlay) */}
          <text x="110" y="80" fill="#78716c" fontSize="14" fontWeight="bold" letterSpacing="2" className="opacity-40">PUEBLO WEST</text>
          <text x="330" y="90" fill="#78716c" fontSize="13" fontWeight="bold" letterSpacing="1" className="opacity-40">NORTH SIDE</text>
          <text x="360" y="160" fill="#78716c" fontSize="11" fontWeight="bold" letterSpacing="1" className="opacity-45">DOWNTOWN</text>
          <text x="560" y="165" fill="#78716c" fontSize="13" fontWeight="bold" letterSpacing="1" className="opacity-40">BELMONT</text>
          <text x="520" y="320" fill="#78716c" fontSize="13" fontWeight="bold" letterSpacing="2" className="opacity-40">EAST SIDE</text>
          <text x="560" y="440" fill="#a8a29e" fontSize="12" fontWeight="bold" letterSpacing="2" className="opacity-30">SALT CREEK</text>
          <text x="375" y="445" fill="#78716c" fontSize="14" fontWeight="bold" letterSpacing="2" className="opacity-45">BESSEMER</text>
          <text x="730" y="300" fill="#b45309" fontSize="14" fontWeight="bold" letterSpacing="3" className="opacity-35" transform="rotate(15 730 300)">MESA</text>

          {/* EVRAZ Minnequa Steel works icon silhouette on southern part */}
          <rect x="420" y="415" width="45" height="30" fill="#a8a29e" className="opacity-25" />
          <polygon points="420,415 425,410 435,410 435,415" fill="#a8a29e" className="opacity-25" />
          <polygon points="435,415 440,405 450,405 450,415" fill="#a8a29e" className="opacity-25" />
          <line x1="428" y1="410" x2="428" y2="395" stroke="#78716c" strokeWidth="1.5" className="opacity-25" />
          <line x1="444" y1="405" x2="444" y2="390" stroke="#78716c" strokeWidth="1.5" className="opacity-25" />
          <text x="410" y="455" fill="#78716c" fontSize="7" fontWeight="bold" className="opacity-40">Minnequa Steel Works</text>

        </svg>

        {/* Dynamic Pins Rendered directly over the relative div */}
        {filteredPins.map((pin) => {
          const scaled = scaleCoords(pin.lat, pin.lng);
          return (
            <button
              key={pin.id}
              onClick={() => onSelectPin(pin.type, pin.rawItem)}
              onMouseEnter={() =>
                setHoveredPin({ id: pin.id, name: pin.title, category: pin.description, x: scaled.x, y: scaled.y })
              }
              onMouseLeave={() => setHoveredPin(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-1 rounded-full border-2 shadow-md transition-all scale-100 hover:scale-125 hover:z-30 cursor-pointer ${pin.color}`}
              style={{
                left: `${(scaled.x / 800) * 100}%`,
                top: `${(scaled.y / 500) * 100}%`,
              }}
              id={`map-pin-${pin.id}`}
            >
              {pin.type === "event" ? (
                <div className="w-4 h-4 text-purple-700 block text-center leading-none text-[10px] font-bold">🎉</div>
              ) : pin.type === "business" ? (
                <div className="w-4 h-4 text-red-700 block text-center leading-none text-[10px] font-bold">🍔</div>
              ) : pin.type === "lost_found" ? (
                <div className="w-4 h-4 text-amber-700 block text-center leading-none text-[10px] font-bold">🐕</div>
              ) : pin.type === "alert" ? (
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
              ) : (
                <Briefcase className="w-3.5 h-3.5" />
              )}
            </button>
          );
        })}

        {/* Quick tooltip on Pin Hover */}
        {hoveredPin && (
          <div
            className="absolute bg-stone-900 border border-stone-750 text-white p-2 rounded shadow-xl text-left pointer-events-none z-40 max-w-[180px] text-xs font-sans"
            style={{
              left: `${Math.min(90, Math.max(10, (hoveredPin.x / 800) * 100))}%`,
              top: `${Math.min(90, Math.max(5, (hoveredPin.y / 500) * 100 - 15))}%`,
              transform: "translate(-50%, -100%)",
            }}
            id="map-pin-tooltip"
          >
            <div className="font-bold text-[11px] truncate leading-tight mb-0.5">{hoveredPin.name}</div>
            <div className="text-[9px] text-stone-300 font-mono italic">{hoveredPin.category}</div>
          </div>
        )}
      </div>

      <div className="p-2 sm:p-3 bg-stone-50 border-t border-stone-200 text-center select-none flex justify-between items-center text-[10.5px] text-stone-500">
        <span className="flex items-center gap-1">
          <Footprints className="w-3.5 h-3.5 text-stone-400" />
          Click on any marker to open details/actions.
        </span>
        <span className="font-semibold text-stone-600">Pueblo & Pueblo County</span>
      </div>
    </div>
  );
}
