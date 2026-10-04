import React, { useState } from "react";
import {
  BookOpen,
  MapPin,
  Clock,
  Printer,
  Wifi,
  Laptop,
  GraduationCap,
  Calendar,
  Users,
  Building,
  Activity,
  Heart,
  AlertTriangle,
  School,
  Compass,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  TrendingUp,
  Tag,
  Search,
  Phone,
  FileText
} from "lucide-react";
import WeatherTransitHub from "./WeatherTransitHub";

// Library Branch Interface
interface LibraryBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  features: {
    wifi: boolean;
    computers: boolean;
    printing: boolean;
    archives: boolean;
    studyRooms: boolean;
  };
  specialty: string;
  image: string;
}

// Preseeded library branches
const PUEBLO_LIBRARIES: LibraryBranch[] = [
  {
    id: "rawlings",
    name: "Robert Hoag Rawlings Public Library (Main Branch)",
    address: "100 E Abriendo Ave, Pueblo, CO 81004",
    phone: "(719) 562-5600",
    hours: "M-Th: 9:00 AM - 9:00 PM, F-Sa: 9:00 AM - 6:00 PM, Su: 1:00 PM - 5:00 PM",
    description: "The crown jewel of the library district, featuring three floors of books, a makerspace, interactive children's museum, and the Southern Colorado Western History Archives.",
    features: { wifi: true, computers: true, printing: true, archives: true, studyRooms: true },
    specialty: "Southeastern Colorado Genealogy & CF&I Steel Archives",
    image: "https://picsum.photos/id/1033/800/450"
  },
  {
    id: "barkman",
    name: "Barkman Regional Library",
    address: "1300 Jerry Murphy Rd, Pueblo, CO 81001",
    phone: "(719) 562-5680",
    hours: "M-Th: 10:00 AM - 8:00 PM, F-Sa: 10:00 AM - 6:00 PM",
    description: "Serves the northside of Pueblo with outstanding computer labs, family reading gardens, and a large children's discovery area.",
    features: { wifi: true, computers: true, printing: true, archives: false, studyRooms: true },
    specialty: "Northside Computer Literacy & Senior Outreach Programs",
    image: "https://picsum.photos/id/367/800/450"
  },
  {
    id: "pueblo_west",
    name: "Pueblo West Library",
    address: "290 E Joe Martinez Blvd, Pueblo West, CO 81007",
    phone: "(719) 562-5660",
    hours: "M-Th: 9:00 AM - 8:00 PM, F-Sa: 9:00 AM - 6:00 PM, Su: 1:00 PM - 5:00 PM",
    description: "A fast-growing, high-density library branch complete with state-of-the-art collaborative workspaces, a public plaza, and beautiful desert trail views.",
    features: { wifi: true, computers: true, printing: true, archives: false, studyRooms: true },
    specialty: "STEM Robotics Club & SBDC Business Mentors Desk",
    image: "https://picsum.photos/id/838/800/450"
  },
  {
    id: "giodone",
    name: "Giodone Library (Salt Creek / Avondale Area)",
    address: "2465 Lane 36, Pueblo, CO 81006",
    phone: "(719) 562-5697",
    hours: "M-W: 10:00 AM - 7:00 PM, Th: 10:00 AM - 6:00 PM, Sa: 10:00 AM - 4:00 PM",
    description: "Crucial rural library connecting Salt Creek and regional farming hubs. Active in children's nutrition lunch loops and multi-lingual books.",
    features: { wifi: true, computers: true, printing: true, archives: false, studyRooms: false },
    specialty: "Bilingual Literacy & Agricultural Community Archives",
    image: "https://picsum.photos/id/342/800/450"
  },
  {
    id: "lamb",
    name: "Lamb Regional Library",
    address: "2525 S Pueblo Blvd, Pueblo, CO 81005",
    phone: "(719) 562-5670",
    hours: "M-Th: 10:00 AM - 8:00 PM, F-Sa: 10:00 AM - 6:00 PM",
    description: "Southside hub for community lectures, book clubs, and secondary school resources. Famous for its local history lecture series.",
    features: { wifi: true, computers: true, printing: true, archives: true, studyRooms: true },
    specialty: "Teen Creative Writing Projects & Art Gallery",
    image: "https://picsum.photos/id/101/800/450"
  },
  {
    id: "lucero",
    name: "Lucero Library (Eastside)",
    address: "1315 E 7th St, Pueblo, CO 81001",
    phone: "(719) 562-5695",
    hours: "M-Tu: 11:00 AM - 7:00 PM, W-Th: 11:00 AM - 6:00 PM, F: 11:00 AM - 5:00 PM",
    description: "Located within the heart of Pueblo's Eastside neighborhood, providing crucial homework help centers and computer access.",
    features: { wifi: true, computers: true, printing: true, archives: false, studyRooms: false },
    specialty: "After-school Homework Help & Dual-Language Learning",
    image: "https://picsum.photos/id/145/800/450"
  }
];

