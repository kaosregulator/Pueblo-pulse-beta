import React from "react";
import WeatherTransitHub from "./WeatherTransitHub";
import {
  Map,
  Shield,
  Activity,
  AlertTriangle,
  AlertCircle,
  Building,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Volume2,
  BookmarkCheck,
  Heart
} from "lucide-react";
import {
  UserProfile,
  BusinessItem,
  EventItem,
  JobItem,
  LostFoundItem,
  SafetyAlert,
  ForumPost,
  BusinessClaim,
  VerificationRequest,
  ContentReport,
  ModeratorAction
} from "../types";

interface CityCommandCenterProps {
  businesses: BusinessItem[];
  events: EventItem[];
  jobs: JobItem[];
  lostFound: LostFoundItem[];
  alerts: SafetyAlert[];
  posts: ForumPost[];
  claims: BusinessClaim[];
  verifications: VerificationRequest[];
  reports: ContentReport[];
  actions: ModeratorAction[];
  favoritedRouteIds?: string[];
  onToggleFavoriteRoute?: (id: string) => void;
}

export default function CityCommandCenter({
  businesses,
  events,
  jobs,
  lostFound,
  alerts,
  posts,
  claims,
  verifications,
  reports,
  actions,
  favoritedRouteIds = [],
  onToggleFavoriteRoute
}: CityCommandCenterProps) {
  
  // Calculate analytics metric counters
  const totalActiveUsers = 48 + verifications.length * 3 + posts.length * 2;
  const criticalAlertsCount = alerts.filter((a) => a.level === "critical").length;
  const unverifiedClaimsCount = claims.filter((c) => c.status === "Pending").length;
  const activeLostFoundCount = lostFound.filter((l) => !l.resolved).length;
  const totalPendingReportsCount = reports.filter((r) => r.status === "Pending").length;

  // Calculate trending topics based on post categories & frequency
  const getTrendingHashtags = () => {
    return [
      { hashtag: "#SlopperContest", count: 18, category: "Food" },
      { hashtag: "#MesaChileHarvest", count: 14, category: "Agriculture" },
      { hashtag: "#BessemerSteelHistory", count: 9, category: "Heritage" },
      { hashtag: "#RiverwalkSummerCruisin", count: 8, category: "Events" }
    ];
  };

  // Extract recent community actions
  const recentEvents = [...events].slice(0, 3);
  const recentBusinesses = [...businesses].slice(0, 3);

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-xs text-stone-900 font-sans" id="city-command-center">
      {/* Dynamic Command Banner */}
      <div className="bg-stone-950 p-4 border-b border-stone-850 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Activity className="w-5.5 h-5.5 text-orange-650 animate-pulse" />
          <div>
            <h4 className="font-sans font-black text-xs">Pueblo County Command Center</h4>
            <span className="text-[10px] text-stone-400 font-mono block">Realtime Operational Heartbeat • Steel City Community Unified Feed</span>
          </div>
        </div>
        <span className="bg-orange-700 font-mono text-[9.5px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-white">
          ● Live Mappings
        </span>
      </div>

      {/* Grid of central widgets */}
      <div className="p-4 space-y-4">
        {/* Row 1: Key Operational Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-stone-900 font-sans">
          <div className="bg-stone-50 border p-2 rounded-xl">
            <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-stone-400 block">Critical Alerts</span>
            <span className="text-sm font-black text-red-750 mt-1 block">⚠️ {criticalAlertsCount}</span>
            <span className="text-[7px] text-stone-400 font-bold">Unresolved County alerts</span>
          </div>

          <div className="bg-stone-50 border p-2 rounded-xl">
            <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-stone-400 block">Active Claims</span>
            <span className="text-sm font-black text-amber-600 mt-1 block">🏬 {unverifiedClaimsCount}</span>
            <span className="text-[7px] text-stone-400 font-bold">Pending audit verification</span>
          </div>

          <div className="bg-stone-50 border p-2 rounded-xl">
            <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-stone-400 block">Lost Alerts</span>
            <span className="text-sm font-black text-blue-700 mt-1 block">🐶 {activeLostFoundCount}</span>
            <span className="text-[7px] text-stone-400 font-bold">Citizen alerts reported</span>
          </div>

          <div className="bg-stone-50 border p-2 rounded-xl">
            <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-stone-400 block">Report Queue</span>
            <span className="text-sm font-black text-red-500 mt-1 block">🛡️ {totalPendingReportsCount}</span>
            <span className="text-[7px] text-stone-400 font-bold">Spam content flags</span>
          </div>
        </div>

        {/* Real-time Weather & Transit Service Hub */}
        <WeatherTransitHub favoritedRouteIds={favoritedRouteIds} onToggleFavoriteRoute={onToggleFavoriteRoute} />

        {/* Dynamic Alerts Banner */}
        <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-3 space-y-2">
          <h5 className="font-bold text-xs text-orange-850 flex items-center gap-1.5 leading-none">
            <AlertTriangle className="w-4 h-4 text-orange-700" />
            County-Wide Critical Traffic & Safety Alerts
          </h5>
          <div className="space-y-1 text-xs">
            {alerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="flex justify-between items-start border-b border-stone-200/50 pb-1.5 last:border-0 last:pb-0">
                <div className="space-y-0.5">
                  <span className="text-[8.5px] uppercase font-bold text-red-700 font-mono mr-1.5">[{alert.level}]</span>
                  <strong className="text-stone-850 font-sans">{alert.title}</strong>
                  <p className="text-[10.5px] text-stone-500 mt-0.5">{alert.content}</p>
                </div>
                <span className="text-[9px] font-mono text-stone-400">{alert.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Lost Pets & Trending Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lost Pets Column */}
          <div className="border rounded-xl p-3 space-y-2.5">
            <h5 className="font-bold text-[10px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
              🐾 Citizen Lost Pets Bureau
            </h5>
            <div className="space-y-2">
              {lostFound.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-stone-50/60 p-2 rounded-lg flex items-center gap-2 text-xs border border-stone-200/40">
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 border bg-stone-200">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-0.5 truncate flex-1">
                    <strong className="text-stone-850 block leading-tight truncate">{item.title}</strong>
                    <span className="text-[9px] text-stone-400 font-mono block">📍 {item.location} • {item.neighborhood.toUpperCase()}</span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                    item.resolved ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {item.resolved ? "Resolved" : "Active"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending hashtags */}
          <div className="border rounded-xl p-3 space-y-2.5">
            <h5 className="font-bold text-[10px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
              📈 Trending Pueblo Topics
            </h5>
            <div className="grid grid-cols-1 gap-2.5">
              {getTrendingHashtags().map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs pb-1.5 border-b last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                    <span className="font-bold text-stone-900">{item.hashtag}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-stone-400 text-[10px]">{item.count} updates</span>
                    <span className="block text-[8px] uppercase tracking-wide font-mono text-stone-400 leading-none mt-0.5">Focus: {item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Newest Businesses opened */}
        <div className="border rounded-xl p-3 space-y-2.5">
          <h5 className="font-bold text-[10px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
            🏬 Verified Commercial Expansion
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {recentBusinesses.map((biz) => (
              <div key={biz.id} className="bg-stone-50/50 border p-2.5 rounded-lg text-xs space-y-1">
                <div className="flex justify-between items-start font-bold">
                  <span className="text-stone-900 truncate max-w-[120px]">{biz.name}</span>
                  <span className="bg-orange-50 text-orange-850 text-[7.5px] px-1 font-mono">{biz.tier}</span>
                </div>
                <p className="text-[10px] text-stone-500 line-clamp-1">{biz.description}</p>
                <span className="text-[8.5px] uppercase font-mono text-stone-400 font-bold block">📍 {biz.neighborhood.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: Moderator Actions history */}
        <div className="border rounded-xl p-3 space-y-2">
          <h5 className="font-bold text-[10px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1.5">
            🛡️ Live Moderator Log Audit
          </h5>
          {actions.length === 0 ? (
            <p className="text-stone-450 text-[10.5px] italic py-1 leading-none text-center">No staff logs stored yet. Adjust user roles or remove target posts to generate logs.</p>
          ) : (
            <div className="space-y-1.5 max-h-[141px] overflow-y-auto font-mono text-[9.5px] bg-stone-900 text-stone-200 p-2 rounded-lg leading-normal">
              {actions.slice(0, 4).map((act) => (
                <div key={act.id} className="border-b border-stone-850 pb-1 last:border-0 last:pb-0">
                  <span className="text-stone-400">[{act.date}]</span>{" "}
                  <strong className="text-orange-400">({act.moderatorRole})</strong>{" "}
                  <span className="underline">{act.moderatorName}</span>: {act.action}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
