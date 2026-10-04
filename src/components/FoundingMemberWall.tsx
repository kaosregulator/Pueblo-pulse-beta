import React, { useState } from "react";
import { Award, Trophy, Users, ShieldAlert, Sparkles, Star, Zap, Network, ArrowUpRight } from "lucide-react";

export interface FoundingMember {
  id: string;
  name: string;
  role: string;
  badge: "Founding Resident" | "First 100 Members" | "First 500 Members";
  description: string;
  contributions: number;
  reputationPoints: number;
}

const FOUNDING_MEMBERS_DATA: FoundingMember[] = [
  {
    id: "user_chris",
    name: "Christopher Osorio",
    role: "Verified Resident",
    badge: "Founding Resident",
    description: "Pueblo History Curator & Chili Cookoff Activist. Contributed 45+ historical archives and moderated eastside forums.",
    contributions: 52,
    reputationPoints: 1240
  },
  {
    id: "user_sofia",
    name: "Sofia Lopez",
    role: "Verified Resident",
    badge: "First 100 Members",
    description: "Belmont Neighborhood Leader. Actively shares retail clearances and supports digital local commerce.",
    contributions: 31,
    reputationPoints: 850
  },
  {
    id: "user_pete",
    name: "Pete Giadone",
    role: "City Moderator",
    badge: "Founding Resident",
    description: "Mesa Farming District Advocate. Shares agricultural weather alerts and Pueblo Chile recipes.",
    contributions: 68,
    reputationPoints: 2100
  },
  {
    id: "user_tom",
    name: "Tom Martinez",
    role: "Event Organizers",
    badge: "First 100 Members",
    description: "Riverwalk HARP Director. Promotes local fundraisers and concert directories.",
    contributions: 24,
    reputationPoints: 590
  },
  {
    id: "user_sarah",
    name: "Sarah Jenkins",
    role: "Standard User",
    badge: "First 500 Members",
    description: "CSU Pueblo Belmont Student. Volunteers at after-school homework centers at Lucero Library.",
    contributions: 14,
    reputationPoints: 340
  }
];

interface FoundingMemberWallProps {
  userProfile: any;
  onJoinProgram?: () => void;
}

