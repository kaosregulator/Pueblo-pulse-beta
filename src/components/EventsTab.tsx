import React, { useState } from "react";
import { Search, Calendar, MapPin, Share2, Heart, CheckCircle, Info, Download, AlertCircle, Trash2 } from "lucide-react";
import { EventItem, EventCategory, NeighborhoodID } from "../types";

interface EventsTabProps {
  events: EventItem[];
  userEmail: string;
  onSelectEvent: (type: string, item: any) => void;
  onToggleRsvp: (eventId: string) => void;
  userRole?: string;
  onDeleteDoc?: (collectionName: string, id: string) => void;
}

const CATEGORIES: EventCategory[] = [
  "Community Events",
  "Festivals",
  "Concerts",
  "Farmers Markets",
  "School Events",
  "Church Events",
  "Sports",
  "Car Shows",
  "Gaming Events",
  "Fundraisers",
];

export default function EventsTab({
  events,
  userEmail,
  onSelectEvent,
  onToggleRsvp,
  userRole,
  onDeleteDoc,
}: EventsTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [calendarAlert, setCalendarAlert] = useState<string | null>(null);

  const handleToggleSave = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleAddToCalendar = (evt: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarAlert(evt.title);
    setTimeout(() => {
      setCalendarAlert(null);
    }, 3500);
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || ev.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4" id="events-tab-root">
      {/* Calendar addition notification */}
      {calendarAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-700 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-xs flex items-center gap-2 max-w-[280px] animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold">Sync Dispatched!</div>
            <div className="text-[10px] text-stone-300">'{calendarAlert}' successfully bound to your Google Calendar.</div>
          </div>
        </div>
      )}

      {/* Hero promo container for main event - Chile Festival */}
      <div className="bg-gradient-to-br from-amber-700 via-orange-850 to-red-950 text-white rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
        <div className="absolute top-0 right-0 p-3 bg-red-600/35 text-[10px] font-bold uppercase rounded-bl-xl font-mono leading-none border-l border-b border-white/10 z-10">
          🔥 Spotlight Event
        </div>
        <div className="space-y-1 max-w-[80vw]">
          <span className="text-[9.5px] font-mono uppercase bg-amber-500/25 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold block w-fit">
            32nd Annual Festival
          </span>
          <h3 className="font-sans font-bold text-sm tracking-tight">Pueblo Chile & Frijoles Festival</h3>
          <p className="text-[10.5px] text-orange-100 leading-snug">
            Join 100,000 neighbors roasting Mirasol chiles, dancing to live country bands, and enjoying Pueblo crafts. Sept 18.
          </p>
        </div>
        <button
          onClick={() => {
            const chileEvent = events.find((e) => e.id === "chile_fest_2026");
            if (chileEvent) onSelectEvent("event", chileEvent);
          }}
          className="mt-3 bg-white text-orange-950 font-sans font-bold text-[10.5px] py-1.5 px-3.5 rounded-lg w-fit shadow-xs hover:bg-orange-50 transition-all cursor-pointer"
        >
          Explore Festival Details
        </button>
      </div>

      {/* Events Search and Select Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 w-4.5 h-4.5 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chiles, concerts, fairs, and sports..."
          className="w-full bg-white border border-stone-250 focus:border-stone-400 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none placeholder-stone-450"
          id="event-search-input"
        />
      </div>

      {/* Horizontal categories grid */}
      <div className="space-y-1">
        <label className="text-[10.5px] text-stone-500 font-bold uppercase px-1">Filter Categories</label>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar justify-center">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 text-xs shrink-0 rounded-full transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-stone-900 text-white font-semibold"
                : "bg-stone-150 text-stone-700 hover:bg-stone-200"
            }`}
            id="cat-pill-all"
          >
            All Events
          </button>
          {CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs shrink-0 rounded-full transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-purple-750 text-white font-semibold"
                  : "bg-stone-150 text-stone-700 hover:bg-stone-200"
              }`}
              id={`cat-pill-${idx}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Listings */}
      <div className="space-y-3" id="events-grid-timeline">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 bg-white border border-stone-200 rounded-xl">
            <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p className="text-stone-400 text-xs font-sans">No activity yet. Be the first to contribute.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const hasRsvped = evt.rsvps.includes(userEmail);
            const isSaved = savedEvents.includes(evt.id);
            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent("event", evt)}
                className="bg-white border border-stone-200 hover:border-purple-300 rounded-xl overflow-hidden shadow-3xs cursor-pointer hover:shadow-2xs transition-all flex flex-col sm:flex-row hover:-translate-y-[1px]"
                id={`event-card-${evt.id}`}
              >
                {/* Lateral Thumbnail image */}
                <div className="sm:w-32 h-24 shrink-0 relative bg-stone-100">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-stone-800 shadow-2xs font-mono uppercase">
                    {evt.category}
                  </div>
                </div>

                {/* Event details summary */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-sans font-bold text-xs text-stone-900 leading-tight">
                        {evt.title}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {onDeleteDoc && userRole && ["Super Admin", "City Administrator", "Administrator", "City Moderator"].includes(userRole) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`🗑️ Are you sure you want to delete this event: "${evt.title}"?`)) {
                                onDeleteDoc("events", evt.id);
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {/* Heart action flag */}
                        <button
                          onClick={(e) => handleToggleSave(evt.id, e)}
                          className="p-1 text-stone-400 hover:text-red-500 rounded transition-all cursor-pointer"
                          id={`btn-save-event-${evt.id}`}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? "text-red-500 fill-red-100" : ""}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-stone-500 text-[10.5px] leading-snug font-sans line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  {/* Date, Location and RSVP elements */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 text-[10px] text-stone-400 font-sans">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-300" />
                      <span className="font-semibold text-stone-600">{evt.date} • {evt.time}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-300" />
                      <span className="font-semibold text-stone-600 uppercase truncate max-w-[100px]">
                        {evt.neighborhood.replace("_", " ")}
                      </span>
                    </div>

                    {/* Interactive RSVP button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleRsvp(evt.id);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[9.5px] font-sans font-bold transition-all cursor-pointer ${
                          hasRsvped
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-250 hover:bg-emerald-100"
                            : "bg-stone-900 text-white hover:bg-stone-850"
                        }`}
                        id={`btn-rsvp-${evt.id}`}
                      >
                        {hasRsvped ? "✓ RSVP Attending" : "Get Free RSVP"}
                      </button>

                      {/* Add to calendar button */}
                      <button
                        onClick={(e) => handleAddToCalendar(evt, e)}
                        title="Add to Google Calendar"
                        className="p-1 bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-600 border border-stone-200 rounded cursor-pointer"
                        id={`btn-add-calendar-${evt.id}`}
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }))}
      </div>
    </div>
  );
}
