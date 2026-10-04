import React, { useState } from "react";
import { Sliders, MapPin, Compass, Tag, Calendar, AlertTriangle, MessageSquare, Briefcase, Utensils, AlertCircle, Bookmark } from "lucide-react";
import { NeighborhoodID, EventItem, BusinessItem, LostFoundItem, SafetyAlert, ForumPost } from "../types";

interface NearMeProps {
  events: EventItem[];
  businesses: BusinessItem[];
  lostFound: LostFoundItem[];
  alerts: SafetyAlert[];
  posts: ForumPost[];
  onSelectPin: (type: string, item: any) => void;
}

// Approximate Latitude/Longitude coordinates representing center nodes of each Pueblo neighborhood:
const HOOD_COORDS: Record<NeighborhoodID, { lat: number; lng: number }> = {
  downtown: { lat: 38.2678, lng: -104.6111 },
  union_district: { lat: 38.2652, lng: -104.6105 },
  riverwalk: { lat: 38.2671, lng: -104.6101 },
  bessemer: { lat: 38.2411, lng: -104.6205 },
  pueblo_west: { lat: 38.3121, lng: -104.7188 },
  mesa: { lat: 38.2541, lng: -104.4985 },
  belmont: { lat: 38.2912, lng: -104.5788 },
  mesa_junction: { lat: 38.2592, lng: -104.6189 },
  state_fair: { lat: 38.2515, lng: -104.6366 },
  north_side: { lat: 38.2950, lng: -104.6120 },
  south_side: { lat: 38.2390, lng: -104.6210 },
  east_side: { lat: 38.2650, lng: -104.5810 },
  west_side: { lat: 38.2750, lng: -104.6420 },
  grove: { lat: 38.2610, lng: -104.5990 },
  eilers: { lat: 38.2490, lng: -104.6090 },
  goat_hill: { lat: 38.2820, lng: -104.6220 },
  aberdeen: { lat: 38.2580, lng: -104.6390 },
  walking_stick: { lat: 38.3090, lng: -104.5820 },
  university: { lat: 38.3030, lng: -104.5790 },
  salt_creek: { lat: 38.2280, lng: -104.5510 },
  sunset: { lat: 38.2480, lng: -104.6490 }
};

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 69;
  const dLng = (lng2 - lng1) * 54.15;
  return parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1));
}