// Education programs / library events
interface LibraryEvent {
  id: string;
  branch: string;
  title: string;
  category: "Book Club" | "Family Activity" | "Community Education" | "Student Resources";
  date: string;
  time: string;
  room: string;
  description: string;
  isOfficialVerified: boolean;
}

const INITIAL_LIBRARY_EVENTS: LibraryEvent[] = [
  {
    id: "lib-ev-1",
    branch: "Robert Hoag Rawlings Public Library (Main Branch)",
    title: "Mesa Junction Local History & Photo Archive Dig",
    category: "Community Education",
    date: "Tuesdays (Weekly)",
    time: "6:00 PM - 7:30 PM",
    room: "3rd Floor Western History Suite",
    description: "Join our archivist to look over, scan, and catalog 20th-century photo slides of the CF&I steel mill and old Bessmer junction. Bring your family albums!",
    isOfficialVerified: true
  },
  {
    id: "lib-ev-2",
    branch: "Pueblo West Library",
    title: "Youth STEM & Minecraft Engineering Night",
    category: "Family Activity",
    date: "Thursdays",
    time: "4:30 PM - 6:00 PM",
    room: "Plaza Makerspace Lab",
    description: "Ages 8-14. Hands-on coding with local high-school mentors. Build structures inspired by Pueblo Reservoir dams!",
    isOfficialVerified: true
  },
  {
    id: "lib-ev-3",
    branch: "Barkman Regional Library",
    title: "Aspen Trails Book Club: Historic West Literature",
    category: "Book Club",
    date: "Third Wednesday of Month",
    time: "7:00 PM - 8:30 PM",
    room: "Fireside Gathering Room",
    description: "Discussing contemporary literature, novels, and non-fiction diaries highlighting Southern Colorado pioneer and ethnic heritage.",
    isOfficialVerified: true
  },
  {
    id: "lib-ev-4",
    branch: "Lucero Library (Eastside)",
    title: "Free Homework Help & Bilingual Peer Tutoring",
    category: "Student Resources",
    date: "M-Th (School Year)",
    time: "3:30 PM - 5:30 PM",
    room: "Learning Row",
    description: "High school volunteers are on-site to assist elementary students with math, reading, and Spanish vocabulary homework. Snack provided.",
    isOfficialVerified: true
  }
];

