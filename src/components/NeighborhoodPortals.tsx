import React, { useState } from "react";
import {
  MapPin,
  TrendingUp,
  MessageSquare,
  Calendar,
  Building2,
  Users,
  Compass,
  History,
  ShieldCheck,
  Award,
  ChevronRight,
  Clock,
  Heart,
  Plus
} from "lucide-react";
import {
  UserProfile,
  NeighborhoodData,
  BusinessItem,
  EventItem,
  ForumPost,
  NeighborhoodID
} from "../types";
import { INITIAL_NEIGHBORHOODS } from "../dbMock";

interface NeighborhoodPortalsProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  businesses: BusinessItem[];
  events: EventItem[];
  posts: ForumPost[];
  onSelectPin: (type: string, item: any) => void;
  onAddPost: (newPost: ForumPost) => void;
}

export default function NeighborhoodPortals({
  userProfile,
  setUserProfile,
  businesses,
  events,
  posts,
  onSelectPin,
  onAddPost
}: NeighborhoodPortalsProps) {
  const [selectedHoodId, setSelectedHoodId] = useState<NeighborhoodID>("mesa");
  const [activeSubTab, setActiveSubTab] = useState<
    "feed" | "events" | "businesses" | "discussions" | "moderators" | "history" | "stats"
  >("feed");

  // Local discussions message board
  const [chatInput, setChatInput] = useState("");
  const [discussionThreads, setDiscussionThreads] = useState<{
    id: string;
    author: string;
    content: string;
    neighborhood: NeighborhoodID;
    date: string;
  }[]>([
    { id: "dsc-1", author: "Elena_Chile_Grower", content: "Water schedules for Mesa Lane 36 look a bit restricted this afternoon. Anyone else irrigating?", neighborhood: "mesa", date: "June 12, 2026" },
    { id: "dsc-2", author: "Steelworks_Archivist", content: "Found a 1910 high school yearbook from Minnequa Works school. Drop by the museum to check it!", neighborhood: "bessemer", date: "June 11, 2026" },
    { id: "dsc-3", author: "Pueblo_West_Rider", content: "Golf course traffic is high, but mountain views are gorgeous!", neighborhood: "pueblo_west", date: "June 12, 2026" }
  ]);

  // Select matching neighborhood master data
  const currentHoodData = INITIAL_NEIGHBORHOODS.find((h) => h.id === selectedHoodId) || INITIAL_NEIGHBORHOODS[0];

  // Filters
  const filteredPosts = posts.filter(
    (p) => p.neighborhood === selectedHoodId && p.category !== "announcement"
  );
  const filteredEvents = events.filter((e) => e.neighborhood === selectedHoodId);
  const filteredBusinesses = businesses.filter((b) => b.neighborhood === selectedHoodId);
  const filteredDiscussions = discussionThreads.filter((t) => t.neighborhood === selectedHoodId);

  // Submit local discussion message
  const handleSendDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;

    // GEOLENCE CHECK
    if (userProfile.simulatedInPuebloCounty === false) {
      alert("⚠️ GEOFENCE LOCK: Posting to local neighborhood chat boards requires local verification! You are currently simulated outside Pueblo County.");
      return;
    }

    const newMessage = {
      id: `dsc-${Date.now()}`,
      author: userProfile.name,
      content: chatInput,
      neighborhood: selectedHoodId,
      date: new Date().toLocaleDateString()
    };

    setDiscussionThreads((prev) => [newMessage, ...prev]);
    setChatInput("");
    alert("✓ Message published to local district chat!");
  };

  // Toggle neighborhood following bookmark
  const isFollowingIndex = (userProfile.followedNeighborhoods || []).includes(selectedHoodId);
  const handleFollowHoodToggle = () => {
    const list = userProfile.followedNeighborhoods || [];
    setUserProfile((prev) => {
      const updated = isFollowingIndex
        ? list.filter((id) => id !== selectedHoodId)
        : [...list, selectedHoodId];
      return { ...prev, followedNeighborhoods: updated };
    });
    alert(isFollowingIndex ? "Removed neighborhood channel from my bookmarked list." : "District channel added to my saved dashboard!");
  };

  // Neighborhood Moderator names mapper (mock)
  const getSponsorModerators = (hood: NeighborhoodID) => {
    switch (hood) {
      case "bessemer":
        return [{ name: "Frank Minnequa", role: "Bessemer Lead Moderator", badge: "Steel Mill Veteran", email: "frank@pueblopulse.co" }];
      case "belmont":
        return [{ name: "Professor Belmont", role: "Belmont District Auditor", badge: "CSU Pueblo Educator", email: "belmont_aud@pueblopulse.co" }];
      case "mesa":
        return [{ name: "Elena Giadone", role: "Mesa Area Field Guard", badge: "Chile Grower Association", email: "elena@pueblopulse.co" }];
      case "downtown":
        return [{ name: "Chris Riverwalk", role: "Downtown Operations Admin", badge: "Civic Planner", email: "chris_dt@pueblopulse.co" }];
      default:
        return [{ name: "Neighborhood Guard", role: "Community Moderator", badge: "Local Resident", email: "safety_moderator@pueblopulse.co" }];
    }
  };

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-3xs text-stone-900 font-sans" id="neighborhood-portal-panel">
      {/* Selector Heading Area */}
      <div className="bg-stone-950 p-4 border-b border-stone-850 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="w-5 h-5 text-orange-650" />
          <div>
            <h4 className="text-white font-bold text-xs">Pueblo District Channels</h4>
            <p className="text-[10px] text-stone-400 font-mono">Select a neighborhood portal to synchronize localized telemetry.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Active selection dropdown */}
          <select
            value={selectedHoodId}
            onChange={(e) => setSelectedHoodId(e.target.value as NeighborhoodID)}
            className="bg-stone-900 border border-stone-750 text-stone-200 text-xs py-1 px-2.5 rounded-lg focus:outline-none uppercase font-mono tracking-wide"
          >
            {INITIAL_NEIGHBORHOODS.map((h) => (
              <option key={h.id} value={h.id}>
                📍 {h.name}
              </option>
            ))}
          </select>

          {/* Follow Channel block */}
          <button
            onClick={handleFollowHoodToggle}
            className={`text-[10px] font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
              isFollowingIndex ? "bg-stone-800 text-amber-400" : "bg-orange-700 text-white hover:bg-orange-850"
            }`}
          >
            {isFollowingIndex ? "★ Bookmarked" : "☆ Follow Node"}
          </button>
        </div>
      </div>

      {/* Description Header Card */}
      <div className="p-4 bg-stone-50/55 border-b space-y-1.5">
        <h3 className="font-sans font-black text-sm text-stone-950 tracking-tight leading-none uppercase">
          {currentHoodData.name} Segment Portal
        </h3>
        <p className="text-stone-600 text-xs leading-relaxed font-sans mt-0.5">
          {currentHoodData.overview}
        </p>
      </div>

      {/* Portal Tabs Bar */}
      <div className="flex border-b overflow-x-auto text-[11px] font-bold bg-stone-100 p-1 gap-1">
        <button
          onClick={() => setActiveSubTab("feed")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeSubTab === "feed" ? "bg-white text-stone-955 shadow-2xs border" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Feed ({filteredPosts.length})
        </button>

        <button
          onClick={() => setActiveSubTab("events")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeSubTab === "events" ? "bg-white text-stone-955 shadow-2xs border" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Events ({filteredEvents.length})
        </button>

        <button
          onClick={() => setActiveSubTab("businesses")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeSubTab === "businesses" ? "bg-white text-stone-955 shadow-2xs border" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Shops ({filteredBusinesses.length})
        </button>

        <button
          onClick={() => setActiveSubTab("discussions")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeSubTab === "discussions" ? "bg-white text-stone-955 shadow-2xs border" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat board ({filteredDiscussions.length})
        </button>

        <button
          onClick={() => setActiveSubTab("moderators")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeSubTab === "moderators" ? "bg-white text-stone-955 shadow-2xs border" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Staff
        </button>

        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeSubTab === "history" ? "bg-white text-stone-955 shadow-2xs border" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Heritage Space
        </button>

        <button
          onClick={() => setActiveSubTab("stats")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeSubTab === "stats" ? "bg-white text-stone-955 shadow-2xs border" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Stats
        </button>
      </div>

      {/* Sub-tab Contents container */}
      <div className="p-4" id="neighborhood-portal-results">
        
        {/* TAB 1: DISTRICT FEED */}
        {activeSubTab === "feed" && (
          <div className="space-y-3.5 animate-fade-in">
            {filteredPosts.length === 0 ? (
              <p className="text-stone-400 text-xs italic font-sans text-center py-6">No recent categorized posts for this district.</p>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-stone-50 border p-3 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <strong className="text-stone-850">{post.author}</strong>
                      <span className="bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded font-mono font-normal">
                        Type: {post.postType}
                      </span>
                    </div>
                    <h5 className="font-bold text-stone-950 mt-1">{post.title}</h5>
                    <p className="text-stone-600 leading-normal font-sans">{post.content}</p>
                    <div className="flex gap-2 pt-1 border-t border-stone-200/50 mt-2 text-[10px] text-stone-400 font-mono">
                      <span>❤️ {post.likes.length} Likes</span>
                      <span>💬 {post.comments.length} Comments</span>
                      <button
                        onClick={() => onSelectPin("post", post)}
                        className="text-orange-850 hover:underline font-bold ml-auto"
                      >
                        Join thread
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DISTRICT EVENTS */}
        {activeSubTab === "events" && (
          <div className="space-y-3 animate-fade-in">
            {filteredEvents.length === 0 ? (
              <p className="text-stone-400 text-xs italic font-sans text-center py-6">No localized scheduled events in this sector.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredEvents.map((evt) => (
                  <div key={evt.id} className="bg-stone-50 border p-3 rounded-xl flex flex-col justify-between text-xs space-y-2">
                    <div className="space-y-1">
                      <strong className="text-stone-900 block font-sans tracking-tight">{evt.title}</strong>
                      <span className="text-[9.5px] text-stone-400 font-mono font-bold uppercase block">{evt.category}</span>
                      <p className="text-stone-500 font-sans leading-normal line-clamp-2 mt-1">{evt.description}</p>
                    </div>
                    <div className="font-mono text-[9px] text-orange-850 pt-2 border-t">
                      <span>📅 {evt.date} • {evt.time}</span>
                    </div>
                    <button
                      onClick={() => onSelectPin("event", evt)}
                      className="bg-stone-900 text-white font-bold text-[9.5px] py-1 rounded hover:bg-stone-800"
                    >
                      Inspect RSVPs Map Pin
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISTRICT BUSINESSES */}
        {activeSubTab === "businesses" && (
          <div className="space-y-3 animate-fade-in">
            {filteredBusinesses.length === 0 ? (
              <p className="text-stone-400 text-xs italic font-sans text-center py-6">No registered local shops mapped here yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredBusinesses.map((biz) => (
                  <div key={biz.id} className="bg-stone-50 border p-3 rounded-xl flex flex-col justify-between text-xs space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-stone-900 block font-bold truncate max-w-[130px]">{biz.name}</strong>
                        {biz.claimed ? (
                          <span className="bg-emerald-50 text-emerald-800 font-bold border border-emerald-150 text-[8px] px-1 rounded">CLAIMED</span>
                        ) : (
                          <span className="bg-stone-200 text-stone-600 font-mono text-[8px] px-1 rounded">UNCLAIMED</span>
                        )}
                      </div>
                      <span className="text-[9.5px] text-stone-450 block uppercase font-mono">{biz.category}</span>
                      <p className="text-stone-500 font-sans leading-normal line-clamp-2 mt-1">{biz.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t text-[9.5px] text-stone-400 font-mono">
                      <span>⭐ {biz.rating} Rating</span>
                      <span>📞 {biz.phone}</span>
                    </div>
                    <button
                      onClick={() => onSelectPin("business", biz)}
                      className="bg-stone-900 text-stone-100 hover:bg-stone-800 text-[10px] font-bold py-1 rounded transition-all cursor-pointer"
                    >
                      View Slopper Menu & Deals
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DISTRICT CHAT BOARD */}
        {activeSubTab === "discussions" && (
          <div className="space-y-4 animate-fade-in">
            {/* Live posting chat input block */}
            <form onSubmit={handleSendDiscussion} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Post a message/ask a question in ${currentHoodData.name}...`}
                className="flex-1 bg-stone-50 border p-2 text-xs rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="bg-stone-950 text-white hover:bg-stone-850 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Send
              </button>
            </form>

            <div className="space-y-2">
              {filteredDiscussions.length === 0 ? (
                <p className="text-stone-400 text-xs italic font-sans text-center py-4">No localized chats posted yet. Start the conversation!</p>
              ) : (
                filteredDiscussions.map((t) => (
                  <div key={t.id} className="bg-stone-50 border p-3 rounded-xl text-xs space-y-1 animate-fade-in">
                    <div className="flex justify-between font-mono text-[9px] text-stone-440">
                      <strong>👤 {t.author}</strong>
                      <span>{t.date}</span>
                    </div>
                    <p className="text-stone-700 leading-normal font-sans">"{t.content}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: NEIGHBORHOOD MODERATORS */}
        {activeSubTab === "moderators" && (
          <div className="space-y-4 animate-fade-in">
            <h5 className="font-bold text-xs text-stone-900 border-b pb-1">Assigned Support Staff</h5>
            <div className="space-y-2.5">
              {getSponsorModerators(selectedHoodId).map((mod, i) => (
                <div key={i} className="bg-stone-50 border p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <h6 className="font-bold text-stone-900">{mod.name}</h6>
                    <p className="text-stone-500 leading-none">{mod.role}</p>
                    <span className="inline-block bg-orange-100 text-orange-800 text-[8.5px] tracking-wide font-mono px-1.5 py-0.2 rounded font-bold uppercase">{mod.badge}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9.5px] font-mono text-stone-400">{mod.email}</p>
                    <button
                      onClick={() => alert(`Report flagged to ${mod.name} securely!`)}
                      className="text-red-600 hover:underline font-bold text-[10px] mt-2 block"
                    >
                      Flag issues to moderator
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border rounded-xl bg-orange-50/50 text-[11px] text-stone-605 font-sans leading-relaxed">
              <strong>Need localized authority permissions?</strong> Submit your Utility bill proof inside the **REP** main tab to claim verification and request local moderator roles from the City Administrative council!
            </div>
          </div>
        )}

        {/* TAB 6: HISTORICAL CONTENT PRESEEDS */}
        {activeSubTab === "history" && (
          <div className="space-y-4 animate-fade-in">
            <h5 className="font-bold text-xs text-stone-900 border-b pb-1 flex items-center gap-1">
              <Award className="w-4 h-4 text-orange-700 font-black" />
              Heritage Memory Registers: Local Oral Archives
            </h5>

            <p className="text-stone-600 text-xs leading-relaxed font-sans mt-1">
              {currentHoodData.history || "No historical files preseeded for this sector channel."}
            </p>

            {currentHoodData.timeline && currentHoodData.timeline.length > 0 && (
              <div className="relative border-l pl-4 border-stone-250 ml-2 space-y-4 pt-2">
                {currentHoodData.timeline.map((item, idx) => (
                  <div key={idx} className="relative" id={`timeline-item-${idx}`}>
                    {/* Ring indicator */}
                    <div className="absolute -left-6.5 top-0.5 bg-orange-700 w-2.5 h-2.5 rounded-full border-2 border-white shadow"></div>
                    <div className="space-y-0.5 text-xs">
                      <span className="font-mono font-bold text-orange-850 bg-orange-50 border px-1.5 py-0.2 rounded text-[9.5px]">YEAR {item.year}</span>
                      <h6 className="font-bold text-stone-900 mt-1">{item.title}</h6>
                      <p className="text-stone-500 leading-normal">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: STATISTICS COUNTER CHART */}
        {activeSubTab === "stats" && (
          <div className="space-y-3.5 animate-fade-in">
            <h5 className="font-bold text-xs text-stone-900 border-b pb-1">District Demographics & Telemetry</h5>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border p-2.5 rounded-xl bg-stone-50/40">
                <span className="text-[9px] uppercase tracking-wide font-mono text-stone-400 block font-bold">Safety Index</span>
                <span className="text-md font-black text-emerald-850 mt-1 block">🏆 92% Rank</span>
                <span className="text-[7.5px] text-stone-400">Pueblo County average: 78%</span>
              </div>
              <div className="border p-2.5 rounded-xl bg-stone-50/40">
                <span className="text-[9px] uppercase tracking-wide font-mono text-stone-400 block font-bold">Local Shops Count</span>
                <span className="text-md font-black text-stone-900 mt-1 block">{filteredBusinesses.length} active</span>
                <span className="text-[7.5px] text-stone-400">Registered commercial sites</span>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-3 space-y-2">
              <span className="text-[10px] text-stone-400 uppercase font-mono block">Estimated Monthly Foot Traffic (Downtown access)</span>
              <div className="flex items-end gap-2.5 h-16 pt-2 font-mono text-[9px] text-stone-400">
                <div className="flex-1 bg-stone-100 rounded flex flex-col justify-end text-center p-1" style={{ height: "40%" }}>Mon</div>
                <div className="flex-1 bg-stone-100 rounded flex flex-col justify-end text-center p-1" style={{ height: "55%" }}>Tue</div>
                <div className="flex-1 bg-orange-700/80 rounded flex flex-col justify-end text-center text-white font-bold p-1 animate-pulse" style={{ height: "95%" }}>Wed</div>
                <div className="flex-1 bg-stone-100 rounded flex flex-col justify-end text-center p-1" style={{ height: "70%" }}>Thu</div>
                <div className="flex-1 bg-stone-100 rounded flex flex-col justify-end text-center p-1" style={{ height: "82%" }}>Fri</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