export default function NearMe({
  events,
  businesses,
  lostFound,
  alerts,
  posts,
  onSelectPin,
}: NearMeProps) {
  const [selectedHomeBase, setSelectedHomeBase] = useState<NeighborhoodID>("downtown");
  const [radiusSlider, setRadiusSlider] = useState<number>(5); // default 5 miles
  const [countyWide, setCountyWide] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | "post" | "event" | "deal" | "lost" | "alert" | "business">("all");

  const homeCoords = HOOD_COORDS[selectedHomeBase] || HOOD_COORDS.downtown;

  // Compile spatial items dynamically:
  const items: Array<{
    id: string;
    type: "post" | "event" | "deal" | "lost" | "alert" | "business";
    title: string;
    subtitle: string;
    desc: string;
    distance: number;
    neighborhood: NeighborhoodID;
    raw: any;
  }> = [];

  // 1. Posts Near Me
  posts.forEach((pst) => {
    const itemCoords = HOOD_COORDS[pst.neighborhood] || { lat: 38.2678, lng: -104.6111 };
    const dist = calculateDistance(homeCoords.lat, homeCoords.lng, itemCoords.lat, itemCoords.lng);
    items.push({
      id: `p-${pst.id}`,
      type: "post",
      title: pst.title,
      subtitle: `💬 Community Post • ${pst.postType || "Discussion"}`,
      desc: pst.content,
      distance: dist,
      neighborhood: pst.neighborhood,
      raw: pst,
    });
  });

  // 2. Events Near Me
  events.forEach((ev) => {
    const itemCoords = HOOD_COORDS[ev.neighborhood] || { lat: ev.lat, lng: ev.lng };
    const dist = calculateDistance(homeCoords.lat, homeCoords.lng, itemCoords.lat, itemCoords.lng);
    items.push({
      id: `ev-${ev.id}`,
      type: "event",
      title: ev.title,
      subtitle: `🎉 Native Event • ${ev.category}`,
      desc: ev.description,
      distance: dist,
      neighborhood: ev.neighborhood,
      raw: ev,
    });
  });

  // 3. Food Deals Near Me
  businesses.forEach((bz) => {
    if (bz.coupons && bz.coupons.length > 0) {
      const itemCoords = HOOD_COORDS[bz.neighborhood] || { lat: bz.lat, lng: bz.lng };
      const dist = calculateDistance(homeCoords.lat, homeCoords.lng, itemCoords.lat, itemCoords.lng);
      bz.coupons.forEach((cp) => {
        items.push({
          id: `cp-${cp.id}`,
          type: "deal",
          title: `${bz.name} Specials: ${cp.title}`,
          subtitle: `🍔 Food Deal • Coupon Code: ${cp.code}`,
          desc: cp.description,
          distance: dist,
          neighborhood: bz.neighborhood,
          raw: bz,
        });
      });
    }
  });

  // 4. Lost Pets Near Me
  lostFound.forEach((lf) => {
    const itemCoords = HOOD_COORDS[lf.neighborhood] || { lat: lf.lat, lng: lf.lng };
    const dist = calculateDistance(homeCoords.lat, homeCoords.lng, itemCoords.lat, itemCoords.lng);
    items.push({
      id: `lf-${lf.id}`,
      type: "lost",
      title: `${lf.type}: ${lf.title}`,
      subtitle: `🐕 Lost & Found Alert • Contact: ${lf.contact}`,
      desc: lf.description,
      distance: dist,
      neighborhood: lf.neighborhood,
      raw: lf,
    });
  });

  // 5. Road Alerts Near Me
  alerts.forEach((alt) => {
    const targetHood = alt.neighborhood || "downtown";
    const itemCoords = HOOD_COORDS[targetHood] || HOOD_COORDS.downtown;
    const dist = calculateDistance(homeCoords.lat, homeCoords.lng, itemCoords.lat, itemCoords.lng);
    items.push({
      id: `al-${alt.id}`,
      type: "alert",
      title: alt.title,
      subtitle: `🚧 Road Issue & Alert • Level: ${alt.level}`,
      desc: alt.content,
      distance: dist,
      neighborhood: targetHood,
      raw: alt,
    });
  });

  // 6. Businesses Near Me
  businesses.forEach((bz) => {
    const itemCoords = HOOD_COORDS[bz.neighborhood] || { lat: bz.lat, lng: bz.lng };
    const dist = calculateDistance(homeCoords.lat, homeCoords.lng, itemCoords.lat, itemCoords.lng);
    items.push({
      id: `bz-${bz.id}`,
      type: "business",
      title: bz.name,
      subtitle: `🏪 Business listing • ${bz.category} (${bz.tier})`,
      desc: bz.description,
      distance: dist,
      neighborhood: bz.neighborhood,
      raw: bz,
    });
  });

  // Filter items out based on distances and type selections
  const filteredNearby = items
    .filter((item) => {
      // Proximity limit
      const matchesDistance = countyWide || item.distance <= radiusSlider;
      // Category limit
      const matchesCategory = activeCategoryFilter === "all" || item.type === activeCategoryFilter;
      return matchesDistance && matchesCategory;
    })
    .sort((a, b) => a.distance - b.distance); // closest first

  return (
    <div className="space-y-6" id="near-me-root">
      
      {/* Map Radar Base Controller */}
      <div className="bg-white border border-stone-250 rounded-2xl p-4 shadow-3xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Compass className="w-5 h-5 text-orange-700 animate-spin-slow" />
          <div>
            <h4 className="font-sans font-bold text-xs text-stone-900 leading-none">Pueblo Local Proximity Radar</h4>
            <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">Filter local network within specific radii</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Base Position */}
          <div>
            <label className="block text-[10px] text-stone-500 font-bold mb-1 uppercase font-mono">My Current Base</label>
            <select
              value={selectedHomeBase}
              onChange={(e) => {
                setSelectedHomeBase(e.target.value as NeighborhoodID);
                setCountyWide(false);
              }}
              className="w-full bg-stone-50 border border-stone-250 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-stone-400 font-bold"
            >
              <optgroup label="Core Major Areas">
                <option value="downtown">📍 Downtown core</option>
                <option value="pueblo_west">📍 Pueblo West suburb</option>
                <option value="north_side">📍 North Side</option>
                <option value="south_side">📍 South Side</option>
                <option value="east_side">📍 East Side</option>
                <option value="west_side">📍 West Side</option>
                <option value="mesa">📍 Mesa Farm Lands</option>
              </optgroup>
              <optgroup label="Historic Districts">
                <option value="bessemer">📍 Bessemer (CF&I Steelworks)</option>
                <option value="belmont">📍 Belmont (CSU Campus)</option>
                <option value="mesa_junction">📍 Mesa Junction</option>
                <option value="riverwalk">📍 Historic Riverwalk</option>
                <option value="union_district">📍 Union Avenue district</option>
                <option value="university">📍 CSU University area</option>
                <option value="walking_stick">📍 Walking Stick</option>
              </optgroup>
            </select>
          </div>

          {/* Quick Distance Selector buttons */}
          <div>
            <label className="block text-[10px] text-stone-500 font-bold mb-1 uppercase font-mono">Distance Radius</label>
            <div className="grid grid-cols-5 gap-1">
              {[1, 5, 10, 25].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => {
                    setRadiusSlider(dist);
                    setCountyWide(false);
                  }}
                  className={`py-2 text-[10.5px] font-bold border rounded-lg transition-all cursor-pointer ${
                    !countyWide && radiusSlider === dist
                      ? "bg-stone-900 border-stone-900 text-white"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {dist}M
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCountyWide(true)}
                className={`py-2 text-[10.5px] font-bold border rounded-lg transition-all cursor-pointer truncate ${
                  countyWide
                    ? "bg-orange-750 border-orange-750 text-white"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
                title="Entire County Area"
              >
                Cnty
              </button>
            </div>
          </div>
        </div>

        {/* Traditional slide control */}
        {!countyWide && (
          <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            <div className="flex justify-between items-center text-[10px] font-sans">
              <span className="text-stone-500 font-semibold uppercase">Fine-Tune Proximity Radar</span>
              <span className="font-bold text-orange-850 font-mono text-[11px] bg-white border border-stone-200 rounded px-1.5">{radiusSlider} Miles Max</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={radiusSlider}
              onChange={(e) => setRadiusSlider(parseInt(e.target.value))}
              className="w-full accent-orange-700 h-1 text-xs select-none"
            />
          </div>
        )}
      </div>

      {/* Category Tabs for scan results */}
      <div className="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar">
        {[
          { id: "all", label: "🔍 All Proximity", emoji: "📋" },
          { id: "post", label: "Posts Near Me", emoji: "💬" },
          { id: "event", label: "Events Near Me", emoji: "🎉" },
          { id: "deal", label: "Food Deals Near Me", emoji: "🍔" },
          { id: "lost", label: "Lost Pets Near Me", emoji: "🐕" },
          { id: "alert", label: "Road Alerts Near Me", emoji: "🚧" },
          { id: "business", label: "Businesses Near Me", emoji: "🏪" }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryFilter(cat.id as any)}
            className={`px-3 py-1.5 text-[11px] font-semibold rounded-full shrink-0 flex items-center gap-1.5 transition-all scroll-smooth cursor-pointer ${
              activeCategoryFilter === cat.id ? "bg-stone-900 text-white shadow-2xs" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Near Me dynamic results container */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1 text-[11px] text-stone-500">
          <span className="font-sans font-bold">Scanning surrounding {countyWide ? "Pueblo County" : `${radiusSlider} mi`}:</span>
          <span className="font-semibold font-mono uppercase text-[10px] bg-stone-100 py-0.5 px-2 rounded-full border border-stone-200">
            {filteredNearby.length} objects synced
          </span>
        </div>

        {filteredNearby.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl space-y-1.5 shadow-3xs p-4">
            <Compass className="w-8 h-8 text-stone-300 mx-auto" />
            <h4 className="font-bold text-xs text-stone-850">Empty scan parameters</h4>
            <p className="text-stone-400 text-[10.5px] leading-relaxed max-w-[280px] mx-auto">
              We couldn't detect any {activeCategoryFilter === "all" ? "items" : activeCategoryFilter + " items"} within {countyWide ? "Pueblo County" : `${radiusSlider} miles`} of {selectedHomeBase.toUpperCase().replace("_", " ")}. Click "Cnty" to explore the whole county!
            </p>
          </div>
        ) : (
          filteredNearby.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPin(item.type === "deal" ? "business" : item.type, item.raw)}
              className="bg-white border border-stone-200 hover:border-orange-600 hover:shadow-2xs p-3.5 rounded-xl cursor-pointer transition-all flex justify-between items-start gap-3 shadow-3xs"
            >
              <div className="space-y-1 flex-1 overflow-hidden">
                <div className="text-[9.5px] font-bold font-mono tracking-wider text-orange-800 uppercase flex items-center gap-1">
                  <span>{item.subtitle}</span>
                </div>
                <h4 className="font-sans font-bold text-xs text-stone-950 truncate leading-tight">{item.title}</h4>
                <p className="text-stone-500 text-[11px] leading-snug line-clamp-2 mt-0.5 font-sans">{item.desc}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 pt-1 flex-wrap">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span className="font-bold text-stone-500 uppercase">{item.neighborhood.replace("_", " ")}</span>
                </div>
              </div>

              {/* Distance circle indicator */}
              <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-900 border border-orange-100 text-[10.5px] font-mono font-bold leading-none">
                  {item.distance} Mi
                </span>
                <span className="text-[8.5px] text-stone-400 leading-none">Away</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