export default function LibrariesHub({ userProfile, onAddLocalEvent, favoritedRouteIds = [], onToggleFavoriteRoute }: { userProfile: any; onAddLocalEvent?: (ev: any) => void; favoritedRouteIds?: string[]; onToggleFavoriteRoute?: (id: string) => void }) {
  const [activeCatalog, setActiveCatalog] = useState<"libraries" | "government" | "healthcare" | "schools" | "churches" | "museums" | "utilities">("libraries");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("rawlings");
  const [libraryEvents, setLibraryEvents] = useState<LibraryEvent[]>(INITIAL_LIBRARY_EVENTS);
  const [searchQuery, setSearchQuery] = useState("");

  // Library Event Publisher State
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState<LibraryEvent["category"]>("Community Education");
  const [eventBranch, setEventBranch] = useState("Robert Hoag Rawlings Public Library (Main Branch)");
  const [eventTime, setEventTime] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventRoom, setEventRoom] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [publisherNotice, setPublisherNotice] = useState<string | null>(null);

  // Filter branches based on query
  const filteredBranches = PUEBLO_LIBRARIES.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBranch = PUEBLO_LIBRARIES.find(b => b.id === selectedBranchId) || PUEBLO_LIBRARIES[0];

  // Handle publishing library event
  const handlePublishLibraryEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDesc || !eventDate || !eventTime) {
      alert("⚠️ Complete all fields before publishing official events.");
      return;
    }

    const newEv: LibraryEvent = {
      id: `lib-ev-${Date.now()}`,
      branch: eventBranch,
      title: eventTitle,
      category: eventCategory,
      date: eventDate,
      time: eventTime,
      room: eventRoom || "Main Hall",
      description: eventDesc,
      isOfficialVerified: true
    };

    setLibraryEvents(prev => [newEv, ...prev]);

    // Also dispatch to main events database if callback exists
    if (onAddLocalEvent) {
      onAddLocalEvent({
        id: `event-${Date.now()}`,
        title: `📚 [Library] ${eventTitle}`,
        description: eventDesc,
        category: "Community",
        date: eventDate,
        time: eventTime,
        location: `${eventBranch} - ${eventRoom || "Main Assembly"}`,
        promoter: "Pueblo County Library System",
        isAd: false,
        isVerified: true
      });
    }

    setPublisherNotice(`✓ Published Official Verified Library Event: "${eventTitle}"! Syncing to the main Pueblo community calendar.`);
    setTimeout(() => setPublisherNotice(null), 4000);

    // Reset fields
    setEventTitle("");
    setEventTime("");
    setEventDate("");
    setEventRoom("");
    setEventDesc("");
  };

  return (
    <div className="space-y-6" id="pueblo-services-learning-hub">
      
      {/* Banner design */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 text-white rounded-2xl p-5 shadow-sm border border-stone-850 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400 via-orange-600 to-transparent"></div>
        <div className="space-y-1 z-10 relative">
          <span className="text-[9px] font-mono tracking-widest text-orange-400 uppercase font-black">Pueblo Civic Portal</span>
          <h2 className="text-lg font-sans font-black tracking-tight flex items-center gap-2">
            🏛️ Local Services, Libraries, & Public Utilities Hub
          </h2>
          <p className="text-[11.5px] text-stone-300 max-w-xl leading-normal">
            Welcome to Pueblo's central service directory. Access digital library catalogs, schedules for regional transport services, historic Western memory archives, county registers, and verified municipal help desks.
          </p>
        </div>
      </div>

      {/* Primary Category Switch Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b no-scrollbar select-none">
        {[
          { id: "libraries", label: "📚 Libraries & Learning", color: "text-amber-700" },
          { id: "government", label: "🏛️ Govt Services", color: "text-blue-700" },
          { id: "healthcare", label: "🏥 Health & Safety", color: "text-rose-700" },
          { id: "schools", label: "🏫 Education & Schools", color: "text-purple-700" },
          { id: "museums", label: "🌲 Parks, Museums & Riverwalk", color: "text-emerald-700" },
          { id: "utilities", label: "🔌 Utilities & Water", color: "text-stone-700" }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCatalog(cat.id as any)}
            className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCatalog === cat.id
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-white border hover:bg-stone-50 text-stone-600"
            }`}
          >
            <span className={activeCatalog === cat.id ? "text-amber-400" : cat.color}>{cat.label.slice(0, 2)}</span>
            <span>{cat.label.slice(2)}</span>
          </button>
        ))}
      </div>

      {/* SUBSECTION CONTENT RENDERING */}
      {activeCatalog === "libraries" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Dual Grid for Branch Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Branch Selector Cards (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter library locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-250 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar border rounded-xl p-1 bg-stone-50/40">
                {filteredBranches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex gap-2.5 ${
                      selectedBranchId === b.id
                        ? "bg-white border-orange-355 shadow-2xsScale text-stone-900"
                        : "bg-transparent border-transparent hover:bg-white text-stone-600"
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 shrink-0 mt-0.5 ${selectedBranchId === b.id ? "text-orange-700 animate-pulse" : "text-stone-400"}`} />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">{b.name}</h4>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5">{b.address}</p>
                      <span className="text-[8.5px] font-mono uppercase bg-stone-100 font-bold px-1.5 py-0.2 rounded mt-1.5 inline-block text-stone-500">
                        {b.specialty.split(" ")[0]} specialty
                      </span>
                    </div>
                  </button>
                ))}
                {filteredBranches.length === 0 && (
                  <p className="text-center py-4 text-xs font-sans italic text-stone-400">No matching library centers found.</p>
                )}
              </div>
            </div>

            {/* Right Side: Large Interactive Details Panel (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-4 md:p-5 shadow-3xs space-y-5">
              
              {/* Branch Header Detail */}
              <div className="space-y-3">
                <div className="h-36 w-full rounded-xl overflow-hidden relative border">
                  <img
                    src={activeBranch.image}
                    alt={activeBranch.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-4">
                    <h3 className="text-white font-sans font-black text-sm tracking-tight leading-tighter">{activeBranch.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans text-stone-600">
                  <div className="flex items-start gap-1.5 bg-stone-50 p-2 rounded-xl border">
                    <MapPin className="w-3.5 h-3.5 text-orange-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[8px] font-mono uppercase text-stone-400">Library Location</strong>
                      <span>{activeBranch.address}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 bg-stone-50 p-2 rounded-xl border">
                    <Phone className="w-3.5 h-3.5 text-orange-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[8px] font-mono uppercase text-stone-400">Contact Line</strong>
                      <a href={`tel:${activeBranch.phone.replace(/\D/g,'')}`} className="text-orange-750 font-bold hover:underline">{activeBranch.phone}</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Specialties */}
              <div className="space-y-2">
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {activeBranch.description}
                </p>
                <div className="bg-amber-50/10 border border-amber-250 rounded-xl p-2.5 text-[11px] text-stone-900">
                  <span className="font-mono text-[8px] uppercase tracking-wider font-bold text-amber-700 block">Unique Archive / Specialty:</span>
                  <p className="font-bold mt-0.2">✨ {activeBranch.specialty}</p>
                </div>
              </div>

              {/* Amenities checklist */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-[10px] font-mono font-bold uppercase text-stone-400">Available Digital Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${activeBranch.features.wifi ? "bg-emerald-50/15 border-emerald-200 text-stone-900" : "bg-stone-50 text-stone-400 border-stone-150"}`}>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">Free Wi-Fi</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${activeBranch.features.computers ? "bg-emerald-50/15 border-emerald-200 text-stone-900" : "bg-stone-50 text-stone-400 border-stone-150"}`}>
                    <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">PC Access</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${activeBranch.features.printing ? "bg-emerald-50/15 border-emerald-200 text-stone-900" : "bg-stone-50 text-stone-400 border-stone-150"}`}>
                    <Printer className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">Printing / Copying</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${activeBranch.features.archives ? "bg-emerald-50/15 border-emerald-200 text-stone-900" : "bg-stone-50 text-stone-400 border-stone-150"}`}>
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">Local Archives</span>
                  </div>
                </div>
              </div>

              {/* Operating Hours Panel */}
              <div className="bg-stone-50 border p-3 rounded-xl space-y-1">
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-stone-450">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  Hours of Service
                </span>
                <p className="text-xs font-bold font-sans text-stone-850 leading-tight">
                  {activeBranch.hours}
                </p>
              </div>

            </div>

          </div>

          {/* Library Events Feed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Events Lists (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white border rounded-2xl p-4 md:p-5 shadow-3xs space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-sans font-black text-sm text-stone-900 flex items-center gap-1.5 leading-none">
                    <Calendar className="w-4 h-4 text-orange-700 animate-bounce" />
                    Library Workshops & Family Gatherings
                  </h3>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">Educational events, book club forums, and student aid</p>
                </div>
                <span className="bg-stone-100 text-stone-600 font-mono text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {libraryEvents.length} active programs
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {libraryEvents.map(ev => (
                  <div key={ev.id} className="bg-stone-50 border hover:bg-stone-100/50 transition-colors rounded-xl p-3 space-y-2 border-stone-200/50 relative">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider font-mono font-bold text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.2 rounded-md">
                          {ev.category}
                        </span>
                        <h4 className="font-bold text-xs font-sans text-stone-950 mt-1 leading-snug">{ev.title}</h4>
                      </div>
                      
                      {ev.isOfficialVerified && (
                        <span className="bg-blue-50 text-blue-800 text-[8px] font-black uppercase font-mono border border-blue-200 px-1.5 rounded flex items-center gap-0.5 select-none shrink-0" title="Official Verified Library Branch Profile">
                          <CheckCircle className="w-2.5 h-2.5 fill-blue-700 text-white" />
                          Official
                        </span>
                      )}
                    </div>

                    <p className="text-[11.5px] text-stone-500 font-sans leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-stone-450 border-t pt-1.5">
                      <span>🏛️ {ev.branch.split(" (")[0]}</span>
                      <span>📅 {ev.date}</span>
                      <span>⏱️ {ev.time}</span>
                      <span>📍 {ev.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Verified Publisher Console if role can post or super citizen (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-4 md:p-5 shadow-3xs space-y-4">
              <div>
                <h3 className="font-sans font-black text-sm text-stone-900 flex items-center gap-1.5 leading-none">
                  <PlusCircle className="w-4 h-4 text-orange-700" />
                  Library Verified Publisher Console
                </h3>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Authorizing agents and educators to post digital sessions</p>
              </div>

              {/* Banner for permission status */}
              <div className="p-3 bg-emerald-50 border border-emerald-350 rounded-xl flex gap-2 text-[10.5px] text-emerald-800 leading-normal">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block uppercase font-mono text-[8px] text-emerald-650">Credential Sync Verified</strong>
                  <span>Your profile role allows submitting authorized library calendar alerts. Your updates display on the main board.</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handlePublishLibraryEvent} className="space-y-3 text-xs font-sans">
                {publisherNotice && (
                  <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg text-emerald-850 font-bold text-[10px]">
                    {publisherNotice}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-450 uppercase">Session Group Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rawlings Maker Workshop: 3D Printing"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-450 uppercase">Category</label>
                    <select
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value as any)}
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="Community Education">Community Education</option>
                      <option value="Family Activity">Family Activity</option>
                      <option value="Book Club">Book Club</option>
                      <option value="Student Resources">Student Resources</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-450 uppercase">Library Branch</label>
                    <select
                      value={eventBranch}
                      onChange={(e) => setEventBranch(e.target.value)}
                      className="w-full bg-white border rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {PUEBLO_LIBRARIES.map(b => (
                        <option key={b.id} value={b.name}>{b.name.split(" Library")[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-450 uppercase">Recurrence / Date</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saturdays, June 20"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-450 uppercase">Time Interval</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2:00 PM - 3:30 PM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-450 uppercase">Assembly Room / Floor Location</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Floor Teen Lounge"
                    value={eventRoom}
                    onChange={(e) => setEventRoom(e.target.value)}
                    className="w-full bg-white border rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-450 uppercase">Activity Syllabus / description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide a clear, inviting outline of book lists, computer requirements, or age limits..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="w-full bg-white border rounded-lg p-2 focus:outline-none focus:border-stone-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-950 text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Publish to Pueblo Calendar
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* OTHER DIRECTORIES RENDERING */}
      {activeCatalog === "government" && (
        <div className="bg-white border rounded-2xl p-5 shadow-3xs space-y-4 animate-fade-in text-xs font-sans">
          <div className="border-b pb-2">
            <h3 className="font-extrabold text-sm text-stone-900">🏛️ Pueblo Municipal & Government Services Directory</h3>
            <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">Direct lines and offices managing city-county administrative matters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo County Courthouse</strong>
              <p className="text-stone-500 leading-normal">Coordinates local legal registers, tax services, marriage licensing, and deed lookups.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 215 W 10th St</span>
                <span className="font-bold text-orange-705"><a href="tel:7195836000">(719) 583-6000</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo City Council & Administration</strong>
              <p className="text-stone-500 leading-normal">Administrative chamber determining city-wide planning, zoning permits, economic development, and trash setups.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 1 City Hall Place</span>
                <span className="font-bold text-orange-705"><a href="tel:7195532633">(719) 553-2633</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo County Sheriff & Jail Division</strong>
              <p className="text-stone-500 leading-normal">County-wide law enforcement, community safety patrols, and public detention records.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-455 border-t pt-1.5">
                <span>📍 909 Court St</span>
                <span className="font-bold text-orange-705"><a href="tel:7195836250">(719) 583-6250</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo Municipal Police Department</strong>
              <p className="text-stone-500 leading-normal">City-limits police force focusing on patrol sectors, neighborhood neighborhood watch networks, and local reports.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 200 S Main St</span>
                <span className="font-bold text-orange-705"><a href="tel:7195532502">(719) 553-2502</a></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCatalog === "healthcare" && (
        <div className="bg-white border rounded-2xl p-5 shadow-3xs space-y-4 animate-fade-in text-xs font-sans">
          <div className="border-b pb-2">
            <h3 className="font-extrabold text-sm text-stone-900">🏥 Emergency Services & Healthcare Directory</h3>
            <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">Critical response centers, trauma clinics, and public emergency support</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-rose-50/10 border border-rose-150 rounded-xl space-y-2">
              <strong className="text-rose-950 block font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-650 animate-ping"></span>
                Parkview Medical Center (Trauma Division)
              </strong>
              <p className="text-stone-600 leading-normal">Premium hospital complete with level III trauma wards, cardiological blocks, and intensive care beds.</p>
              <div className="flex justify-between items-center text-[10.5px] font-mono border-t border-rose-100 pt-1.5 text-stone-500">
                <span>📍 400 W 16th St</span>
                <span className="font-bold text-rose-700 font-sans"><a href="tel:7195844000">(719) 584-4000</a></span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/10 border border-rose-150 rounded-xl space-y-2">
              <strong className="text-rose-950 block font-black flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-650 animate-ping"></span>
                St. Mary-Corwin Hospital
              </strong>
              <p className="text-stone-600 leading-normal">Emergency medical hub, orthopedic specialty centers, cancer treatment, and diagnostic labs.</p>
              <div className="flex justify-between items-center text-[10.5px] font-mono border-t border-rose-100 pt-1.5 text-stone-500">
                <span>📍 1008 Minnequa Ave</span>
                <span className="font-bold text-rose-700 font-sans"><a href="tel:7195575685">(719) 557-5685</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo Department of Public Health & Environment</strong>
              <p className="text-stone-500 leading-normal">Sponsors clinic immunizations, local restaurant safety inspections, water testing records, and child safety programs.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 101 W 9th St</span>
                <span className="font-bold text-orange-705"><a href="tel:7195834300">(719) 583-4300</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo Community Health Center</strong>
              <p className="text-stone-500 leading-normal">Affordable medical access, neighborhood consultations, pediatrics, dental hygiene, and prescription assistance.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 300 Colorado Ave</span>
                <span className="font-bold text-orange-705"><a href="tel:7195438711">(719) 543-8711</a></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCatalog === "schools" && (
        <div className="bg-white border rounded-2xl p-5 shadow-3xs space-y-4 animate-fade-in text-xs font-sans">
          <div className="border-b pb-2">
            <h3 className="font-extrabold text-sm text-stone-900">🏫 Public Education & Schools Portal</h3>
            <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">Higher education schools, research libraries, and secondary school districts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-indigo-50/10 border border-indigo-150 rounded-xl space-y-2">
              <strong className="text-indigo-950 block font-bold">Colorado State University Pueblo (CSU Pueblo)</strong>
              <p className="text-stone-600 leading-normal">Regional comprehensive state university serving 4,000+ students. Noted engineering, nursing, agriculture, and business schools.</p>
              <div className="flex justify-between items-center text-[10.5px] font-mono border-t border-indigo-100 pt-1.5 text-stone-500">
                <span>📍 2200 Bonforte Blvd</span>
                <span className="font-bold text-indigo-705 font-sans"><a href="tel:7195492100">(719) 549-2100</a></span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/10 border border-indigo-150 rounded-xl space-y-2">
              <strong className="text-indigo-950 block font-bold">Pueblo Community College (PCC)</strong>
              <p className="text-stone-600 leading-normal">High-demand technical trade certifications, nursing associate degrees, engineering pathways, and adult high school equivalent classes.</p>
              <div className="flex justify-between items-center text-[10.5px] font-mono border-t border-indigo-100 pt-1.5 text-stone-500">
                <span>📍 900 W Orman Ave</span>
                <span className="font-bold text-indigo-705 font-sans"><a href="tel:7195493200">(719) 549-3200</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo Public School District 60 (City Limits)</strong>
              <p className="text-stone-500 leading-normal">Managing student registries, secondary bus schedules, free lunch programs, and athletic divisions across Pueblo City Schools.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 315 W 11th St</span>
                <span className="font-bold text-orange-705"><a href="tel:7195497100">(719) 549-7100</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo County School District 70 (Suburban Limits)</strong>
              <p className="text-stone-500 leading-normal">Serves regional Pueblo West, Salt Creek, Avondale, and Greenhorn Valley elementary and high school hubs.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 301 28th Lane</span>
                <span className="font-bold text-orange-705"><a href="tel:7192956500">(719) 295-6500</a></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCatalog === "museums" && (
        <div className="bg-white border rounded-2xl p-5 shadow-3xs space-y-4 animate-fade-in text-xs font-sans">
          <div className="border-b pb-2">
            <h3 className="font-extrabold text-sm text-stone-900">🌲 Parks, Heritage Museums, & Riverwalk</h3>
            <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">Scenic recreation zones, historic monuments, and heritage plazas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo Historic Arkansas Riverwalk (HARP)</strong>
              <p className="text-stone-500 leading-normal">Beautiful 32-acre urban riverwalk celebrating the river course reroute of 1921. Complete with gondola excursions and plaza gardens.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 101 N Union Ave</span>
                <span className="font-bold text-orange-705"><a href="tel:7195950242">(719) 595-0242</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Bessemer Steelworks Museum / CF&I</strong>
              <p className="text-stone-500 leading-normal">Preserving the legacy of the Colorado Fuel and Iron company steelworks. Great archives detailing immigration history and steel production.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 215 Canal St</span>
                <span className="font-bold text-orange-705"><a href="tel:7195649401">(719) 564-9401</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Lake Pueblo State Park (Pueblo Reservoir)</strong>
              <p className="text-stone-500 leading-normal">Over 4,600 acres of open water boating, water skiing, canyon hiking trails, hookup camping, and fishing slots.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 640 Pueblo Reservoir Rd</span>
                <span className="font-bold text-orange-705"><a href="tel:7195619320">(719) 561-9320</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Pueblo City Park & Pueblo Zoo</strong>
              <p className="text-stone-500 leading-normal">Spacious public park boasting historic wooden carousels, softball fields, open-air swimming, and a fully accredited zoo system.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 3455 Nectarine St</span>
                <span className="font-bold text-orange-705"><a href="tel:7195611452">(719) 561-1452</a></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCatalog === "utilities" && (
        <div className="bg-white border rounded-2xl p-5 shadow-3xs space-y-4 animate-fade-in text-xs font-sans">
          <div className="border-b pb-2">
            <h3 className="font-extrabold text-sm text-stone-900">🔌 Pueblo Public Utilities & Services</h3>
            <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">Municipal water boards, billing offices, and grid maintenance registries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-amber-50/10 border border-amber-250 rounded-xl space-y-2">
              <strong className="text-amber-950 block font-bold">Board of Water Works of Pueblo</strong>
              <p className="text-stone-600 leading-normal">Manages city drinking water safety, filtration channels, residential hookups, and commercial accounts.</p>
              <div className="flex justify-between items-center text-[10.5px] font-mono border-t border-amber-100 pt-1.5 text-stone-500">
                <span>📍 319 W 4th St</span>
                <span className="font-bold text-amber-900"><a href="tel:7195840250">(719) 584-0250</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Black Hills Energy (Pueblo Gas Division)</strong>
              <p className="text-stone-500 leading-normal">Natural gas heating service grid setups, safety checks, and account setups.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 105 S Victoria Ave</span>
                <span className="font-bold text-orange-705"><a href="tel:8888905554">(888) 890-5554</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">San Isabel Electric Association (Pueblo West Division)</strong>
              <p className="text-stone-500 leading-normal">Providing reliable power distribution cooperative grids across regional Pueblo West and county fields.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 781 E Industrial Blvd</span>
                <span className="font-bold text-orange-705"><a href="tel:8002797432">(800) 279-7432</a></span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border rounded-xl space-y-2">
              <strong className="text-stone-900 block font-bold">Xcel Energy Colorado</strong>
              <p className="text-stone-500 leading-normal">Supplying electric power grids, billing plans, smart meters, and solar connections across Pueblo city boundaries.</p>
              <div className="flex gap-4 text-[10.5px] font-mono text-stone-450 border-t pt-1.5">
                <span>📍 Outage Line / Info</span>
                <span className="font-bold text-orange-705"><a href="tel:8008954999">(800) 895-4999</a></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transit & Live Radar quick inclusion */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 md:p-5 shadow-3xs space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-orange-700 animate-[spin_10s_linear_infinite]" />
          <div>
            <h3 className="font-sans font-black text-xs text-stone-900 leading-none">Pueblo Real-Time Transit & Meteorological Panel</h3>
            <p className="text-[9.5px] text-stone-400 font-mono mt-0.5">Immediate satellite coordinates, wind, and live transit estimates</p>
          </div>
        </div>
        
        <WeatherTransitHub favoritedRouteIds={favoritedRouteIds} onToggleFavoriteRoute={onToggleFavoriteRoute} />
      </div>

    </div>
  );
}
