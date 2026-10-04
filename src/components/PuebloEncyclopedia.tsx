import React, { useState } from "react";
import { BookOpen, Search, Plus, Map, History, Landmark, Award, ShieldCheck, Check, Calendar, ArrowRight, User } from "lucide-react";
import MediaUploader from "./MediaUploader";

export interface EncyclopediaEntry {
  id: string;
  category: "building" | "neighborhood" | "legend" | "resident" | "business" | "story";
  title: string;
  era: string;
  location?: string;
  summary: string;
  details: string;
  famousFor?: string;
  imageUrl?: string;
  contributedBy?: string;
  verified: boolean;
}

const INITIAL_ENCYCLOPEDIA: EncyclopediaEntry[] = [
  {
    id: "enc-1",
    category: "building",
    title: "The Historic Vail Hotel Building",
    era: "1910s (Late Edwardian)",
    location: "217 S Grand Ave, Pueblo, CO",
    summary: "An iconic, beautifully structured brick mansion building designed in 1910, famous for hosting early US politicians and historic celebrities.",
    details: "Built by local financier J.F. Vail, the landmark remains a prime example of late Edwardian architecture. Structurally surviving the Great Pueblo Flood of 1921, it provided shelter for dozens of stranded residents and still centers Downtown's architectural horizon.",
    famousFor: "Grand brick arches, preservation vaults, and early high-profile presidential visits.",
    imageUrl: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&auto=format&fit=crop",
    contributedBy: "christopherosorio7@gmail.com",
    verified: true
  },
  {
    id: "enc-2",
    category: "legend",
    title: "The Ghostly Bell of Goat Hill Heights",
    era: "Oral folklore (Late 1800s railway age)",
    location: "Goat Hill Overlook, Pueblo",
    summary: "A famous local legend about a spectral church bell rung during misty midnight storms on Goat Hill overlooking the Bessemer steelworks.",
    details: "In the late 1920s, a temporary wooden chapel on the hill burned down. Neighbors swear they still hear a deep, reassuring chime during turbulent stormy nights, indicating that early pioneer spirits are guiding railway engineers safely home.",
    famousFor: "Mystic campfire folklore stories told throughout Union Avenue's early merchant taverns.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
    contributedBy: "Pete Giadone",
    verified: true
  },
  {
    id: "enc-3",
    category: "resident",
    title: "Damon Runyon (Pioneering Writer)",
    era: "1880 - 1946",
    location: "Union Avenue Printing Office",
    summary: "World-class Broadway short story author and journalist who spent his formative teenage years reporting in early Pueblo news offices.",
    details: "Damon moved to Pueblo with his father, a printer, in 1887. He started his writing career as a young cub reporter at local city presses. His rugged, rapid-fire street dialogue style was deeply shaped by characters he met around Pueblo's early boom-town hotels and steel-worker quarters.",
    famousFor: "Inspirational author of 'Guys and Dolls' and early pioneer of streetwise sports journalism.",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop",
    contributedBy: "christopherosorio7@gmail.com",
    verified: true
  },
  {
    id: "enc-4",
    category: "business",
    title: "CF&I Minnequa Works Steel Empire",
    era: "1880s - Present",
    location: "Bessemer District Core",
    summary: "The industrial backbone of early Colorado, introducing steel production, rail casting, and heavy labor unions to the Mountain West.",
    details: "Founded by General William Jackson Palmer and expanded by John D. Rockefeller, the Colorado Fuel and Iron company (CF&I) hired thousands of immigration workers from 30+ countries, transforming Bessemer into a bustling melting pot of Italian, Slavic, and Mexican culture.",
    famousFor: "Casting standard railway rails that tied America together, driving industrial worker rights.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    contributedBy: "Pete Giadone",
    verified: true
  },
  {
    id: "enc-5",
    category: "legend",
    title: "The Great Pueblo Flood of 1921",
    era: "June 3 - 4, 1921",
    location: "Arkansas River & Downtown Avenue Districts",
    summary: "The most cataclysmic natural disaster in Southern Colorado history, which completely restructured the city's topology and river geography.",
    details: "On the night of June 3, 1921, torrential cloudbursts upstream combined with sudden mountain runoff, sending an immense wall of water down the Arkansas River and Fountain Creek. Water levels rose up to 15 feet in downtown Pueblo, washing away houses, merchant establishments, and railcars. Over 100 residents lost their lives, and damage ran into modern billions. In the aftermath, Pueblo fought back with true steel-town resilience, constructing vast concrete flood walls and eventually rerouting the entire course of the Arkansas River into a safer southern canal, paving the way for the modern riverwalk.",
    famousFor: "Unmatched citizen heroism, major infrastructure overhauls, and the historic 3-mile concrete flood wall.",
    imageUrl: "https://images.unsplash.com/photo-1540317580114-ec530c5f2b62?w=800&auto=format&fit=crop",
    contributedBy: "christopherosorio7@gmail.com",
    verified: true
  },
  {
    id: "enc-6",
    category: "neighborhood",
    title: "The Founding & Rise of Pueblo West",
    era: "1969 - Present",
    location: "Pueblo West Prairie District, CO",
    summary: "How a visionary master-planned community was carved out of 49,000 acres of empty prairie to leverage Pueblo Reservoir recreation.",
    details: "Pueblo West was founded on September 16, 1969, by land developer Robert P. McCulloch (renowned for inventing the modern chainsaw and importing London Bridge to Lake Havasu City). McCulloch purchased approximately 49,000 acres of barren plains west of Pueblo's industrial core to design a spacious equestrian-friendly community. Tailored for recreation enthusiasts, it is set against the stunning front-range silhouette and borders the Pueblo Reservoir Lake. Over the subsequent decades, Pueblo West grew from a quiet prairie development into one of the fastest-growing residential communities in Southern Colorado.",
    famousFor: "Robert P. McCulloch's master planning, extensive horse-riding lanes, and proximity to Lake Pueblo State Park.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop",
    contributedBy: "christopherosorio7@gmail.com",
    verified: true
  },
  {
    id: "enc-7",
    category: "building",
    title: "Pueblo Union Depot Railway Terminal",
    era: "1889 - Present",
    location: "B Street & Victoria Ave, Union Ave District",
    summary: "A magnificent Romanesque Revival stone terminal that stood as the gateway for thousands of Southern Colorado immigrants.",
    details: "Constructed of pink stone and designed by famed architect Frederick Albert Hale in 1889, the Union Depot is Southern Colorado's finest remaining monument of the railway boom. Structurally engineered with blocky masonry, it survived the high-pressure torrents of the 1921 Flood. During its high-traffic heyday, up to 30 passenger locomotives stopped daily, bringing steelworkers, coal miners, and homesteaders to the region.",
    famousFor: "Beautiful Romanesque arches, high clock tower silhouette, and survival of historic floods.",
    imageUrl: "https://images.unsplash.com/photo-1507919909716-c8262e491cde?w=800&auto=format&fit=crop",
    contributedBy: "Pete Giadone",
    verified: true
  },
  {
    id: "enc-8",
    category: "building",
    title: "Rosemount Museum Mansion (Crown Jewel)",
    era: "1893 - Present",
    location: "419 W 14th St, Pueblo, CO",
    summary: "Southern Colorado's premier historic mansion, a 37-room luxury estate built by wealthy pioneer merchant John A. Thatcher.",
    details: "Commonly referred to as the 'Crown Jewel of Southern Colorado,' the Rosemount Museum was constructed in 1893 for the family of John A. Thatcher. Designed by architect Henry Hudson Stevens in the Richardsonian Romanesque style, this 3-story mansion contains nearly all of its original custom furnishings, woodcarvings, wall coverings, and decorative stained glass. The estate was donated by the family in 1968 to preserve Pueblo's Gilded Age prosperity.",
    famousFor: "Original Richardsonian Romanesque grandeur, Tiffany windows, and exquisite hand-carved mahogany ceilings.",
    imageUrl: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&auto=format&fit=crop",
    contributedBy: "christopherosorio7@gmail.com",
    verified: true
  },
  {
    id: "enc-9",
    category: "neighborhood",
    title: "Historic Arkansas Riverwalk Overlay",
    era: "2000 - Present",
    location: "Channel Loop, Downtown Pueblo",
    summary: "A spectacular 32-acre urban riverwalk that transformed the exact canyon where the destructive 1921 flood waters flowed.",
    details: "Completed in 2000, the Historic Arkansas Riverwalk of Pueblo (HARP) serves as a stunning testimony to urban recovery. After the 1921 disaster, the main Arkansas River was pushed south. In the late 1990s, the city reclaimed the original river channel that bisected downtown, converting it into a vibrant public park, complete with a navigable gondola/excursion boat canal, waterfalls, statues honoring local heroes, and desert gardens that draw visitors from across the country.",
    famousFor: "Excursion boats, open-air amphitheaters, and the annual Pueblo Chile & Frijoles Festival.",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop",
    contributedBy: "Pete Giadone",
    verified: true
  }
];

