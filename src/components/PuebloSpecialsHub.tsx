import React, { useState } from "react";
import { Flame, MapPin, Truck, Calendar, Store, Plus, Search, Check, ThumbsUp, Map, Star } from "lucide-react";
import MediaUploader from "./MediaUploader";

export interface SpecialItem {
  id: string;
  type: "chile" | "food_truck" | "farmers_market" | "deal" | "seasonal_event";
  title: string;
  vendorName: string;
  location: string;
  description: string;
  price?: string;
  rating: number;
  featured?: boolean;
  imageUrl?: string;
  submittedBy?: string;
  helpfulVotes: number;
  helpfulUsers: string[]; // email/ids list
}

const INITIAL_SPECIALS: SpecialItem[] = [
  {
    id: "spec-1",
    type: "chile",
    title: "Fresh Fire-Roasted Mira Sol Green Chiles",
    vendorName: "Milberger Farms (Mesa Lane 36)",
    location: "28570 US-50, Pueblo, CO",
    description: "Our signature high-heat, thick-fleshed Pueblo Mira Sol Chiles roasted on-site in rotating steel barrels. Sold by the bushel, half-bushel, or small paper sacks.",
    price: "$45.00 / Bushel",
    rating: 4.8,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
    submittedBy: "Pete Giadone",
    helpfulVotes: 24,
    helpfulUsers: []
  },
  {
    id: "spec-2",
    type: "deal",
    title: "The Original Slopper Combo Thursday",
    vendorName: "Coors Tavern (Bessemer)",
    location: "515 W 4th St, Pueblo, CO",
    description: "Get the legendary Open-faced Slopper burger smothered in thick pork green chile cheese dressing with fries and a draft drink for a special community price.",
    price: "$10.50 combo",
    rating: 4.9,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop",
    submittedBy: "christopherosorio7@gmail.com",
    helpfulVotes: 42,
    helpfulUsers: []
  },
  {
    id: "spec-3",
    type: "food_truck",
    title: "Lucio's Street Tacos & Chile Burritos",
    vendorName: "Spicy Cactus Mobile Truck",
    location: "Main Riverwalk Plaza Parking Lot",
    description: "Parked dynamically at the riverwalk. Famous for loaded green chile cheese fries and slow-braised carnitas wrapped in local warm flour tortillas.",
    price: "$3.00 street tacos",
    rating: 4.6,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop",
    submittedBy: "Sarah Jenkins",
    helpfulVotes: 12,
    helpfulUsers: []
  },
  {
    id: "spec-4",
    type: "farmers_market",
    title: "Mesa Saturday Farmers Junction",
    vendorName: "Pueblo Downtown Growers Association",
    location: "Rawlings Library Parking Lot Plaza",
    description: "Every Saturday morning. Local farmers assemble to sell direct-harvested pumpkins, cantaloupes, onions, honey, and corn on the cob.",
    price: "Free Entry",
    rating: 4.7,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&auto=format&fit=crop",
    submittedBy: "Pete Giadone",
    helpfulVotes: 18,
    helpfulUsers: []
  }
];

interface PuebloSpecialsHubProps {
  userProfile: any;
  onIncrementPoints?: (pts: number) => void;
}