export default function FoundingMemberWall({ userProfile, onJoinProgram }: FoundingMemberWallProps) {
  const [members, setMembers] = useState<FoundingMember[]>(FOUNDING_MEMBERS_DATA);
  const [hasJoinedLocalWall, setHasJoinedLocalWall] = useState(false);

  // Reputation Levels helper
  const getReputationLevel = (pts: number) => {
    if (pts >= 2000) return { title: "👑 Pueblo Legend", color: "text-amber-800 bg-amber-50" };
    if (pts >= 1000) return { title: "🔥 Super Citizen", color: "text-orange-850 bg-orange-50" };
    if (pts >= 500) return { title: "🛡️ District Champion", color: "text-indigo-850 bg-indigo-50" };
    return { title: "🌱 Active Resident", color: "text-stone-650 bg-stone-100" };
  };

  const currentRep = getReputationLevel(userProfile.points || 0);

  // Apply Founding badge to user themselves
  const handleJoinSupporterWall = () => {
    if (hasJoinedLocalWall) return;

    const userBadge: FoundingMember["badge"] = 
      members.length < 2 ? "Founding Resident" : members.length < 5 ? "First 100 Members" : "First 500 Members";

    const userEntry: FoundingMember = {
      id: userProfile.id || "my_profile",
      name: userProfile.name || "My Account",
      role: userProfile.role || "Verified User",
      badge: userBadge,
      description: "Dedicated Steel City Community Supporter. Actively building community threads, reading libraries catalogs, and supporting local merchants.",
      contributions: 12,
      reputationPoints: userProfile.points || 150
    };

    setMembers(prev => [userEntry, ...prev]);
    setHasJoinedLocalWall(true);
    if (onJoinProgram) onJoinProgram();
  };

  return (
    <div className="space-y-6" id="pueblo-founding-wall">
      
      {/* Wall Header */}
      <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 text-white rounded-2xl p-5 shadow-sm border border-amber-850 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 opacity-15 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-amber-400 via-yellow-600 to-transparent"></div>
        <div className="space-y-1.5 z-10 relative max-w-xl">
          <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-black">Early Supporters</span>
          <h2 className="text-lg font-sans font-black tracking-tight leading-tighter flex items-center gap-2">
            🥇 Steel City Community Founding Member Program
          </h2>
          <p className="text-[11.5px] text-stone-250 leading-relaxed font-sans">
            Recognizing early adopters who joined our digital hometown during inception. Discover founding badges, review active reputation levels, and claim your place on the Founding Wall.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tier 1 Badge Card */}
        <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-3xs text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rounded-bl-full flex items-center justify-center font-bold">
            🥇
          </div>
          <Award className="w-8 h-8 text-amber-700 mx-auto" />
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-stone-950 text-xs">Founding Resident</h4>
            <p className="text-[10px] text-stone-450 font-mono uppercase tracking-wider">Premium Elite Status</p>
          </div>
          <p className="text-[11px] text-stone-500 leading-normal font-sans">
            Awarded to early pioneers of Steel City Community who shaped discussions and supported local commerce.
          </p>
        </div>

        {/* Tier 2 Badge Card */}
        <div className="bg-white border rounded-2xl p-4 shadow-3xs text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-500/10 rounded-bl-full flex items-center justify-center font-bold">
            🥈
          </div>
          <Trophy className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-stone-950 text-xs">First 100 Members</h4>
            <p className="text-[10px] text-stone-450 font-mono uppercase tracking-wider">Advocate Status</p>
          </div>
          <p className="text-[11px] text-stone-500 leading-normal font-sans">
            Granted to residents joining before our first city council demonstration. Strong reputation anchors.
          </p>
        </div>

        {/* Tier 3 Badge Card */}
        <div className="bg-white border rounded-2xl p-4 shadow-3xs text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-orange-550/10 rounded-bl-full flex items-center justify-center font-bold">
            🥉
          </div>
          <Users className="w-8 h-8 text-orange-600 mx-auto" />
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-stone-950 text-xs">First 500 Members</h4>
            <p className="text-[10px] text-stone-450 font-mono uppercase tracking-wider">Supporter Status</p>
          </div>
          <p className="text-[11px] text-stone-500 leading-normal font-sans">
            Commemorating early neighbors cataloging events, review boards, and lost pet updates.
          </p>
        </div>

      </div>

      {/* Main Grid: Supporter Wall (Left 8 cols) & Personal Stats Reputation (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Founding Wall Feed (Left 8 cols) */}
        <div className="lg:col-span-8 bg-white border border-stone-250 rounded-2xl p-4 md:p-5 shadow-3xs space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="font-sans font-black text-sm text-stone-900 flex items-center gap-1.5 leading-none">
                🏛️ The Pueblo founding Wall
              </h3>
              <p className="text-[10.5px] text-stone-400 font-mono mt-0.5">Honoring our pioneer contributors and district leaders</p>
            </div>
            
            {!hasJoinedLocalWall && (
              <button
                type="button"
                onClick={handleJoinSupporterWall}
                className="bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 animate-pulse uppercase"
              >
                Claim Space <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
            {members.map((m) => {
              const repLevel = getReputationLevel(m.reputationPoints);
              return (
                <div key={m.id} className="bg-stone-50/50 hover:bg-stone-50 border rounded-xl p-3 space-y-2 border-stone-200/60 relative">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs text-stone-900">{m.name}</span>
                        <span className="bg-amber-500/10 text-amber-900 text-[8px] font-black uppercase font-mono px-1.5 rounded">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.2">{m.role} • {m.contributions} total contributions</p>
                    </div>

                    <span className={`${repLevel.color} text-[8px] font-black uppercase font-mono px-1.5 rounded border border-stone-200/50`}>
                      {repLevel.title}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-stone-605 leading-relaxed font-sans mt-1">
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reputation Levels & Weekly Challenge Panel (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Reputation Info Card */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h4 className="font-sans font-bold text-xs text-stone-900 border-b pb-1.5 flex items-center gap-1.5">
              🏆 Reputation & Levels Engine
            </h4>
            
            <div className="space-y-2 text-[11px] font-sans">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase text-stone-400">Your Current Points</span>
                <span className="font-black text-orange-750 text-xs">{userProfile.points || 0} pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase text-stone-400">Class Rank</span>
                <span className={`font-black uppercase text-[8px] px-1.5 rounded ${currentRep.color}`}>{currentRep.title}</span>
              </div>

              {/* Progress bar to next level */}
              <div className="space-y-1 pt-1.5">
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border">
                  <div className="bg-orange-700 h-full transition-all" style={{ width: `${Math.min(((userProfile.points || 0) / 1000) * 100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-stone-400 font-bold">
                  <span>0 PTS</span>
                  <span>NEXT REPUTATION EXPANSION at 1000 PTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly civic challenges */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h5 className="font-sans font-bold text-xs text-stone-900 border-b pb-1.5 flex items-center gap-1.5">
              🎯 Pueblo Active Civic Challenges
            </h5>

            <div className="space-y-2 text-[11.5px] font-sans">
              <div className="p-2 bg-amber-50/15 border border-amber-200 rounded-xl space-y-1">
                <strong className="text-amber-900 block font-black text-[10px]">✨ Bessemer Slopper Reviewer (+40 PTS)</strong>
                <p className="text-stone-650 leading-relaxed text-[10px]">Write an authentic review on a local business menu item in the Bessemer district.</p>
              </div>

              <div className="p-2 bg-stone-50 border rounded-xl space-y-1">
                <strong className="text-stone-800 block font-bold text-[10px]">📻 Event RSVP Reminder Alert (+15 PTS)</strong>
                <p className="text-stone-500 leading-relaxed text-[10px]">Mark yourself as "Going" or "Interested" on any local community festivals or library workshops.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