const HISTORIC_TIMELINE = [
  { year: "1842", title: "El Pueblo Trading Post", text: "Trapper James Beckwourth and others build the original adobe fort where the Arkansas River meets Fountain Creek." },
  { year: "1872", title: "Pueblo Incorporated", text: "Colorado territorial charter officially establishes the town, soon merged with Bessemer and South Pueblo." },
  { year: "1882", title: "CF&I Steel Furnace lit", text: "First blast furnace fired up in Bessemer, initiating Colorado's heavy industrial boom." },
  { year: "1889", title: "Union Depot Passenger Gates", text: "Stately Romanesque pink-stone train station opens, handling millions of early traveler and immigrant transitions." },
  { year: "1893", title: "Rosemount Mansion Completed", text: "Wealthy dry-goods merchant John A. Thatcher finishes building Southern Colorado's spectacular 37-room Gilded Age estate." },
  { year: "1921", title: "The Catastrophic Great Flood", text: "Severe cloudbursts flood downtown with 15 feet of river water, prompting river course rerouting and concrete levee reinforcement." },
  { year: "1969", title: "McCulloch Founds Pueblo West", text: "Robert P. McCulloch master-plans a spacious, equestrian-friendly community on 49,000 acres of prairie bordering the reservoir." },
  { year: "1972", title: "CSU Pueblo Campus opens", text: "Inaugural lectures at the new Belmont campus, expanding higher education access in Southern Colorado." },
  { year: "2000", title: "Arkansas Riverwalk Rebirth", text: "City inaugurates the 32-acre HARP Riverwalk, reclaiming the original historic riverbed for cultural tourism and civic recreation." }
];