export default function PuebloSpecialsHub({ userProfile, onIncrementPoints }: PuebloSpecialsHubProps) {
  const [specials, setSpecials] = useState<SpecialItem[]>(INITIAL_SPECIALS);
  const [activeFilter, setActiveFilter] = useState<"all" | SpecialItem["type"]>("all");
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create deal state
  const [dealTitle, setDealTitle] = useState("");
  const [dealVendor, setDealVendor] = useState("");
  const [dealLocation, setDealLocation] = useState("");
  const [dealDesc, setDealDesc] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [dealType, setDealType] = useState<SpecialItem["type"]>("deal");
  const [dealPhoto, setDealPhoto] = useState<string>("");

  const handleHelpfulVote = (id: string) => {
    setSpecials(prev => prev.map(s => {
      if (s.id === id) {
        const userEmail = userProfile.email || "christopherosorio7@gmail.com";
        const hasVoted = s.helpfulUsers.includes(userEmail);
        const updatedUsers = hasVoted 
          ? s.helpfulUsers.filter(e => e !== userEmail) 
          : [...s.helpfulUsers, userEmail];
        
        return {
          ...s,
          helpfulVotes: hasVoted ? s.helpfulVotes - 1 : s.helpfulVotes + 1,
          helpfulUsers: updatedUsers
        };
      }
      return s;
    }));

    if (onIncrementPoints) {
      onIncrementPoints(2); // point bonus for voting
    }
  };

  const handleAddDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim() || !dealVendor.trim() || !dealDesc.trim()) return;

    const newSpecial: SpecialItem = {
      id: `spec-${Date.now()}`,
      type: dealType,
      title: dealTitle,
      vendorName: dealVendor,
      location: dealLocation,
      description: dealDesc,
      price: dealPrice || undefined,
      rating: 5.0,
      imageUrl: dealPhoto || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
      submittedBy: userProfile.email || "Verified Resident",
      helpfulVotes: 1,
      helpfulUsers: []
    };

    setSpecials([newSpecial, ...specials]);
    setShowAddDealModal(false);

    // Reset deal form
    setDealTitle("");
    setDealVendor("");
    setDealLocation("");
    setDealDesc("");
    setDealPrice("");
    setDealPhoto("");

    if (onIncrementPoints) {
      onIncrementPoints(25); // high rewards for adding local Pueblo specials!
    }
    alert("🔥 Thank you! Your local Green Chile / Restaurant deal has been published live to Pueblo County Pulse!");
  };

  const filteredSpecials = specials.filter(s => {
    const matchesFilter = activeFilter === "all" || s.type === activeFilter;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6" id="pueblo-specials-hub">
      
      {/* Signature local banner */}
      <div className="bg-stone-900 border border-stone-850 rounded-2xl p-5 text-white relative overflow-hidden">
        {/* Dynamic decorative flame background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 opacity-15 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-orange-400 via-yellow-600 to-transparent animate-pulse"></div>

        <div className="space-y-1.5 max-w-xl z-10 relative">
          <span className="bg-orange-700/60 border border-orange-500/50 text-amber-300 font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block">
            🌶️ Local Signature Section
          </span>
          <h2 className="text-lg font-sans font-black tracking-tight leading-tighter flex items-center gap-1.5 text-orange-200">
            Pueblo Green Chile & Specials Hub
          </h2>
          <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
            Your daily digital guide to certified Mira Sol green chiles roasting spots, mobile gourmet food trucks, local Bessemer restaurant promotions, and farmers harvest markets in Pueblo County.
          </p>
        </div>
      </div>

      {/* Filter and search control bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white p-3.5 border border-stone-250 rounded-2xl shadow-3xs">
        
        {/* Type Category selection */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar w-full md:w-auto shrink-0 select-none">
          {[
            { id: "all", name: "All Specials 🌶️", icon: null },
            { id: "chile", name: "Green Chile", icon: <Flame className="w-3 h-3 text-orange-600" /> },
            { id: "food_truck", name: "Food Trucks", icon: <Truck className="w-3 h-3 text-orange-600" /> },
            { id: "farmers_market", name: "Farmers Markets", icon: <Store className="w-3 h-3 text-orange-600" /> },
            { id: "deal", name: "Restaurant Deals", icon: <Store className="w-3 h-3 text-orange-600" /> }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-full border text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                activeFilter === cat.id
                  ? "bg-stone-900 border-stone-900 text-white shadow-3xs"
                  : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600"
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search bar and Publish Deal trigger */}
        <div className="flex gap-2 w-full md:w-auto items-center">
          <input
            type="text"
            placeholder="Search deals, vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border rounded-lg px-2.5 py-1.5 text-xs w-full md:w-48 placeholder-stone-400 text-stone-900 focus:outline-none focus:border-stone-450"
          />
          <button
            type="button"
            onClick={() => setShowAddDealModal(true)}
            className="bg-orange-700 hover:bg-orange-800 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl shrink-0 cursor-pointer flex items-center gap-1.5 uppercase tracking-wide leading-none"
          >
            <Plus className="w-3.5 h-3.5" /> Publish Deal
          </button>
        </div>

      </div>

      {/* Grid List of current deals and specials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSpecials.map((s) => {
          const userEmail = userProfile.email || "christopherosorio7@gmail.com";
          const hasVoted = s.helpfulUsers.includes(userEmail);
          return (
            <div key={s.id} className="bg-white border border-stone-250 rounded-2xl overflow-hidden p-4 flex flex-col md:flex-row gap-4 shadow-3xs hover:border-stone-350 transition-all">
              
              {/* Special Lead Photo */}
              <div className="w-full md:w-32 h-28 shrink-0 rounded-xl overflow-hidden bg-stone-100 border relative">
                <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {s.featured && (
                  <span className="absolute top-1.5 left-1.5 bg-orange-700 text-white text-[7.5px] font-black font-mono px-1 py-0.2 rounded uppercase border border-orange-500 flex items-center gap-0.5">
                    <Flame className="w-2 h-2 text-yellow-350 fill-yellow-300" /> Featured
                  </span>
                )}
              </div>

              {/* Special Info */}
              <div className="flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[8.5px] font-mono uppercase bg-orange-50 border border-orange-100 text-orange-850 px-1.5 py-0.2 rounded-md font-bold tracking-wider">
                      {s.type.replace("_", " ")}
                    </span>
                    <div className="flex items-center text-amber-500 gap-0.5 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" /> {s.rating}
                    </div>
                  </div>

                  <h3 className="font-sans font-black text-xs text-stone-900 leading-snug tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[10px] font-mono text-stone-400 font-bold flex items-center gap-1 leading-none">
                    <Store className="w-3.5 h-3.5 text-stone-400" /> {s.vendorName}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-relaxed font-sans line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-2.5 mt-2 flex-wrap gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9.5px] font-mono text-stone-450 uppercase leading-none">Price/Rate</span>
                    <strong className="text-orange-750 text-xs mt-1 leading-none">{s.price || "Free Entry"}</strong>
                  </div>

                  <div className="flex gap-1.5">
                    {/* Share deal mockup */}
                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(s.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 ${
                        hasVoted
                          ? "bg-amber-100 border-amber-300 text-amber-900"
                          : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600"
                      }`}
                      title="This deal is helpful and active"
                    >
                      <ThumbsUp className="w-3 h-3 text-orange-600" />
                      Helpful ({s.helpfulVotes})
                    </button>
                  </div>
                </div>

              </div>

            </div>
          );
        })}

        {filteredSpecials.length === 0 && (
          <div className="col-span-2 text-center py-10 bg-white border rounded-2xl space-y-1.5">
            <Flame className="w-8 h-8 text-stone-350 mx-auto" />
            <p className="text-xs font-bold text-stone-550">No neighborhood specials match your filters.</p>
            <p className="text-[10px] text-stone-400 font-mono">Try searching different terms or publish a new deal!</p>
          </div>
        )}
      </div>

      {/* Add Deal slide modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-stone-950/85 z-55 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl p-5 shadow-2xl max-w-md w-full overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar space-y-4">
            
            <div className="border-b pb-2">
              <h3 className="font-sans font-black text-sm text-stone-950 uppercase flex items-center gap-1">
                🌶️ Publish Pueblo Special / Deal
              </h3>
              <p className="text-[10.5px] text-stone-400 font-mono">Submit Green Chile roasting, crop deals, or restaurant events</p>
            </div>

            <form onSubmit={handleAddDealSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Type of promotion</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "chile", name: "Green Chile" },
                    { id: "deal", name: "Restaurant Deal" },
                    { id: "food_truck", name: "Food Truck" },
                    { id: "farmers_market", name: "Farmers Markets" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDealType(t.id as any)}
                      className={`p-2 rounded-lg border text-[9.5px] font-bold text-center cursor-pointer transition-all ${
                        dealType === t.id
                          ? "bg-stone-900 border-stone-100 text-white"
                          : "bg-stone-50 hover:bg-stone-100 border-stone-250 text-stone-605"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Promotion Title</label>
                  <input
                    type="text"
                    required
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    placeholder="e.g. Bushel Special / Smothered Burger Offer"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none focus:border-stone-450"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={dealVendor}
                    onChange={(e) => setDealVendor(e.target.value)}
                    placeholder="e.g. DiTomaso Farms / Pass Key restaurant"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Local Address / Location</label>
                  <input
                    type="text"
                    value={dealLocation}
                    onChange={(e) => setDealLocation(e.target.value)}
                    placeholder="e.g. Mesa Lane 35 / Union Ave district"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Price or Discount rate</label>
                  <input
                    type="text"
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value)}
                    placeholder="e.g. $10 combo / 20% off bushels"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Description of Deal</label>
                <textarea
                  required
                  rows={3}
                  value={dealDesc}
                  onChange={(e) => setDealDesc(e.target.value)}
                  placeholder="Tell neighbors what's good, heat level of chiles, or coupon conditions..."
                  className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                />
              </div>

              {/* Attach crop photo */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Attach Deal Photo</label>
                <MediaUploader
                  maxFiles={1}
                  category="specials"
                  onUploadComplete={(urls) => {
                    if (urls.length > 0) {
                      setDealPhoto(urls[0]);
                    }
                  }}
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="bg-stone-100 hover:bg-stone-250 text-stone-700 font-bold px-3.5 py-2 rounded-xl border cursor-pointer border-stone-250 shadow-3xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-700 hover:bg-orange-850 text-white font-extrabold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Publish Deal live (+25 PTS)
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
