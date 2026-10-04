import React, { useState } from "react";
import {
  User,
  Shield,
  Award,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BarChart2,
  Star,
  Users,
  Compass,
  Heart,
  Bookmark,
  Share2,
  Store,
  BookOpen,
  MapPin,
  Check
} from "lucide-react";
import { UserProfile, UserRole, BadgeType } from "../types";
import AvatarCreator, { SvgAvatar } from "./AvatarCreator";

interface ProfileModTabProps {
  userProfile: any;
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
  onChangeRole: (newRole: UserRole) => void;
  onClearFlags: () => void;
  posts: any[];
  businesses: any[];
  onSelectPin: (type: string, item: any) => void;
  onTriggerOnboarding?: () => void;
}

export default function ProfileModTab({
  userProfile,
  setUserProfile,
  onChangeRole,
  onClearFlags,
  posts,
  businesses,
  onSelectPin,
  onTriggerOnboarding
}: ProfileModTabProps) {
  const [activeSegment, setActiveSegment] = useState<"profile" | "folders" | "moderator">("profile");
  const [roleChangeNotice, setRoleChangeNotice] = useState<string | null>(null);

  // Flagged report queue files
  const [mockFlags, setMockFlags] = useState([
    { id: "flag-1", type: "Spam classified", content: "Collect payout of $500 free within Pueblo! Register email fast...", reporter: "Pueblo_West_Guard" },
    { id: "flag-2", type: "Abusive reply", content: "Your chile stand has the worst roasters on the Mesa, down with Elena!", reporter: "Bessemer_Proud" }
  ]);

  const handleRoleSelection = (role: UserRole) => {
    onChangeRole(role);
    setRoleChangeNotice(role);
    setTimeout(() => {
      setRoleChangeNotice(null);
    }, 2500);
  };

  const handleRemoveFlag = (flagId: string) => {
    setMockFlags((prev) => prev.filter((f) => f.id !== flagId));
    alert("🛡️ Content suppressed securely.");
  };

  const handleRestoreFlag = (flagId: string) => {
    setMockFlags((prev) => prev.filter((f) => f.id !== flagId));
    alert("✓ Flag dismissed, content approved.");
  };

  // 1. Dynamic calculation of Reputation Badges based on points or current role/activity status:
  const checkBadgeUnlocked = (badge: string): boolean => {
    switch (badge) {
      case "Verified Resident":
        return userProfile.points >= 0; // Default unlocked
      case "Local Guide":
        return userProfile.points >= 100;
      case "Community Helper":
        return userProfile.points >= 200;
      case "Top Contributor":
        return userProfile.points >= 300;
      case "Business Owner":
        return userProfile.role === "Business Owner";
      case "Historian":
        // check if user saved historical posts or has history points
        return userProfile.points >= 150;
      case "Event Reporter":
        return userProfile.points >= 120;
      case "Food Reviewer":
        return userProfile.points >= 80;
      default:
        return false;
    }
  };

  const BADGES_DATABASE = [
    { name: "Verified Resident", label: "🏅 Verified Resident", description: "Identity verified within Pueblo County limits.", criteria: "Default Unlocked" },
    { name: "Local Guide", label: "🏅 Local Guide", description: "Earned 100+ reputation points assisting neighbors.", criteria: "Reach 100 Rep points" },
    { name: "Food Reviewer", label: "🏅 Food Reviewer", description: "Active restaurant, bakery, and food truck critic.", criteria: "Reach 80 Rep points" },
    { name: "Event Reporter", label: "🏅 Event Reporter", description: "Active contributor reporting upcoming local festivals.", criteria: "Reach 120 Rep points" },
    { name: "Historian", label: "🏅 Historian", description: "Heritage memory keeper recording Steel Mill CF&I stories.", criteria: "Reach 150 Rep points" },
    { name: "Community Helper", label: "🏅 Community Helper", description: "Earned 200+ points supporting public safety and advice.", criteria: "Reach 200 Rep points" },
    { name: "Business Owner", label: "🏅 Business Owner", description: "Claimed owner managing Premium partner portals.", criteria: "Set profile role to Business Owner" },
    { name: "Top Contributor", label: "🏅 Top Contributor", description: "Elite resident with 300+ total cumulative points.", criteria: "Reach 300 Rep points" }
  ];

  // Helper action to unfollow users
  const handleUnfollowUser = (author: string) => {
    const list = userProfile.followedUsers || [];
    setUserProfile((prev: any) => ({
      ...prev,
      followedUsers: list.filter((u: string) => u !== author)
    }));
    alert(`Unfollowed resident: ${author}`);
  };

  // Helper action to unfollow business
  const handleUnfollowBusiness = (bizId: string) => {
    const list = userProfile.followedBusinesses || [];
    setUserProfile((prev: any) => ({
      ...prev,
      followedBusinesses: list.filter((id: string) => id !== bizId)
    }));
    alert("Unfollowed business listing.");
  };

  // Helper action to unfollow neighborhood
  const handleUnfollowNeighborhood = (hoodId: string) => {
    const list = userProfile.followedNeighborhoods || [];
    setUserProfile((prev: any) => ({
      ...prev,
      followedNeighborhoods: list.filter((id: string) => id !== hoodId)
    }));
    alert("Removed neighborhood bookmark.");
  };

  // Helper action to unsave posts
  const handleUnsavePost = (postId: string) => {
    const list = userProfile.savedPosts || [];
    setUserProfile((prev: any) => ({
      ...prev,
      savedPosts: list.filter((id: string) => id !== postId)
    }));
    alert("Removed post from my saved bookmarks list.");
  };

  return (
    <div className="space-y-6" id="profile-mod-tab-root">
      
      {/* Role Change Response Banner */}
      {roleChangeNotice && (
        <div className="bg-emerald-50 border border-emerald-350 p-3 rounded-xl text-emerald-800 text-xs font-bold leading-normal flex items-center gap-1.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Role changes active! Switched local permissions to: {roleChangeNotice}</span>
        </div>
      )}

      {/* Tabs segment */}
      <div className="flex border border-stone-250 bg-stone-100 rounded-xl p-1 justify-center max-w-lg mx-auto">
        <button
          onClick={() => setActiveSegment("profile")}
          className={`flex-1 py-1.5 px-4 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegment === "profile" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <User className="w-3.5 h-3.5 text-orange-700" />
          General Profile
        </button>
        <button
          onClick={() => setActiveSegment("folders")}
          className={`flex-1 py-1.5 px-4 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegment === "folders" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-orange-700 animate-pulse-slow" />
          Following & Saved
        </button>
        <button
          onClick={() => setActiveSegment("moderator")}
          className={`flex-1 py-1.5 px-4 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegment === "moderator" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-850"
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-orange-700" />
          City Admin Center
        </button>
      </div>

      {/* 1. GENERAL PROFILE SCREEN */}
      {activeSegment === "profile" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main profile card */}
          <div className="bg-white border rounded-2xl p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-3">
              {userProfile.avatarConfig ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-200 shadow-2xs">
                  <SvgAvatar config={userProfile.avatarConfig} className="w-full h-full" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-base shadow border-2 border-orange-200">
                  {userProfile.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5">
                <h3 className="font-sans font-black text-sm text-stone-950 leading-none">{userProfile.name}</h3>
                <p className="text-[10px] text-stone-400 font-mono tracking-wider">{userProfile.email} • Join Date: June 2026</p>
                <div className="flex gap-1.5 pt-1">
                  <span className="text-[8.5px] uppercase font-bold tracking-widest font-mono bg-orange-50 text-orange-850 px-2 py-0.5 rounded-full border border-orange-100">
                    Role: {userProfile.role}
                  </span>
                  <span className="text-[8.5px] uppercase font-bold tracking-widest font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    📍 {userProfile.neighborhood.toUpperCase().replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Score box */}
            <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 text-center">
              <div className="bg-stone-50/50 p-2.5 rounded-xl border">
                <span className="text-[9px] font-bold text-stone-400 uppercase font-mono tracking-wider block">Reputation Score</span>
                <span className="font-mono font-black text-ld text-stone-950 mt-1 block">🎖️ {userProfile.points} Pts</span>
                <span className="text-[8px] text-emerald-600 font-bold uppercase mt-0.5 block">Active local guided</span>
              </div>
              <div className="bg-stone-50/50 p-2.5 rounded-xl border">
                <span className="text-[9px] font-bold text-stone-400 uppercase font-mono tracking-wider block">Total Comments written</span>
                <span className="font-mono font-black text-ld text-stone-950 mt-1 block">💬 {posts.reduce((acc, p) => acc + p.comments.filter((c: any) => c.author === userProfile.name).length, 0)} replies</span>
                <span className="text-[8px] text-stone-400 font-bold uppercase mt-0.5 block">Square contributions</span>
              </div>
            </div>

            {/* Manual Onboarding launcher */}
            {onTriggerOnboarding && (
              <div className="bg-orange-50/10 border border-orange-200/50 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2.5 mt-2">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h5 className="font-black text-stone-900 text-[10.5px]">🚀 Citizen Activation Walkthrough</h5>
                  <p className="text-[9.5px] text-stone-550 leading-normal font-sans">
                    Re-run the Steel City Community setup sequence to choose your neighborhood portal, configure your custom vector avatar, or customize your local feeds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTriggerOnboarding}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-[9.5px] uppercase tracking-wide px-3 py-1.5 rounded-lg shrink-0 cursor-pointer shadow-3xs transition-all"
                >
                  Start Walkthrough
                </button>
              </div>
            )}
          </div>

          {/* REPUTATION BADGES SYSTEM */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-4">
            <div>
              <h4 className="font-sans font-bold text-xs text-stone-900 leading-none">My Reputation Badges</h4>
              <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">Badges unlock dynamically through platform actions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGES_DATABASE.map((b) => {
                const isUnlocked = checkBadgeUnlocked(b.name);
                return (
                  <div
                    key={b.name}
                    className={`p-3 rounded-xl border flex gap-3 transition-all ${
                      isUnlocked
                        ? "bg-amber-50/10 border-amber-300 text-stone-900 shadow-2xs"
                        : "bg-stone-50/40 border-stone-150 text-stone-400"
                    }`}
                  >
                    <div className="text-xl pt-0.5 select-none">{isUnlocked ? "🏆" : "🔒"}</div>
                    <div className="space-y-0.5">
                      <h5 className={`font-bold text-xs ${isUnlocked ? "text-stone-950" : "text-stone-400"}`}>{b.label}</h5>
                      <p className="text-[10px] leading-relaxed font-sans">{b.description}</p>
                      <div className="text-[8.5px] font-mono text-stone-400">
                        {isUnlocked ? "✓ Unlocked & Verified" : `Requires: ${b.criteria}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Digital Avatar Builder */}
          <AvatarCreator
            userProfile={userProfile}
            onSaveAvatar={(newConfig) => {
              setUserProfile((prev: any) => ({
                ...prev,
                avatarConfig: newConfig
              }));
            }}
          />

          {/* Toggle Developer tester role */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h4 className="font-sans font-bold text-xs text-stone-900 border-b pb-1.5 flex items-center gap-1.5 leading-none">
              <RefreshCw className="w-4 h-4 text-orange-700" />
              Developer Panel: Adjust active profile permissions
            </h4>
            <p className="text-[10.5px] text-stone-500 font-sans leading-relaxed">
              Verify local role settings inline. Simulate premium partner dashboard panels or city moderation suppression channels instantly:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Verified User", value: "Verified User" },
                { label: "Business Owner", value: "Business Owner" },
                { label: "City Moderator", value: "City Moderator" }
              ].map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleSelection(role.value as UserRole)}
                  className={`py-1.5 border rounded-xl text-[9.5px] font-bold font-sans transition-all cursor-pointer ${
                    userProfile.role === role.value
                      ? "bg-stone-900 border-stone-900 text-stone-100 shadow"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. DIRECTORY FOLDERS AREA (Followed & Saved) */}
      {activeSegment === "folders" && (
        <div className="space-y-6 animate-fade-in" id="profile-folders-segment">
          
          <div className="bg-white border p-4 rounded-xl text-stone-900 shadow-3xs space-y-1">
            <h4 className="font-sans font-bold text-xs flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-orange-700" />
              Resident Dossier & Directories
            </h4>
            <p className="text-stone-500 text-[10.5px] leading-relaxed">
              Quickly manage the lists of people, local retail industries, neighborhoods, and timeline post bookmarks you are actively following.
            </p>
          </div>

          {/* Followed Users and Residents */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h5 className="font-bold text-xs text-stone-950 uppercase border-b pb-1">People I Follow ({userProfile.followedUsers?.length || 0})</h5>
            {(!userProfile.followedUsers || userProfile.followedUsers.length === 0) ? (
              <p className="text-stone-400 text-[11px] italic font-sans py-1">You are not following any individual neighbors yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userProfile.followedUsers.map((u: string) => (
                  <div key={u} className="bg-stone-50 border p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-850 truncate max-w-[140px]">{u}</span>
                    <button onClick={() => handleUnfollowUser(u)} className="text-[9px] text-red-600 hover:underline cursor-pointer">Unfollow</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Followed Businesses */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h5 className="font-bold text-xs text-stone-950 uppercase border-b pb-1">Industries & Places I Follow ({userProfile.followedBusinesses?.length || 0})</h5>
            {(!userProfile.followedBusinesses || userProfile.followedBusinesses.length === 0) ? (
              <p className="text-stone-400 text-[11px] italic font-sans py-1">You are not following any local business branches yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userProfile.followedBusinesses.map((bId: string) => {
                  const biz = businesses.find(b => b.id === bId);
                  return (
                    <div key={bId} className="bg-stone-50 border p-2.5 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-stone-850 truncate max-w-[130px] block">{biz?.name || "Local Business"}</span>
                        <span className="text-[8px] text-stone-400 uppercase font-mono">{biz?.category}</span>
                      </div>
                      <button onClick={() => handleUnfollowBusiness(bId)} className="text-[9px] text-red-650 hover:underline cursor-pointer">Unfollow</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Followed Neighborhoods */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h5 className="font-bold text-xs text-stone-950 uppercase border-b pb-1">Sector Channels I Follow ({userProfile.followedNeighborhoods?.length || 0})</h5>
            {(!userProfile.followedNeighborhoods || userProfile.followedNeighborhoods.length === 0) ? (
              <p className="text-stone-400 text-[11px] italic font-sans py-1">You are not following any dedicated district channels yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userProfile.followedNeighborhoods.map((hoodId: string) => (
                  <div key={hoodId} className="bg-stone-50 border p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-850 truncate max-w-[130px] uppercase font-mono">{hoodId.replace("_", " ")}</span>
                    <button onClick={() => handleUnfollowNeighborhood(hoodId)} className="text-[9px] text-red-650 hover:underline cursor-pointer">Unfollow</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Posts & Bookmarks */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h5 className="font-bold text-xs text-stone-950 uppercase border-b pb-1">Saved Timelines & Bookmarks ({userProfile.savedPosts?.filter((id: string) => !id.startsWith("fav-")).length || 0})</h5>
            {(() => {
              const savedIds = (userProfile.savedPosts || []).filter((id: string) => !id.startsWith("fav-"));
              if (savedIds.length === 0) {
                return <p className="text-stone-400 text-[11px] italic font-sans py-1">You have not saved any timeline posts yet.</p>;
              }
              return (
                <div className="space-y-2">
                  {savedIds.map((pId: string) => {
                    const post = posts.find(p => p.id === pId);
                    return (
                      <div key={pId} className="bg-stone-50 border p-3 rounded-xl flex justify-between items-center text-xs">
                        <div className="space-y-0.5 truncate max-w-[180px]">
                          <span className="font-bold text-stone-950 truncate block leading-tight">{post?.title || "Community Update Story"}</span>
                          <span className="text-[9px] text-stone-400 italic font-mono block">By {post?.author || "Neighbor"}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => post && onSelectPin("post", post)} className="text-[9px] text-orange-700 font-bold hover:underline">Inspect</button>
                          <button onClick={() => handleUnsavePost(pId)} className="text-[9px] text-red-650 hover:underline">Unsave</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* 3. CITY ADMIN CENTER */}
      {activeSegment === "moderator" && (
        <div className="space-y-4 animate-fade-in" id="moderator-board-segment">
          
          <div className="bg-stone-900 border border-stone-800 text-stone-200 p-4 rounded-xl flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[8.5px] uppercase font-bold tracking-widest text-orange-400 font-mono">System Administrator Node</span>
              <h3 className="font-sans font-bold text-xs">Steel City Community City Care Dashboard</h3>
              <p className="text-[10px] text-stone-400 leading-normal max-w-[240px]">
                Suppress reports, audit flagged items, and view active utilization statistics.
              </p>
            </div>
            <div className="text-2xl select-none">🛡️</div>
          </div>

          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h4 className="font-sans font-bold text-xs text-stone-850 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-orange-700 animate-pulse" />
              Citizen Content Flags Queue ({mockFlags.length} Pending)
            </h4>

            {mockFlags.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs font-sans">
                ✓ Perfect safety balance! No content queries pending.
              </div>
            ) : (
              <div className="space-y-2.5">
                {mockFlags.map((flag) => (
                  <div key={flag.id} className="bg-red-50/50 border border-red-150 p-2.5 rounded-xl space-y-1.5 text-xs text-stone-900" id={`flag-card-${flag.id}`}>
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase font-bold">
                      <span className="text-red-800">{flag.type}</span>
                      <span className="text-stone-400">Claims by: {flag.reporter}</span>
                    </div>
                    <p className="text-stone-600 font-sans italic">"{flag.content}"</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRemoveFlag(flag.id)}
                        className="flex-1 bg-red-650 hover:bg-red-850 text-white font-sans text-[10px] font-bold py-1 rounded cursor-pointer transition-all"
                      >
                        Suppress content
                      </button>
                      <button
                        onClick={() => handleRestoreFlag(flag.id)}
                        className="flex-1 bg-white border border-stone-250 text-stone-700 font-sans text-[10px] font-bold py-1 rounded cursor-pointer hover:bg-stone-100 transition-all"
                      >
                        Dismiss report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3">
            <h4 className="font-sans font-bold text-xs text-stone-850 flex items-center gap-1.5 leading-none">
              <BarChart2 className="w-4 h-4 text-orange-700" />
              Pueblo Utilization Metrics
            </h4>

            <div className="space-y-2.5 text-xs font-sans">
              <div>
                <div className="flex justify-between items-center text-[10.5px] text-stone-400 font-sans mb-1">
                  <span>Claimed Coupon Redeem rate</span>
                  <span className="font-bold text-stone-850">84% Resolution</span>
                </div>
                <div className="w-full bg-stone-150 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[84%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10.5px] text-stone-400 font-sans mb-1">
                  <span>Historic Archive stories contributions</span>
                  <span className="font-bold text-stone-850">112 Oral Files</span>
                </div>
                <div className="w-full bg-stone-150 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-750 h-full w-[65%]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