interface PuebloEncyclopediaProps {
  userProfile: any;
  onIncrementPoints?: (pts: number) => void;
}

export default function PuebloEncyclopedia({ userProfile, onIncrementPoints }: PuebloEncyclopediaProps) {
  const [entries, setEntries] = useState<EncyclopediaEntry[]>(INITIAL_ENCYCLOPEDIA);
  const [activeTab, setActiveTab] = useState<"catalog" | "timeline">("catalog");
  const [selectedCategory, setSelectedCategory] = useState<"all" | EncyclopediaEntry["category"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Expanded detailed reading state
  const [selectedEntryForModal, setSelectedEntryForModal] = useState<EncyclopediaEntry | null>(null);
  const [isEditingEntry, setIsEditingEntry] = useState(false);

  // Editorial inputs state
  const [editTitle, setEditTitle] = useState("");
  const [editEra, setEditEra] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editFamous, setEditFamous] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const PHOTO_PRESETS = [
    { name: "Union Depot Station", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop" },
    { name: "Vintage Train Tracks", url: "https://images.unsplash.com/photo-1532103054090-334e6e60b729?w=800&auto=format&fit=crop" },
    { name: "Thatcher Mansions", url: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&auto=format&fit=crop" },
    { name: "Gilded Manor Gables", url: "https://images.unsplash.com/photo-1505843513364-b22e16c34145?w=800&auto=format&fit=crop" },
    { name: "Minnequa Steelworks Mill", url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop" },
    { name: "Industrial Metal Foundry", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop" },
    { name: "Arkansas Riverwalk canal", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop" },
    { name: "Reservoir Heights plains", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop" }
  ];

  const handleOpenDetailModal = (item: EncyclopediaEntry) => {
    setSelectedEntryForModal(item);
    setIsEditingEntry(false);
    setEditTitle(item.title);
    setEditEra(item.era);
    setEditLocation(item.location || "");
    setEditSummary(item.summary);
    setEditDetails(item.details);
    setEditFamous(item.famousFor || "");
    setEditPhotoUrl(item.imageUrl || "");
  };

  const handleSaveEditedEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryForModal) return;

    const updated = entries.map(entry => {
      if (entry.id === selectedEntryForModal.id) {
        const updatedObj: EncyclopediaEntry = {
          ...entry,
          title: editTitle,
          era: editEra,
          location: editLocation || undefined,
          summary: editSummary,
          details: editDetails,
          famousFor: editFamous || undefined,
          imageUrl: editPhotoUrl,
          verified: false // Set to false to trigger Moderator review after edit
        };
        setSelectedEntryForModal(updatedObj); // update active modal view
        return updatedObj;
      }
      return entry;
    });

    setEntries(updated);
    setIsEditingEntry(false);
    if (onIncrementPoints) {
      onIncrementPoints(15);
    }
    alert("📝 Historical record updated with correct details and pictures! You earned +15 historian experience points.");
  };
  
  // Create state
  const [storyTitle, setStoryTitle] = useState("");
  const [storyCategory, setStoryCategory] = useState<EncyclopediaEntry["category"]>("story");
  const [storyEra, setStoryEra] = useState("");
  const [storyLocation, setStoryLocation] = useState("");
  const [storySummary, setStorySummary] = useState("");
  const [storyDetails, setStoryDetails] = useState("");
  const [storyFamous, setStoryFamous] = useState("");
  const [storyPhoto, setStoryPhoto] = useState("");

  const handleContributeStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storySummary.trim() || !storyDetails.trim()) return;

    const newStory: EncyclopediaEntry = {
      id: `enc-${Date.now()}`,
      category: storyCategory,
      title: storyTitle,
      era: storyEra || "Unspecified Era",
      location: storyLocation || undefined,
      summary: storySummary,
      details: storyDetails,
      famousFor: storyFamous || undefined,
      imageUrl: storyPhoto || "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&auto=format&fit=crop",
      contributedBy: userProfile.name || "Pueblo Neighbor",
      verified: false // Must be verified by Moderator
    };

    setEntries([newStory, ...entries]);
    setShowContributeModal(false);

    // Reset controls
    setStoryTitle("");
    setStoryEra("");
    setStoryLocation("");
    setStorySummary("");
    setStoryDetails("");
    setStoryFamous("");
    setStoryPhoto("");

    if (onIncrementPoints) {
      onIncrementPoints(30); // Award high points for keeping history alive!
    }
    alert("🎖️ Story submitted successfully! It has been entered in the Pueblo Encyclopedia verification queue. You earned +30 Historian points!");
  };

  const filteredEntries = entries.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6" id="pueblo-encyclopedia-root">
      
      {/* Encyclopedia Brand Header */}
      <div className="bg-stone-900 border border-stone-850 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 opacity-15 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-yellow-500 via-amber-600 to-transparent"></div>
        <div className="space-y-1.5 max-w-xl z-10 relative">
          <span className="text-[9px] font-mono tracking-widest text-amber-400 font-extrabold uppercase flex items-center gap-1 leading-none">
            <History className="w-3.5 h-3.5" /> Southern Colorado Memory Vault
          </span>
          <h2 className="text-sm font-sans font-black tracking-tight leading-none text-stone-100 flex items-center gap-1.5 uppercase">
            🏛️ The Steel City Community Local Encyclopedia
          </h2>
          <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
            Explore carefully researched stories, oral histories, neighborhood legends, architectural maps, and historical milestones that define Southern Colorado's industrial cradle.
          </p>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex justify-between items-center bg-white p-3.5 border border-stone-250 rounded-2xl shadow-3xs flex-wrap gap-2.5">
        <div className="flex bg-stone-100 p-1 rounded-xl border gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
              activeTab === "catalog" ? "bg-stone-900 text-white shadow-3xs" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            📚 Historical Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
              activeTab === "timeline" ? "bg-stone-900 text-white shadow-3xs" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            ⏳ Timeline Explorer
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowContributeModal(true)}
          className="bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl cursor-pointer shadow-xs uppercase tracking-wide flex items-center gap-1 leading-none"
        >
          <Plus className="w-3.5 h-3.5" /> Contribute History
        </button>
      </div>

      {activeTab === "catalog" ? (
        <div className="space-y-5">
          
          {/* Categories select row */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
            {[
              { id: "all", name: "All Records" },
              { id: "building", name: "Buildings" },
              { id: "neighborhood", name: "Neighborhoods" },
              { id: "legend", name: "Local Legends" },
              { id: "resident", name: "Famous Residents" },
              { id: "business", name: "Historic Businesses" },
              { id: "story", name: "Resident Stories" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-full border text-[10.5px] font-black cursor-pointer transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-800 border-amber-800 text-white"
                    : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search bar input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search history records, legends, or buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-450 placeholder-stone-400 text-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Encyclopedia catalog cards list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEntries.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleOpenDetailModal(item)}
                className="bg-white border hover:border-amber-800 rounded-2xl overflow-hidden p-4 flex flex-col md:flex-row gap-4 shadow-3xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] transform duration-150 select-none relative"
                title="Click to view full screen cozy article & edit photos"
              >
                {/* Image panel */}
                <div className="w-full md:w-32 h-28 shrink-0 rounded-xl overflow-hidden border bg-stone-100 relative group-hover:opacity-90 transition-opacity">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                  {item.verified ? (
                    <span className="absolute top-1.5 right-1.5 bg-emerald-700 text-white text-[7.5px] font-black font-mono px-1 py-0.2 rounded uppercase border border-emerald-500 flex items-center gap-0.5 shadow-3xs">
                      <ShieldCheck className="w-2 h-2" /> Verified
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 bg-amber-600 text-white text-[7.5px] font-black font-mono px-1 py-0.2 rounded uppercase flex items-center gap-0.5 shadow-3xs">
                      Pending Audit
                    </span>
                  )}
                  <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-mono text-white font-extrabold tracking-wider bg-stone-900/80 px-2 py-1 rounded">
                      📖 READ ENTRY
                    </span>
                  </div>
                </div>

                {/* Text specs */}
                <div className="flex-1 flex flex-col justify-between space-y-1.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[8.5px] font-mono text-stone-400 uppercase font-black">
                      <span>{item.category}</span>
                      <span>{item.era}</span>
                    </div>

                    <h3 className="font-sans font-black text-xs text-stone-900 leading-snug tracking-tight group-hover:text-amber-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-sans line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  {item.famousFor && (
                    <div className="p-1.5 bg-stone-50 rounded-lg text-[9.5px] text-stone-605 border border-stone-150 line-clamp-1">
                      <strong>Famous for:</strong> {item.famousFor}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    {item.contributedBy ? (
                      <p className="text-[8.5px] text-stone-400 font-mono italic leading-none truncate max-w-[120px]">
                        By: {item.contributedBy.split("@")[0]}
                      </p>
                    ) : <span />}
                    <span className="text-[8.5px] font-mono font-bold text-amber-800 group-hover:underline flex items-center gap-0.5">
                      Expand & Edit ✏️
                    </span>
                  </div>
                </div>

              </div>
            ))}

            {filteredEntries.length === 0 && (
              <div className="col-span-2 text-center py-10 bg-white border rounded-2xl">
                <Landmark className="w-8 h-8 text-stone-300 mx-auto stroke-1" />
                <p className="text-xs font-bold text-stone-605 mt-2">No historical records match your search.</p>
                <button
                  onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                  className="text-amber-800 font-black text-[10.5px] mt-1 hover:underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-white border p-5 rounded-2xl shadow-3xs relative">
          
          <div className="absolute left-6 top-10 bottom-10 w-[2px] bg-stone-200"></div>

          <div className="space-y-8 pl-8 relative">
            {HISTORIC_TIMELINE.map((evt, idx) => (
              <div key={idx} className="relative space-y-1 animate-fade-in">
                {/* Node marker point */}
                <span className="absolute -left-10 top-1.5 bg-amber-800 text-white font-mono text-[9px] font-black w-6.5 h-6.5 rounded-full flex items-center justify-center border-4 border-white shadow-3xs ring-1 ring-amber-800">
                  {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-amber-800">{evt.year}</span>
                  <span className="border border-stone-200 bg-stone-50 rounded px-1.5 text-[8.5px] font-mono tracking-wider uppercase font-black text-stone-600">Era point</span>
                </div>

                <h4 className="font-sans font-black text-xs text-stone-900 leading-none tracking-tight">
                  {evt.title}
                </h4>
                <p className="text-[11px] text-stone-500 leading-relaxed font-sans max-w-xl">
                  {evt.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Contribute Modal box */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-stone-950/85 z-55 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl p-5 shadow-2xl max-w-md w-full overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar space-y-4">
            
            <div className="border-b pb-2">
              <h3 className="font-sans font-black text-sm text-stone-950 uppercase flex items-center gap-1">
                🏛️ CONTRIBUTE ORAL PUEBLO STORY
              </h3>
              <p className="text-[10.5px] text-stone-400 font-mono">Contribute historic facts, building details, or legendary folklore</p>
            </div>

            <form onSubmit={handleContributeStory} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Story Category</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "building", name: "Building" },
                    { id: "legend", name: "Folklore/Legend" },
                    { id: "resident", name: "Famous Resident" },
                    { id: "business", name: "Historic Biz" },
                    { id: "story", name: "Resident Story" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setStoryCategory(t.id as any)}
                      className={`p-2 rounded-lg border text-[9.5px] font-bold text-center cursor-pointer transition-all ${
                        storyCategory === t.id
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
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Subject / Title</label>
                  <input
                    type="text"
                    required
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="e.g. My Grandmother's steelworks canteen"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Era / Years</label>
                  <input
                    type="text"
                    required
                    value={storyEra}
                    onChange={(e) => setStoryEra(e.target.value)}
                    placeholder="e.g. 1930s / Post-War"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Physical Address / Sector</label>
                  <input
                    type="text"
                    value={storyLocation}
                    onChange={(e) => setStoryLocation(e.target.value)}
                    placeholder="e.g. Bessemer / Mesa"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Brief Tagline / Famous For</label>
                  <input
                    type="text"
                    value={storyFamous}
                    onChange={(e) => setStoryFamous(e.target.value)}
                    placeholder="e.g. Traditional family canteen recipes"
                    className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Short Summary</label>
                <input
                  type="text"
                  required
                  value={storySummary}
                  onChange={(e) => setStorySummary(e.target.value)}
                  placeholder="One sentence outline of the historic event/pioneer..."
                  className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Full Details of Oral History</label>
                <textarea
                  required
                  rows={4}
                  value={storyDetails}
                  onChange={(e) => setStoryDetails(e.target.value)}
                  placeholder="Tell the full narrative detail of what occurred, names, and cultural heritages..."
                  className="w-full bg-white border border-stone-250 rounded-lg p-2 focus:outline-none"
                />
              </div>

              {/* Media selection */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-stone-450 font-bold block">Attach Historic Portrait/Photo</label>
                <MediaUploader
                  maxFiles={1}
                  category="encyclopedia"
                  onUploadComplete={(urls) => {
                    if (urls.length > 0) {
                      setStoryPhoto(urls[0]);
                    }
                  }}
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                <button
                  type="button"
                  onClick={() => setShowContributeModal(false)}
                  className="bg-stone-100 hover:bg-stone-250 text-stone-700 font-bold px-3.5 py-2 rounded-xl border border-stone-250 cursor-pointer shadow-3xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-800 hover:bg-amber-900 text-white font-extrabold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Contribute Story (+30 PTS)
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* COZY IMMERSIVE ENTRY READ & PHOTO EDIT MODAL */}
      {selectedEntryForModal && (
        <div className="fixed inset-0 bg-stone-950/80 z-55 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs select-none shadow-2xl" id="cozy-reader-overlay">
          <div className="bg-white border-2 border-stone-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal header */}
            <div className="bg-stone-900 p-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono bg-amber-700 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  📖 Cozy Historian Reader
                </span>
                <h3 className="font-sans font-black text-sm tracking-tight text-white mt-1">
                  {selectedEntryForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntryForModal(null)}
                className="bg-white/10 hover:bg-white/20 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Immersive Photo section */}
            <div className="relative h-56 bg-stone-100 border-b overflow-hidden select-none">
              <img 
                src={editPhotoUrl || selectedEntryForModal.imageUrl} 
                alt={editTitle || selectedEntryForModal.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <span className="text-[9px] font-mono uppercase bg-amber-800 px-2 py-0.5 rounded font-black">
                  Era: {selectedEntryForModal.era}
                </span>
                <p className="text-[10px] text-stone-200 mt-1 font-mono">Location Context: {selectedEntryForModal.location || "Pueblo Heritage Area"}</p>
              </div>
            </div>

            {/* Content segment */}
            <div className="p-6 space-y-4 max-h-[45vh] overflow-y-auto no-scrollbar text-stone-900">
              
              {!isEditingEntry ? (
                /* QUIET INTUITIVE COZY READING MODE */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-2">
                    <span className="text-[9px] font-mono bg-stone-100 text-stone-605 px-2 py-0.5 rounded border uppercase font-bold">
                      Category: {selectedEntryForModal.category}
                    </span>
                    {selectedEntryForModal.verified && (
                      <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-150 uppercase font-black">
                        ✓ Verified Record
                      </span>
                    )}
                  </div>

                  <p className="font-sans font-extrabold text-sm text-stone-950 leading-relaxed italic border-l-4 border-amber-800 pl-3">
                    "{selectedEntryForModal.summary}"
                  </p>

                  <div className="text-stone-700 text-xs leading-relaxed space-y-2 whitespace-pre-line font-sans">
                    {selectedEntryForModal.details}
                  </div>

                  {selectedEntryForModal.famousFor && (
                    <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-2xl text-stone-904 text-xs">
                      <strong className="block text-[9px] uppercase font-mono tracking-wider text-amber-900 mb-0.5 font-black">Historical Legacy Significance:</strong>
                      <span className="font-sans font-medium">{selectedEntryForModal.famousFor}</span>
                    </div>
                  )}

                  {selectedEntryForModal.contributedBy && (
                    <div className="text-[9px] text-stone-400 font-mono italic flex items-center gap-1 border-t pt-3">
                      <span>👤</span>
                      <span>Archived by citizen contributor: <strong>{selectedEntryForModal.contributedBy}</strong></span>
                    </div>
                  )}

                  {/* Operational controls */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => setIsEditingEntry(true)}
                      className="flex-1 bg-stone-900 hover:bg-stone-850 text-white font-black text-xs py-2.5 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      ✏️ Edit Photo or Facts
                    </button>
                    <button
                      onClick={() => setSelectedEntryForModal(null)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs py-2.5 rounded-xl text-center cursor-pointer transition-all"
                    >
                      Finished Reading
                    </button>
                  </div>

                </div>
              ) : (
                /* EDITING MODE WITH DIRECT URL & PRESELECTION PRESETS */
                <form onSubmit={handleSaveEditedEntry} className="space-y-3.5 animate-fade-in text-xs font-sans text-stone-900">
                  
                  <div className="bg-amber-50 text-amber-950 border border-amber-100 p-3 rounded-xl text-[10.5px]">
                    🌾 <strong>Historical Accuracy Portal:</strong> Update this entry's photo URL or body texts with correct local archives. Your edit gets saved immediately!
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono uppercase font-black text-stone-500 mb-0.5">Title Name</label>
                      <input 
                        type="text" 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-stone-55 border border-stone-200 rounded-lg p-2 text-xs focus:outline-none"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono uppercase font-black text-stone-500 mb-0.5">Era / Period</label>
                      <input 
                        type="text" 
                        value={editEra} 
                        onChange={(e) => setEditEra(e.target.value)}
                        className="w-full bg-stone-55 border border-stone-200 rounded-lg p-2 text-xs focus:outline-none"
                        required 
                      />
                    </div>
                  </div>

                  {/* Photo Edit Segment */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-mono uppercase font-black text-stone-500">
                      Photo Link / Image URL
                    </label>
                    <input 
                      type="text" 
                      value={editPhotoUrl} 
                      onChange={(e) => setEditPhotoUrl(e.target.value)}
                      placeholder="Paste Unsplash link or any public photo path..."
                      className="w-full bg-stone-55 border border-stone-200 rounded-lg p-2 text-xs focus:outline-none font-mono"
                      required 
                    />

                    {/* Preselected free photo suggestion row */}
                    <div className="space-y-1">
                      <span className="block text-[8px] font-mono text-stone-400 font-extrabold uppercase">
                        Or click beautiful local suggestions:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none text-[8.5px]">
                        {PHOTO_PRESETS.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setEditPhotoUrl(preset.url)}
                            className="p-1 border border-stone-200 rounded bg-stone-50 hover:bg-amber-50 hover:border-amber-700 text-left truncate transition-colors cursor-pointer"
                            title={preset.name}
                          >
                            📸 {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase font-black text-stone-500 mb-0.5">Tagline Summary</label>
                    <input 
                      type="text" 
                      value={editSummary} 
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="w-full bg-stone-55 border border-stone-200 rounded-lg p-2 text-xs focus:outline-none"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase font-black text-stone-500 mb-0.5">Full Detailed Story Narratives</label>
                    <textarea 
                      rows={5}
                      value={editDetails} 
                      onChange={(e) => setEditDetails(e.target.value)}
                      className="w-full bg-stone-55 border border-stone-200 rounded-lg p-2 text-xs focus:outline-none resize-none leading-relaxed"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase font-black text-stone-500 mb-0.5">Legacy Significance (Famous For)</label>
                    <input 
                      type="text" 
                      value={editFamous} 
                      onChange={(e) => setEditFamous(e.target.value)}
                      className="w-full bg-stone-55 border border-stone-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Actions row */}
                  <div className="flex gap-2.5 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEditingEntry(false)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2 rounded-xl text-center cursor-pointer transition-all"
                    >
                      ← Back to Reader
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2 rounded-xl text-center cursor-pointer transition-all"
                    >
                      Save Historical Changes
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
