import React, { useState } from "react";
import {
  Search,
  Tag,
  MessageSquare,
  Plus,
  Mail,
  ShoppingBag,
  FolderOpen,
  MapPin,
  CheckCircle,
  Gift,
  Award,
  Calendar,
  Layers,
  Heart,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Camera,
  ArrowRight
} from "lucide-react";
import { MarketplaceItem, MarketplaceCategory, NeighborhoodID, ForumPost, EventItem, BusinessItem } from "../types";

interface CommunityTabProps {
  marketplaceItems: MarketplaceItem[];
  onAddMarketplaceItem: (item: MarketplaceItem) => void;
  onUpdatePoints: (p: number) => void;
  onSelectPin: (type: string, item: any) => void;
  posts: ForumPost[];
  events: EventItem[];
  businesses: BusinessItem[];
  userProfile: any;
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
}

const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  "Furniture",
  "Electronics",
  "Vehicles",
  "Gaming",
  "Collectibles",
  "Free Items",
];

// High fidelity metadata registry for all 20 neighborhoods specified in the requirements
interface NeighborhoodMetadata {
  id: string;
  name: string;
  type: "Major" | "Historic";
  moderator: string;
  welcome: string;
  history: string;
  image: string;
}

const NEIGHBORHOODS_DB: NeighborhoodMetadata[] = [
  // Major Areas
  {
    id: "pueblo_west",
    name: "Pueblo West",
    type: "Major",
    moderator: "Elena Milberger",
    welcome: "Welcome to Pueblo West! Colorado's fastest-growing flatlands community with beautiful mountain views.",
    history: "Founded in 1969 by McCulloch Properties, Pueblo West was designed for suburban equestrian lifestyles under deep mountain vistas.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "north_side",
    name: "North Side",
    type: "Major",
    moderator: "Officer Daniel CO",
    welcome: "Welcome to the North Side! Home of classic diners and beautiful tree-lined lanes.",
    history: "Developed during the gold rush era expansions, the North Side stands as a bastion of peaceful residential avenues and legendary pizzerias.",
    image: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "south_side",
    name: "South Side",
    type: "Major",
    moderator: "Sarah Martinez",
    welcome: "South Side Pride! Deeply rooted in Pueblo heritage, and home of the legendary smothered Slopper taverns.",
    history: "Southside grew rapidly in the early 25s, housing workers from the surrounding smelting and transportation channels.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "east_side",
    name: "East Side",
    type: "Major",
    moderator: "Gus Tavern Owner",
    welcome: "East Side Pueblo welcomes you! A tight-knit community of multi-generational local families.",
    history: "The rich industrial East Side became home to immigrant communities who built original brick churches and beloved local bakeries.",
    image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "west_side",
    name: "West Side",
    type: "Major",
    moderator: "Marcus Vance",
    welcome: "West Side Pueblo! Bridging city convenience with immediate gates to Nature Wilds and canyons.",
    history: "Westside serves as the scenic threshold pointing west towards the raw Arkansas River canyon networks and historical toll-roads.",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "downtown",
    name: "Downtown Core",
    type: "Major",
    moderator: "Sarah Martinez",
    welcome: "Our Pueblo Center! Historic buildings, modern arts, Union landmarks and beautiful riverside walkways.",
    history: "Rebuilt with steel and high dikes after the historic 1921 flood, downtown is our resilient commercial and historical capital.",
    image: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "mesa",
    name: "Mesa Farm Area",
    type: "Major",
    moderator: "Elena Milberger",
    welcome: "Welcome to the Mesa! Famously yielding our world-renowned Pueblo green chiles under blazing sun.",
    history: "Rich volcanic soils coupled with master ditch irrigation in the late 1800s developed the Mesa into the crop capital of Southern Colorado.",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400"
  },

  // Historic Areas
  {
    id: "bessemer",
    name: "Bessemer District",
    type: "Historic",
    moderator: "Gus Tavern Owner",
    welcome: "Bessemer Pride! Built around the legendary steel furnaces of the Colorado Fuel and Iron mill.",
    history: "Named for the Bessemer converter steel process, this industrial powerhouse accommodated immigrant workers from 40 nations.",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "belmont",
    name: "Belmont District",
    type: "Historic",
    moderator: "CSU Student Club",
    welcome: "Belmont greetings! A beautiful residential hill housing parks and collegiate student energy.",
    history: "Developed in the post-WWII housing expansions, Belmont represents classic mid-century family neighborhoods.",
    image: "https://images.unsplash.com/photo-1549405187-7ea422e9cb7e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "mesa_junction",
    name: "Mesa Junction",
    type: "Historic",
    moderator: "Marcus Vance",
    welcome: "Mesa Junction! An artistic enclave of historic row-houses, libraries, and local bookstores.",
    history: "Mesa Junction was the key streetcar intersection climbing from downtown, becoming the literary and medical hub of old Pueblo.",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "grove",
    name: "The Grove",
    type: "Historic",
    moderator: "Sarah Martinez",
    welcome: "Welcome to the Grove! One of Pueblo's absolute oldest, most resilient historic neighborhoods.",
    history: "The Grove absorbed early Italian, Slovenian, and Mexican foundry workers, enduring flood lines next to raw railway junctions.",
    image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "eilers",
    name: "Eilers Neighborhood",
    type: "Historic",
    moderator: "Officer Daniel CO",
    welcome: "Welcome to Eilers (Kettle Glow)! Built by early smelter tradesmen next to the riverbanks.",
    history: "Also known as Kettle Glow, Eilers was built around the early 1880 crude copper and iron smelters of Pueblo's dawn.",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "goat_hill",
    name: "Goat Hill",
    type: "Historic",
    moderator: "Marcus Vance",
    welcome: "Goat Hill represents! Outstanding panoramic views overlooking the industrial core of Bessemer.",
    history: "Originally populated by early immigrant miners who kept livestock on the steep slopes overlooking the CF&I mill towers.",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "aberdeen",
    name: "Aberdeen",
    type: "Historic",
    moderator: "Officer Daniel CO",
    welcome: "Aberdeen greetings! Majestic Victorian manses and winding green parks.",
    history: "Built in the late 1890s as the premium garden suburb for executive managers of the Colorado Fuel & Iron works.",
    image: "https://images.unsplash.com/photo-1549405187-7ea422e9cb7e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "walking_stick",
    name: "Walking Stick",
    type: "Historic",
    moderator: "CSU Student Club",
    welcome: "Welcome to Walking Stick! Scenic high-desert paths next to golf links and CSU Pueblo.",
    history: "Developed around modern golf complexes and high-end desert acreage estates in northern Pueblo County.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "university",
    name: "University District",
    type: "Historic",
    moderator: "CSU Student Club",
    welcome: "University Heights! A youthful corridor flanking the Colorado State University Pueblo campus.",
    history: "Established alongside Southern Colorado State College in 1963 to house scholastic researchers and local student tracks.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "state_fair",
    name: "State Fair Area",
    type: "Historic",
    moderator: "Elena Milberger",
    welcome: "Welcome to the Fair district! Home of the legendary Colorado State Fair since 1872.",
    history: "This district comes alive with million-visitor carnivals, agricultural shows, and cultural parades every summer.",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "salt_creek",
    name: "Salt Creek",
    type: "Historic",
    moderator: "Gus Tavern Owner",
    welcome: "Salt Creek welcomes you! Proud, deep-rooted neighborhood legacy in southern Pueblo County.",
    history: "A historically independent farming settlement expanding alongside early rail spurs and livestock pastures.",
    image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "sunset",
    name: "Sunset District",
    type: "Historic",
    moderator: "CSU Student Club",
    welcome: "Sunset residential greetings! Safe, tranquil brick homes and stellar sunset horizons.",
    history: "Sunset was masterplanned in the post-WWII mid-century housing booms for working classes returning from overseas.",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "union_district",
    name: "Union Avenue District",
    type: "Historic",
    moderator: "Sarah Martinez",
    welcome: "Welcome to historic Union! Vintage antique malls, custom galleries, and brick depots from the 1880s.",
    history: "Pueblo's original trade street, home to old red brick hotels and iron depots that survived the Great Flood.",
    image: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "riverwalk",
    name: "Pueblo Riverwalk",
    type: "Historic",
    moderator: "Sarah Martinez",
    welcome: "The heart of Pueblo! Beautiful boat-cruisable river channels reclaiming our historical waterfront.",
    history: "A 32-acre urban waterfront built over the original river basin that caused the 1921 flood, now a central park jewel.",
    image: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=400"
  }
];

