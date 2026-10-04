import React, { useState } from "react";
import { Dog, Package, Compass, Phone, Plus, Calendar, MapPin, CheckCircle, AlertTriangle, Image as ImageIcon, Trash2 } from "lucide-react";
import { LostFoundItem, LostFoundType, NeighborhoodID } from "../types";

interface LostFoundTabProps {
  lostFound: LostFoundItem[];
  onAddLostFound: (item: LostFoundItem) => void;
  onResolveItem: (itemId: string) => void;
  onUpdatePoints: (p: number) => void;
  onSelectPin: (type: string, item: any) => void;
  userRole?: string;
  onDeleteDoc?: (collectionName: string, id: string) => void;
}

const PRELOADED_IMAGES = [
  { label: "Husky Dog", url: "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=400" },
  { label: "Golden puppy", url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400" },
  { label: "GoPro Camera", url: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&q=80&w=400" },
  { label: "Keychain", url: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400" }
];

export default function LostFoundTab({
  lostFound,
  onAddLostFound,
  onResolveItem,
  onUpdatePoints,
  onSelectPin,
  userRole,
  onDeleteDoc,
}: LostFoundTabProps) {
  const [boardType, setBoardType] = useState<"all" | "pets" | "items">("all");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<LostFoundType>("Lost Pet");
  const [newLocation, setNewLocation] = useState("");
  const [newHood, setNewHood] = useState<NeighborhoodID>("downtown");
  const [newContact, setNewContact] = useState("");
  const [selectedImgUrl, setSelectedImgUrl] = useState(PRELOADED_IMAGES[0].url);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newLocation.trim() || !newContact.trim()) return;

    // Approximate lat/lng coordinates based on neighborhood targets
    let lat = 38.2678;
    let lng = -104.6111;
    if (newHood === "pueblo_west") { lat = 38.3121; lng = -104.7188; }
    if (newHood === "bessemer") { lat = 38.2411; lng = -104.6205; }
    if (newHood === "mesa") { lat = 38.2541; lng = -104.4985; }
    if (newHood === "belmont") { lat = 38.2912; lng = -104.5788; }

    const created: LostFoundItem = {
      id: `lf-${Date.now()}`,
      type: newType,
      title: newTitle,
      description: newDesc,
      date: new Date().toISOString().split("T")[0],
      location: newLocation,
      neighborhood: newHood,
      lat,
      lng,
      contact: newContact,
      image: selectedImgUrl,
      resolved: false,
    };

    onAddLostFound(created);
    onUpdatePoints(35); // +35 reputation points for helpful citizen journalism!
    setShowForm(false);
    setNewTitle("");
    setNewDesc("");
    setNewLocation("");
    setNewContact("");
    alert("📢 Alert published on the map! You have earned +35 reputation points.");
  };

  const filteredLF = lostFound.filter((item) => {
    if (boardType === "all") return true;
    if (boardType === "pets") return item.type === "Lost Pet" || item.type === "Found Pet";
    return item.type === "Missing Item" || item.type === "Found Item";
  });

  return (
    <div className="space-y-4" id="lost-found-tab-root">
      {/* Create New Listing Button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-orange-700 hover:bg-orange-850 text-white font-sans font-medium text-xs py-2 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          id="btn-open-report-lf"
        >
          <Plus className="w-4 h-4" />
          Report Lost/Found Pet or Belonging
        </button>
      ) : (
        <form onSubmit={handleCreateReport} className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-3" id="lf-submission-form">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <h4 className="font-sans font-bold text-xs text-stone-800 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-orange-700" />
              Publish Advisory
            </h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-stone-400 hover:text-stone-600 text-[11px] font-sans font-semibold cursor-pointer"
              id="btn-cancel-report-lf"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Report Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as LostFoundType)}
                className="w-full bg-stone-50 border border-stone-250 rounded px-2 py-1 focus:outline-none focus:border-orange-650"
              >
                <option value="Lost Pet">🐕 Lost Pet / Animal</option>
                <option value="Found Pet">🐱 Found Companion</option>
                <option value="Missing Item">🎒 Missing Belonging</option>
                <option value="Found Item">🔑 Found Object</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">District Area</label>
              <select
                value={newHood}
                onChange={(e) => setNewHood(e.target.value as NeighborhoodID)}
                className="w-full bg-stone-50 border border-stone-250 rounded px-2 py-1 focus:outline-none focus:border-orange-650"
              >
                <option value="downtown">Downtown Pueblo</option>
                <option value="bessemer">Bessemer</option>
                <option value="pueblo_west">Pueblo West</option>
                <option value="mesa">Mesa Area</option>
                <option value="belmont">Belmont</option>
                <option value="union_district">Union District</option>
                <option value="riverwalk">Riverwalk</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Subject Heading</label>
            <input
              type="text"
              placeholder="e.g. Lost Husky near the canal"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-650"
              maxLength={60}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Description & Characteristics</label>
            <textarea
              placeholder="Describe color coats, collars, microchips or serial codes..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-16 bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-650 resize-none"
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Specific Location details</label>
              <input
                type="text"
                placeholder="e.g. Lane 24, near gas station"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-stone-50 border border-stone-250 rounded px-2 py-1 focus:outline-none focus:border-orange-650"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Contact Call/Text</label>
              <input
                type="text"
                placeholder="e.g. Patty (719) 555-1234"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                className="w-full bg-stone-50 border border-stone-250 rounded px-2 py-1 focus:outline-none focus:border-orange-650"
                required
              />
            </div>
          </div>

          {/* Select visual representation */}
          <div>
            <label className="block text-[10px] text-stone-500 font-semibold mb-1 uppercase tracking-wide">
              Select Visual Asset
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar justify-center">
              {PRELOADED_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImgUrl(img.url)}
                  className={`flex flex-col items-center shrink-0 border rounded-lg p-1 transition-all cursor-pointer ${
                    selectedImgUrl === img.url ? "border-orange-600 bg-orange-50/50" : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <img src={img.url} className="w-10 h-10 object-cover rounded-md" alt={img.label} />
                  <span className="text-[8.5px] text-stone-600 mt-1 font-medium">{img.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 text-white font-sans font-semibold text-xs py-1.5 rounded hover:bg-stone-850 transition-all cursor-pointer"
            id="btn-publish-lf"
          >
            Dispatch Listing (+35 Guides Points)
          </button>
        </form>
      )}

      {/* Board filter categories */}
      <div className="flex gap-1.5 justify-center">
        <button
          onClick={() => setBoardType("all")}
          className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
            boardType === "all" ? "bg-stone-900 text-white font-semibold" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="btn-lf-filter-all"
        >
          🗂️ All Advisories
        </button>
        <button
          onClick={() => setBoardType("pets")}
          className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer flex items-center gap-1 ${
            boardType === "pets" ? "bg-amber-600 text-white font-semibold" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="btn-lf-filter-pets"
        >
          <Dog className="w-3.5 h-3.5" />
          Lost Pets Board
        </button>
        <button
          onClick={() => setBoardType("items")}
          className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer flex items-center gap-1 ${
            boardType === "items" ? "bg-amber-800 text-white font-semibold" : "bg-stone-150 text-stone-700 hover:bg-stone-200"
          }`}
          id="btn-lf-filter-items"
        >
          <Package className="w-3.5 h-3.5" />
          Missing Items
        </button>
      </div>

      {/* Listings Grid Output */}
      <div className="grid grid-cols-1 gap-3.5" id="lost-found-items-list border-stone-200-grid">
        {filteredLF.length === 0 ? (
          <div className="text-center py-10 bg-white border border-stone-200 rounded-xl">
            <Dog className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p className="text-stone-400 text-xs font-sans">No activity yet. Be the first to contribute.</p>
          </div>
        ) : (
          filteredLF.map((item) => {
            return (
              <div
              key={item.id}
              onClick={() => onSelectPin("lost_found", item)}
              className={`bg-white border rounded-xl overflow-hidden shadow-3xs cursor-pointer hover:shadow-2xs transition-all hover:bg-stone-50/20 flex ${
                item.resolved ? "opacity-60 border-stone-200 bg-stone-50" : "border-stone-200"
              }`}
              id={`lf-item-card-${item.id}`}
            >
              {/* Pet Image Thumbnail */}
              <div className="w-24 h-24 shrink-0 relative bg-stone-100">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {item.resolved && (
                  <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                    <span className="bg-emerald-600 text-white text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded shadow">
                      Resolved ✓
                    </span>
                  </div>
                )}
              </div>

              {/* Central descriptors */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5 min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[8.5px] font-mono leading-none tracking-wider text-amber-800 font-bold uppercase block">
                      {item.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onDeleteDoc && userRole && ["Super Admin", "City Administrator", "Administrator", "City Moderator"].includes(userRole) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`🗑️ Are you sure you want to delete this lost & found entry: "${item.title}"?`)) {
                              onDeleteDoc("lostFound", item.id);
                            }
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="text-[9.5px] font-sans text-stone-400">{item.date}</span>
                    </div>
                  </div>
                  <h4 className="font-sans font-bold text-xs text-stone-900 leading-tight mt-0.5 truncate">
                    {item.title}
                  </h4>
                  <p className="text-stone-500 text-[10.52px] leading-relaxed line-clamp-2 mt-0.5 font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="flex justify-between items-center pt-1.5 border-t border-stone-100 text-[9.5px] text-stone-400 font-sans mt-auto">
                  <div className="flex items-center gap-0.5 select-none truncate max-w-[120px]">
                    <MapPin className="w-3.5 h-3.5 text-stone-300" />
                    <span className="font-semibold text-stone-500 uppercase">{item.neighborhood.replace("_", " ")}</span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto text-stone-600 font-semibold">
                    <Phone className="w-3 h-3 text-stone-350" />
                    <span className="truncate">{item.contact.split(" - ")[1] || item.contact}</span>
                  </div>

                  {!item.resolved && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolveItem(item.id);
                        onUpdatePoints(20); // Get points for solving!
                      }}
                      className="ml-2 bg-stone-900 text-white font-bold px-2 py-0.5 rounded text-[8.5px] hover:bg-stone-850 cursor-pointer text-center block"
                      id={`btn-resolve-${item.id}`}
                    >
                      Refind!
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