export default function CommunityTab({
  marketplaceItems,
  onAddMarketplaceItem,
  onUpdatePoints,
  onSelectPin,
  posts,
  events,
  businesses,
  userProfile,
  setUserProfile,
}: CommunityTabProps) {
  const [activeBoard, setActiveBoard] = useState<"neighborhoods" | "marketplace">("neighborhoods");
  
  // Classifieds states
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<MarketplaceCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<MarketplaceCategory>("Furniture");
  const [newContact, setNewContact] = useState("");
  const [newHood, setNewHood] = useState<NeighborhoodID>("downtown");

  // Neighborhood System states
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodMetadata | null>(null);

  const preloadedClassifiedImages = [
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400", // chair
    "https://images.unsplash.com/photo-1549405187-7ea422e9cb7e?auto=format&fit=crop&q=80&w=400", // wood
    "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400"  // tin safety box
  ];

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim() || !newDesc.trim() || !newContact.trim()) return;

    const randomImg = preloadedClassifiedImages[Math.floor(Math.random() * preloadedClassifiedImages.length)];

    const created: MarketplaceItem = {
      id: `m-${Date.now()}`,
      title: newTitle,
      price: newPrice.startsWith("$") || newPrice.toLowerCase() === "free" ? newPrice : `$${newPrice}`,
      description: newDesc,
      image: randomImg,
      category: newCategory,
      seller: userProfile.name,
      contact: newContact,
      neighborhood: newHood as any,
      date: new Date().toISOString().split("T")[0],
    };

    onAddMarketplaceItem(created);
    onUpdatePoints(25); // Award +25 points for economy trade
    setShowForm(false);
    setNewTitle("");
    setNewPrice("");
    setNewDesc("");
    setNewContact("");
    alert("🛍 Classified advertisement published successfully! +25 Rep points.");
  };

  const handleNeighborhoodFollowToggle = (hoodId: string) => {
    const currentFollowed = userProfile.followedNeighborhoods || [];
    const isFollowing = currentFollowed.includes(hoodId);

    let nextFollowed: string[];
    if (isFollowing) {
      nextFollowed = currentFollowed.filter((id: string) => id !== hoodId);
    } else {
      nextFollowed = [...currentFollowed, hoodId];
    }

    setUserProfile((prev: any) => ({
      ...prev,
      followedNeighborhoods: nextFollowed
    }));
    onUpdatePoints(15);
  };

  const filteredMarketplace = marketplaceItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCat === "all" || item.category === selectedCat;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="community-tab-root">
      
      {/* Board toggle hubs */}
      <div className="flex border border-stone-250 bg-stone-100 rounded-xl p-1 justify-center max-w-md mx-auto">
        <button
          onClick={() => { setActiveBoard("neighborhoods"); setSelectedNeighborhood(null); }}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeBoard === "neighborhoods" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
          }`}
          id="btn-board-neighborhoods"
        >
          <Layers className="w-4 h-4 text-orange-700" />
          Hometown Neighborhoods
        </button>
        <button
          onClick={() => setActiveBoard("marketplace")}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeBoard === "marketplace" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
          }`}
          id="btn-board-marketplace"
        >
          <ShoppingBag className="w-4 h-4 text-orange-700" />
          Hometown Classifieds
        </button>
      </div>

      {/* 1. NEIGHBORHOODS BROWSER PORTAL */}
      {activeBoard === "neighborhoods" && !selectedNeighborhood && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white border p-4 rounded-xl text-stone-900 shadow-3xs space-y-1.5">
            <h4 className="font-sans font-black text-sm text-stone-900 flex items-center gap-1.5">
              <span>🏡</span> Pueblo Neighborhood Clusters
            </h4>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Explore 20 unique communities making up Pueblo and Pueblo County. Browse distinct bulletins, histories, and regional moderator bulletins. Click any card below to open its dedicated portal!
            </p>
          </div>

          {/* Major Areas Section */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-stone-400 block border-b uppercase">Core Major Areas</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {NEIGHBORHOODS_DB.filter(n => n.type === "Major").map((n) => {
                const isFollowing = userProfile.followedNeighborhoods?.includes(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNeighborhood(n)}
                    className="bg-white border rounded-xl overflow-hidden cursor-pointer hover:border-orange-650 hover:shadow-2xs transition-all flex flex-col justify-between h-36 relative"
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNeighborhoodFollowToggle(n.id); }}
                        className="p-1 px-2 text-[8.5px] rounded border font-sans bg-white/95 hover:bg-white text-stone-600 font-bold shadow-3xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Heart className={`w-3 h-3 ${isFollowing ? "text-red-500 fill-red-500" : ""}`} />
                        <span>{isFollowing ? "Followed" : "Follow"}</span>
                      </button>
                    </div>

                    <div className="h-16 relative">
                      <img src={n.image} className="w-full h-full object-cover brightness-90" />
                      <div className="absolute inset-0 bg-stone-950/20"></div>
                    </div>

                    <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                      <h5 className="font-bold text-xs text-stone-900 mt-0.5">{n.name}</h5>
                      <div className="flex justify-between items-center text-[9.5px] text-stone-400 font-sans mt-1">
                        <span className="font-semibold text-[8.5px] uppercase font-mono bg-stone-100 py-0.2 px-1 rounded">MODERATOR: {n.moderator.split(" ")[0]}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historic Districts Section */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-stone-400 block border-b uppercase">Historic Districts</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {NEIGHBORHOODS_DB.filter(n => n.type === "Historic").map((n) => {
                const isFollowing = userProfile.followedNeighborhoods?.includes(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNeighborhood(n)}
                    className="bg-white border rounded-xl overflow-hidden cursor-pointer hover:border-orange-650 hover:shadow-2xs transition-all flex flex-col justify-between h-36 relative"
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNeighborhoodFollowToggle(n.id); }}
                        className="p-1 px-2 text-[8.5px] rounded border font-sans bg-white/95 hover:bg-white text-stone-600 font-bold shadow-3xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Heart className={`w-3 h-3 ${isFollowing ? "text-red-500 fill-red-500" : ""}`} />
                        <span>{isFollowing ? "Followed" : "Follow"}</span>
                      </button>
                    </div>

                    <div className="h-16 relative">
                      <img src={n.image} className="w-full h-full object-cover brightness-95" />
                      <div className="absolute inset-0 bg-stone-950/25"></div>
                    </div>

                    <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                      <h5 className="font-bold text-xs text-stone-900 mt-0.5">{n.name}</h5>
                      <div className="flex justify-between items-center text-[9.5px] text-stone-400 font-sans mt-1">
                        <span className="font-semibold text-[8.5px] uppercase font-mono bg-stone-100 py-0.2 px-1 rounded">MODERATOR: {n.moderator.split(" ")[0]}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* DEDICATED NEIGHBORHOOD DEEP PORTAL VIEW */}
      {activeBoard === "neighborhoods" && selectedNeighborhood && (
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-5 animate-fade-in" id="neighborhood-portal">
          
          <button
            onClick={() => setSelectedNeighborhood(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-sans font-bold flex items-center gap-1 cursor-pointer"
          >
            ← Back to Clusters Board
          </button>

          {/* Banner Hero */}
          <div className="h-44 rounded-2xl overflow-hidden relative border">
            <img src={selectedNeighborhood.image} className="w-full h-full object-cover brightness-75" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-stone-950/0 p-4">
              <span className="bg-orange-700 text-white font-mono text-[9px] font-bold py-0.5 px-2 rounded-full uppercase">
                {selectedNeighborhood.type} Pueblo Neighborhood
              </span>
              <h3 className="font-sans font-black text-white text-md mt-1 leading-none">{selectedNeighborhood.name} Portal</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left side: Metadata summaries */}
            <div className="md:col-span-1 space-y-4">
              {/* Follow controller */}
              <button
                onClick={() => handleNeighborhoodFollowToggle(selectedNeighborhood.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  userProfile.followedNeighborhoods?.includes(selectedNeighborhood.id)
                    ? "bg-stone-900 border-stone-850 text-white"
                    : "bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100"
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>
                  {userProfile.followedNeighborhoods?.includes(selectedNeighborhood.id)
                    ? "★ Neighborhood Bookmarked"
                    : "Follow Neighborhood Channel"}
                </span>
              </button>

              {/* Moderator Greeting badge */}
              <div className="bg-amber-50/50 border border-amber-200 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[10.5px] font-mono font-bold uppercase text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>MODERATOR: {selectedNeighborhood.moderator}</span>
                </div>
                <p className="text-[11px] text-stone-600 italic leading-relaxed">
                  "{selectedNeighborhood.welcome}"
                </p>
              </div>

              {/* History bulletin */}
              <div className="bg-stone-50 border p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[10.5px] font-mono font-bold uppercase text-stone-500">
                  <BookOpen className="w-4 h-4 text-stone-400" />
                  <span>District Chronicle</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed font-sans">
                  {selectedNeighborhood.history}
                </p>
              </div>
            </div>

            {/* Right side: Filtered Content tabs */}
            <div className="md:col-span-2 space-y-4">
              
              {/* localized Post feed */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-mono font-bold text-stone-400 uppercase block border-b pb-1">
                  📰 Locals bulletin ({posts.filter(p => p.neighborhood === selectedNeighborhood.id).length} Stories)
                </span>
                
                {(() => {
                  const filterPosts = posts.filter(p => p.neighborhood === selectedNeighborhood.id);
                  if (filterPosts.length === 0) {
                    return (
                      <div className="text-center py-6 bg-stone-50 rounded-xl border border-dashed">
                        <p className="text-stone-400 text-xs font-sans">No localized updates on the board. Be the first to publish here!</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {filterPosts.map(p => (
                        <div key={p.id} className="bg-stone-50 p-3 rounded-xl border space-y-1.5" onClick={() => onSelectPin("post", p)}>
                          <div className="flex justify-between items-center text-[9px] text-stone-400">
                            <span className="font-bold text-stone-700">{p.author}</span>
                            <span className="uppercase font-mono bg-white py-0.2 px-1.5 rounded">{p.postType}</span>
                          </div>
                          <h4 className="font-bold text-xs text-stone-900 leading-tight truncate">{p.title}</h4>
                          <p className="text-[10.5px] text-stone-500 truncate">{p.content}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* localized Events */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-mono font-bold text-stone-400 uppercase block border-b pb-1">
                  🎉 Events in {selectedNeighborhood.name} ({events.filter(e => e.neighborhood === selectedNeighborhood.id).length})
                </span>

                {(() => {
                  const filterEvs = events.filter(e => e.neighborhood === selectedNeighborhood.id);
                  if (filterEvs.length === 0) {
                    return <p className="text-[11.5px] text-stone-400 italic">No schedules reported in this sector today.</p>;
                  }
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filterEvs.map(e => (
                        <div key={e.id} className="border p-2.5 rounded-lg text-xs space-y-1 bg-stone-50/40">
                          <h4 className="font-bold text-stone-900 leading-tight">{e.title}</h4>
                          <p className="text-[10px] text-stone-400">{e.time}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* 2. LOCAL MARKETPLACE CLASSIFIEDS */}
      {activeBoard === "marketplace" && (
        <div className="space-y-5 animate-fade-in" id="marketplace-portal">
          
          {/* Header instructions */}
          <div className="flex justify-between items-center bg-white border p-4 rounded-xl shadow-3xs flex-wrap gap-2">
            <div>
              <h4 className="font-sans font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <ShoppingBag className="w-5 h-5 text-orange-700" />
                Hometown Classifieds Exchange
              </h4>
              <p className="text-stone-500 text-[11px] leading-relaxed mt-0.5">
                Support the recycling economy of Pueblo County. Buy, sell, or trade collectables, furniture, electronics, and free items.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
            >
              💼 Post Classified Ad (+25 Rep Points)
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleCreateAd} className="p-4 bg-white border border-stone-250 rounded-2xl shadow-3xs space-y-3 animate-fade-in block" id="form-create-classified">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-xs text-stone-900 uppercase">Publish classified Ad</span>
                <button type="button" onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-850">
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Ad Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border rounded px-2.5 py-1.5 outline-none font-bold text-xs"
                  >
                    {MARKETPLACE_CATEGORIES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Local Price (or Free)</label>
                  <input type="text" placeholder="e.g. $45 / Free" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full bg-stone-50 border rounded px-2.5 py-1.5 outline-none text-xs" required />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Pick Neighborhood</label>
                  <select
                    value={newHood}
                    onChange={(e) => setNewHood(e.target.value as any)}
                    className="w-full bg-stone-50 border rounded px-2.5 py-1.5 outline-none font-bold text-xs"
                  >
                    <option value="bessemer">Aberdeen / Bessemer</option>
                    <option value="pueblo_west">Pueblo West Suburbs</option>
                    <option value="downtown">Downtown Core</option>
                    <option value="belmont">Belmont Hills</option>
                    <option value="mesa">Mesa Farm Loop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Item Headline Title</label>
                  <input type="text" placeholder="e.g. Vintage steel mill dome lunch box" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-stone-50 border rounded px-2.5 py-1.5 outline-none text-xs" required />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Seller Contact details</label>
                  <input type="text" placeholder="e.g. (719) 555-0199 / seller@gmail.com" value={newContact} onChange={(e) => setNewContact(e.target.value)} className="w-full bg-stone-50 border rounded px-2.5 py-1.5 outline-none text-xs" required />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-500 font-bold mb-0.5">Item Condition & detail description</label>
                <textarea placeholder="Write full details about item quality, trade criteria, collection points, etc..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full h-16 bg-stone-50 border rounded px-2.5 py-1.5 outline-none text-xs font-sans resize-none" required />
              </div>

              <button type="submit" className="w-full bg-stone-900 text-white font-sans font-bold py-2 rounded-xl text-xs hover:bg-stone-800 transition-colors cursor-pointer">Submit Ad to Pueblo Board</button>
            </form>
          )}

          {/* Search classifieds & categories */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search classified ads, collectibles, free items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-white border border-stone-250 text-xs rounded-xl px-3 py-2.5 outline-none"
            />

            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCat("all")}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCat === "all" ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                All Classifieds
              </button>
              {MARKETPLACE_CATEGORIES.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedCat(m)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                    selectedCat === m ? "bg-orange-700 text-white" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Classified Output list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplace.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectPin("marketplace", item)}
                className="bg-white border hover:border-orange-650 rounded-xl overflow-hidden cursor-pointer hover:shadow-2xs transition-all flex flex-col justify-between"
              >
                <div className="h-32 bg-stone-100 relative">
                  <img src={item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-2 right-2 bg-stone-900 text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded leading-none">
                    {item.price}
                  </span>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-mono font-bold text-orange-800 uppercase bg-orange-50 py-0.5 px-2.5 rounded w-fit block">
                      {item.category}
                    </span>
                    <h5 className="font-bold text-xs text-stone-900 leading-tight truncate">{item.title}</h5>
                    <p className="text-stone-500 text-[10.5px] leading-relaxed line-clamp-2">{item.description}</p>
                  </div>

                  <div className="border-t pt-2.5 flex justify-between items-center text-[10px] text-stone-400">
                    <span className="font-semibold uppercase text-stone-500">📍 {item.neighborhood.replace("_", " ")}</span>
                    <span className="font-bold text-stone-650">{item.contact}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
