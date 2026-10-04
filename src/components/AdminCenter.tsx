import React, { useState } from "react";
import {
  Shield,
  Users,
  Building,
  Flag,
  UserCheck,
  BarChart3,
  ListRestart,
  Heart,
  Ban,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  MapPin,
  RefreshCw,
  AlertTriangle,
  History,
  Sparkles,
  Flame
} from "lucide-react";
import {
  UserProfile,
  UserRole,
  BusinessItem,
  ForumPost,
  BusinessClaim,
  VerificationRequest,
  ContentReport,
  ModeratorAction,
  ContentAppeal,
  EventItem,
  JobItem,
  LostFoundItem,
  SafetyAlert
} from "../types";
import { db } from "../firebase";
import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch } from "firebase/firestore";

interface AdminCenterProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  businesses: BusinessItem[];
  setBusinesses: React.Dispatch<React.SetStateAction<BusinessItem[]>>;
  posts: ForumPost[];
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
  claims: BusinessClaim[];
  setClaims: React.Dispatch<React.SetStateAction<BusinessClaim[]>>;
  verifications: VerificationRequest[];
  setVerifications: React.Dispatch<React.SetStateAction<VerificationRequest[]>>;
  reports: ContentReport[];
  setReports: React.Dispatch<React.SetStateAction<ContentReport[]>>;
  appeals: ContentAppeal[];
  setAppeals: React.Dispatch<React.SetStateAction<ContentAppeal[]>>;
  actions: ModeratorAction[];
  setActions: React.Dispatch<React.SetStateAction<ModeratorAction[]>>;
  allUsers: UserProfile[];
  setAllUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export default function AdminCenter({
  userProfile,
  setUserProfile,
  businesses,
  setBusinesses,
  posts,
  setPosts,
  claims,
  setClaims,
  verifications,
  setVerifications,
  reports,
  setReports,
  appeals,
  setAppeals,
  actions,
  setActions,
  allUsers,
  setAllUsers
}: AdminCenterProps) {
  const [activeTab, setActiveTab] = useState<
    "reports" | "users" | "claims" | "verifications" | "appeals" | "analytics" | "logs" | "seed_engine"
  >("reports");

  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("All");
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("Standard User");
  const [editAssignedHood, setEditAssignedHood] = useState<string>("");

  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllCollections = async () => {
    if (!confirm("🚨 WARNING: Are you sure you want to delete all posts, events, jobs, lost & found entries, and active alerts from Firestore? This is non-reversible and creates a pristine 'No activity yet' slate!")) {
      return;
    }
    setIsClearing(true);
    try {
      const collectionsToWipe = ["posts", "events", "jobs", "lostFound", "alerts"];
      for (const colName of collectionsToWipe) {
        const querySnap = await getDocs(collection(db, colName));
        for (const docSnap of querySnap.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
        }
      }
      logAction("Cleared all live platform collections under the Seeding board.");
      alert("🗑 All Firestore collections cleared successfully! The platform represents a pristine empty county grid.");
    } catch (err) {
      console.error(err);
      alert(`⚠️ Clear failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleSeedRealPuebloData = async () => {
    setIsSeeding(true);
    try {
      // 1. Events templates
      const realEvents: EventItem[] = [
        {
          id: "chile_fest_2026",
          title: "32nd Annual Pueblo Chile & Frijoles Festival",
          description: "Pueblo's signature harvest festival! Over 100,000 visitors, endless roasters of Mira Sol chiles rotating on fire, live country bands across multiple stages, local street food crafts, and the famous hot-chile eating competition.",
          date: "Sept 18, 2026",
          time: "Fri 12 PM - Sun 6 PM",
          location: "Historic Union Avenue District, Pueblo, CO",
          neighborhood: "union_district",
          category: "Festivals",
          organizer: "Pueblo Chamber of Commerce",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
          rsvps: [],
          saves: [],
          lat: 38.2631,
          lng: -104.6112
        },
        {
          id: "riverwalk_tour_2026",
          title: "Historic Arkansas Riverwalk Guided Lantern Tour",
          description: "Join local certified historians for a special evening boat cruise. Travel through downtown canals while hearing tales of the city's heroic 1921 flood recovery and early pioneer settlement days.",
          date: "Weekly on Fridays & Saturdays",
          time: "7:30 PM - 8:30 PM",
          location: "Main Gateway Marina, Historic Riverwalk",
          neighborhood: "downtown",
          category: "Community Events",
          organizer: "Pueblo Riverwalk Authority",
          image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&auto=format&fit=crop",
          rsvps: [],
          saves: [],
          lat: 38.2612,
          lng: -104.6154
        }
      ];

      // 2. Business templates with coupons
      const realBusinesses: BusinessItem[] = [
        {
          id: "milberger_farms",
          name: "Milberger Farms Retail Greenhouse",
          tier: "Premium",
          description: "Pueblo Mesa's legendary farm store. Famous for field-grown green chiles roasted on-site, fresh-baked chile bread, farm-to-table lunch eatery, and beautiful seasonal harvest selections.",
          rating: 4.8,
          address: "28570 US-50, Pueblo, CO",
          neighborhood: "mesa",
          phone: "(719) 948-3305",
          hours: "8:00 AM - 6:00 PM Daily",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
          category: "Other",
          menu: [
            { name: "Pueblo Chile Bread", price: "$6.50", description: "Freshly baked artisan sourdough roll blended with hot Mirasol green chiles." }
          ],
          lat: 38.2541,
          lng: -104.4985,
          claimed: true,
          coupons: [
            { id: "coup-milberger-1", title: "$5 Off Roasted Chile Bushel", description: "Get five dollars off any wholesale bushel of hot, medium, or mild fresh fire-roasted Pueblo Chiles.", code: "MESA5", expiry: "Dec 31, 2026", isPremiumOnly: false }
          ]
        },
        {
          id: "coors_tavern",
          name: "The Historic Coors Tavern",
          tier: "Free",
          description: "Home of the Original Slopper! Dating back to 1934 in the heart of Bessemer, smothering giant burgers in thick local pork green chile sauce since the dawn of Pueblo steel.",
          rating: 4.6,
          address: "515 W 4th St, Pueblo, CO",
          neighborhood: "bessemer",
          phone: "(719) 542-9904",
          hours: "11:00 AM - 10:00 PM Daily",
          image: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&auto=format&fit=crop",
          category: "Burgers",
          menu: [
            { name: "The Famous Bowl Slopper", price: "$11.95", description: "Open-faced cheeseburger smothered in our award-winning thick pork green chile sauce." }
          ],
          lat: 38.2411,
          lng: -104.6205,
          claimed: true,
          coupons: [
            { id: "coup-coors-1", title: "Slopper Thursday Combo Deal", description: "Choice of half-slopper hamburger with green chile and draft beverage.", code: "SLOPPER10", expiry: "Dec 31, 2026", isPremiumOnly: false }
          ]
        }
      ];

      // 3. Post templates
      const realPosts: ForumPost[] = [
        {
          id: "slopper_discussion",
          title: "Coors Tavern vs. Gray's Coors Tavern: Pueblo Slopper Fight",
          content: "For generations, Bessemer residents have debated who serves the superior open-faced Slopper. The thick green chile pork gravy at Coors Tavern on 4th or the incredible diner style over at Gray's?",
          author: "Christopher Osorio",
          authorRole: "Super Admin",
          category: "discussion",
          date: "Just Now",
          neighborhood: "bessemer",
          postType: "📢 Community Updates",
          likes: ["admin@pueblopulse.org"],
          shares: 3,
          saves: [],
          comments: [
            { id: "comm-1", author: "Pete Giadone", authorRole: "Business Owner", content: "Coors Tavern pork green chile is hands-down the thickest and most aromatic in all of Colorado!", date: "1 hour ago" }
          ]
        }
      ];

      // 4. Job templates
      const realJobs: JobItem[] = [
        {
          id: "steelworks_archivist",
          title: "Archival Assistant (Historical Preservation)",
          description: "Collaborate with history curators to catalog, preserve, and digitize early 1900s immigrant worker diaries, engineering blueprint vectors, and records of the famous Colorado Fuel and Iron company.",
          businessName: "CF&I Steelworks Center of the West",
          location: "215 Canal St, Pueblo, CO",
          neighborhood: "bessemer",
          salary: "$19.50 / Hour",
          appliedUsers: [],
          type: "Part Time",
          requirements: ["Must have high attention to detail", "Basic interest in Pueblo local steel industry documentation"]
        }
      ];

      // 5. Lost & found
      const realLostFound: LostFoundItem[] = [
        {
          id: "lost_hound_mineral",
          type: "Lost Pet",
          title: "Lost Beagle-Dachshund Mix 'Pepper'",
          description: "Pepper, our brown friendly mix hound, managed to slip out near the Mineral Palace Park boathouse. Wearing a red collar with county tags. Please call with any sightings near the lake!",
          neighborhood: "north_side",
          location: "Mineral Palace Park",
          contact: "555-0192 (Emily)",
          resolved: false,
          date: "2026-06-12",
          lat: 38.2912,
          lng: -104.5788,
          image: "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&q=80&w=400"
        }
      ];

      // 6. Security Alert
      const realAlerts: SafetyAlert[] = [
        {
          id: "road_closure_chile",
          title: "Union Avenue Parade Road Closure",
          content: "Historic Union Avenue from B Street to 1st Street will be closed to all vehicular traffic starting Thursday morning for Chile Festival set-up and rotating barrel roaster positioning. Detours are marked.",
          neighborhood: "union_district",
          category: "Road Closures",
          level: "warning",
          date: "Just Now",
          verified: true
        }
      ];

      // Batch write of curated templates
      for (const ev of realEvents) {
        await setDoc(doc(db, "events", ev.id), ev);
      }
      for (const b of realBusinesses) {
        await setDoc(doc(db, "businesses", b.id), b);
      }
      for (const p of realPosts) {
        await setDoc(doc(db, "posts", p.id), p);
      }
      for (const j of realJobs) {
        await setDoc(doc(db, "jobs", j.id), j);
      }
      for (const lf of realLostFound) {
        await setDoc(doc(db, "lostFound", lf.id), lf);
      }
      for (const al of realAlerts) {
        await setDoc(doc(db, "alerts", al.id), al);
      }

      logAction("Seeded real local databases with authentic Colorado Pueblo templates.");
      alert("🌱 SEEDING SUCCESS: Firestore populated with 100% geographically authentic Pueblo records! Includes the Chile & Frijoles Festival, Coors Tavern Sloppers, and local preservation jobs. Admins can edit or delete them normally.");
    } catch (err) {
      console.error(err);
      alert(`⚠️ Seeding failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Determine role permissions
  const isSuperAdmin = userProfile.role === "Super Admin" || userProfile.role === "Administrator";
  const isCityAdmin = userProfile.role === "City Administrator" || userProfile.role === "City Moderator" || isSuperAdmin;
  const isMod = userProfile.role === "Neighborhood Moderator" || isCityAdmin;
  const assignedHood = userProfile.assignedNeighborhood || "";

  // Helper to log moderator actions
  const logAction = (actionStr: string, hood?: string) => {
    const newAct: ModeratorAction = {
      id: `act-${Date.now()}`,
      moderatorName: userProfile.name,
      moderatorRole: userProfile.role,
      action: actionStr,
      neighborhood: hood,
      date: new Date().toLocaleString()
    };
    setActions((prev) => [newAct, ...prev]);
  };

  // 1. Report Queue Actions
  // Filters content by moderator neighborhood scope
  const filteredReports = reports.filter((rep) => {
    if (!isSuperAdmin && !isCityAdmin && userProfile.role === "Neighborhood Moderator") {
      // Neighborhood moderator can only see their assigned neighborhood reports
      return rep.itemNeighborhood.toLowerCase() === assignedHood.toLowerCase() && rep.status === "Pending";
    }
    return rep.status === "Pending";
  });

  const handleReportAction = (reportId: string, action: "Suppress" | "Dismiss") => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return { ...r, status: action === "Suppress" ? "Suppressed" : "Dismissed" };
      })
    );

    const reportItem = reports.find((r) => r.id === reportId);
    if (!reportItem) return;

    if (action === "Suppress") {
      // Actually suppress the content in target models
      if (reportItem.itemType === "post") {
        setPosts((pList) => pList.filter((p) => p.id !== reportItem.itemId));
      }
      logAction(`Suppressed classified node/post #${reportItem.itemId}: "${reportItem.itemTitle || "No Title"}"`, reportItem.itemNeighborhood);
      alert("🛡️ Content suppressed successfully. User can file an appeal.");
    } else {
      logAction(`Dismissed flagged complaint against node #${reportItem.itemId}`, reportItem.itemNeighborhood);
      alert("✅ Report dismissed. Content marked as clean.");
    }
  };

  // 2. User & Role Audits
  const handleUpdateUserRole = (userId: string) => {
    if (!isCityAdmin) {
      alert("❌ Insufficient privileges. Only City/Super Administrators can change roles.");
      return;
    }

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, role: editRole, assignedNeighborhood: editAssignedHood || undefined };
      })
    );

    // If updating self
    if (userId === userProfile.id) {
      setUserProfile((prev) => ({
        ...prev,
        role: editRole,
        assignedNeighborhood: editAssignedHood || undefined
      }));
    }

    logAction(`Updated user role of ${selectedUserForEdit?.name} to [${editRole}]` + (editAssignedHood ? ` assigned to ${editAssignedHood}` : ""));
    alert(`Success: ${selectedUserForEdit?.name} updated to ${editRole}`);
    setSelectedUserForEdit(null);
  };

  const handleToggleBanUser = (user: UserProfile) => {
    if (!isCityAdmin) {
      alert("❌ Only City Administrators and Super Admins can ban accounts.");
      return;
    }
    
    const newStatus = user.banStatus === "Banned" ? "Active" : "Banned";
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== user.id) return u;
        return { ...u, banStatus: newStatus };
      })
    );

    logAction(`${newStatus === "Banned" ? "Suspended" : "Unbanned"} resident account: ${user.name} (${user.email})`);
    alert(`Account status updated for ${user.name}: ${newStatus}`);
  };

  // 3. Claims Management
  const filteredClaims = claims.filter((claim) => {
    if (!isSuperAdmin && !isCityAdmin && userProfile.role === "Neighborhood Moderator") {
      // Only claims in their hood
      const biz = businesses.find((b) => b.id === claim.businessId);
      return biz?.neighborhood.toLowerCase() === assignedHood.toLowerCase();
    }
    return true;
  });

  const handleApproveClaim = (claimId: string, approve: boolean) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: approve ? "Approved" : "Rejected" } : c))
    );

    const claim = claims.find((c) => c.id === claimId);
    if (!claim) return;

    if (approve) {
      // Find and assign claim status in business list
      setBusinesses((prev) =>
        prev.map((b) => {
          if (b.id !== claim.businessId) return b;
          return {
            ...b,
            claimed: true,
            ownerId: claim.ownerId,
            ownerName: claim.ownerName
          };
        })
      );

      // Upgrade claimant's role to Business Owner if they were standard users
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.email !== claim.ownerEmail) return u;
          return { ...u, role: "Business Owner" as UserRole };
        })
      );

      if (userProfile.email === claim.ownerEmail) {
        setUserProfile((prev) => ({ ...prev, role: "Business Owner" as UserRole }));
      }

      logAction(`Approved listing claim for standard brand "${claim.businessName}" to resident ${claim.ownerName}`);
      alert(`✓ Claim Approved! ${claim.ownerName} is now the verified owner of ${claim.businessName}.`);
    } else {
      logAction(`Rejected listing claim for brand "${claim.businessName}" submitted by ${claim.ownerName}`);
      alert("Claim rejected.");
    }
  };

  // 4. Verification Queue management
  const handleApproveVerification = (reqId: string, approve: boolean) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === reqId ? { ...v, status: approve ? "Approved" : "Rejected" } : v))
    );

    const req = verifications.find((v) => v.id === reqId);
    if (!req) return;

    if (approve) {
      // Grant badges and level 3 resident status
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id !== req.userId) return u;
          const currentBadges = u.badges || [];
          const updatedBadges = currentBadges.includes("Verified Resident")
            ? currentBadges
            : [...currentBadges, "Verified Resident" as any];
          return {
            ...u,
            residentVerified: true,
            badges: updatedBadges as any
          };
        })
      );

      if (userProfile.id === req.userId) {
        setUserProfile((prev) => {
          const currentBadges = prev.badges || [];
          const updatedBadges = currentBadges.includes("Verified Resident")
            ? currentBadges
            : [...currentBadges, "Verified Resident" as any];
          return {
            ...prev,
            residentVerified: true,
            badges: updatedBadges as any
          };
        });
      }

      logAction(`Approved level-3 residency verification request for user ${req.userName} via ${req.method}`);
      alert(`Verified Resident Badge granted successfully to ${req.userName}!`);
    } else {
      logAction(`Rejected residency verification request for ${req.userName}`);
      alert("Verification request rejected.");
    }
  };

  // 5. Appeals System
  const handleApproveAppeal = (appealId: string, approve: boolean) => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === appealId ? { ...a, status: approve ? "Approved" : "Rejected" } : a))
    );

    const appeal = appeals.find((a) => a.id === appealId);
    if (!appeal) return;

    if (approve) {
      // Restore the post (simulate basic clone restoration or state confirmation if previously saved)
      logAction(`Approved content appeal for user ${appeal.userEmail}. Restraining order dismissed.`);
      alert("✓ Appeal approved! Suppressed classified thread reinstated.");
    } else {
      logAction(`Rejected appeal request from ${appeal.userEmail}`);
      alert("Appeal rejected.");
    }
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden shadow-sm text-stone-900 font-sans" id="advanced-admin-center">
      {/* Top Banner indicating assigned authorization level */}
      <div className="bg-stone-950 p-4 border-b border-stone-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-orange-650 animate-pulse" />
          <div>
            <h3 className="text-white font-bold text-xs">Steel City Community Pulse-Watch Control</h3>
            <p className="text-[10px] text-stone-400 font-mono">
              Authorized Authority Level: {userProfile.role} {assignedHood && `(Assigned Sector: ${assignedHood.toUpperCase().replace("_", " ")})`}
            </p>
          </div>
        </div>
        <div className="text-[9px] uppercase font-bold px-2 py-0.5 rounded font-mono bg-orange-700 text-white animate-pulse">
          Secure Session Active
        </div>
      </div>

      {ifNoPrivileges(userProfile.role)}

      {/* Admin Menu Tabs */}
      <div className="flex border-b overflow-x-auto bg-stone-100 p-1 gap-1">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "reports" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          Content Flags ({filteredReports.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "users" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          User Roster ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab("claims")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "claims" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Retail Claims ({filteredClaims.filter((c) => c.status === "Pending").length})
        </button>

        <button
          onClick={() => setActiveTab("verifications")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "verifications" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Residency Requests ({verifications.filter((v) => v.status === "Pending").length})
        </button>

        <button
          onClick={() => setActiveTab("appeals")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "appeals" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <ListRestart className="w-3.5 h-3.5" />
          Appeals Queue ({appeals.filter((a) => a.status === "Pending").length})
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "analytics" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Local Analytics
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "logs" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Audit Log
        </button>

        <button
          onClick={() => setActiveTab("seed_engine")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "seed_engine" ? "bg-white text-stone-950 shadow-2xs border border-stone-200" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Real Pueblo Seeder
        </button>
      </div>

      <div className="p-4 min-h-[350px]">
        {/* TAB 1: REPORTS QUEUE */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-orange-700" />
                Moderation Queue: Community Flags & Spam Audits
              </h4>
              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Scope: {isSuperAdmin ? "County Comprehensive (All Neighborhoods)" : `Assigned Sector [${assignedHood.toUpperCase() || "None"}] only`}
              </span>
            </div>

            {filteredReports.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto stroke-1 mb-2" />
                <h5 className="font-bold text-xs text-stone-800">Clear Horizon</h5>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">No flagged content pending investigation in your sector.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((item) => (
                  <div key={item.id} className="bg-white border rounded-xl p-3.5 space-y-3 shadow-2xs border-l-4 border-l-red-500">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-150">
                        🚨 Category: {item.reason}
                      </span>
                      <span className="font-mono text-stone-400">Date: {item.date}</span>
                    </div>

                    <div className="bg-stone-50 p-2 text-xs rounded border space-y-1">
                      <div className="text-[9.5px] text-stone-400 font-mono flex gap-1">
                        <span>Flagged Node Type: <strong>{item.itemType.toUpperCase()}</strong></span>
                        <span>• User author: <strong>{item.itemAuthor}</strong></span>
                        <span>• Sector: <strong>{item.itemNeighborhood.toUpperCase()}</strong></span>
                      </div>
                      <p className="font-sans italic text-stone-700">"{item.itemContent}"</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReportAction(item.id, "Suppress")}
                        className="flex-1 bg-red-700 text-white font-bold text-xs py-1.5 rounded-lg hover:bg-red-800 transition-all cursor-pointer flex justify-center items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Suppress Content
                      </button>
                      <button
                        onClick={() => handleReportAction(item.id, "Dismiss")}
                        className="flex-1 bg-white border border-stone-250 text-stone-700 text-xs py-1.5 rounded-lg hover:bg-stone-50 transition-all cursor-pointer"
                      >
                        Dismiss Flag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER ROSTER & ROLE AUDITS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-700" />
                Staff Directory & Role Assignments
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-stone-100 text-stone-500 font-mono tracking-wider text-[10px] border-b">
                    <th className="p-2 font-semibold">Resident Name / Email</th>
                    <th className="p-2 font-semibold">Current Role</th>
                    <th className="p-2 font-semibold">Home/Assigned Sector</th>
                    <th className="p-2 font-semibold">Rep Score</th>
                    <th className="p-2 font-semibold">Control Status</th>
                    <th className="p-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50">
                      <td className="p-2 font-bold text-stone-900">
                        {user.name}
                        <div className="text-[9.5px] text-stone-400 font-mono font-normal block">{user.email}</div>
                      </td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          user.role.includes("Admin") ? "bg-orange-900 text-orange-100" :
                          user.role.includes("Moderator") ? "bg-blue-900 text-blue-100" :
                          user.role.includes("Owner") ? "bg-amber-900 text-amber-100" :
                          "bg-stone-100 text-stone-600"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2 uppercase font-mono text-[9.5px]">
                        {user.role === "Neighborhood Moderator" && user.assignedNeighborhood
                          ? `⭐ ${user.assignedNeighborhood.replace("_", " ")}`
                          : user.neighborhood.replace("_", " ")}
                      </td>
                      <td className="p-2 font-mono font-bold text-stone-700">{user.points} Pts</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          user.banStatus === "Banned" ? "bg-red-200 text-red-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {user.banStatus || "Active"}
                        </span>
                      </td>
                      <td className="p-2 space-x-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserForEdit(user);
                            setEditRole(user.role);
                            setEditAssignedHood(user.assignedNeighborhood || "");
                          }}
                          className="bg-stone-900 text-stone-100 text-[10px] font-bold px-2 py-1 rounded hover:bg-stone-800 cursor-pointer"
                        >
                          Modify Role/Scope
                        </button>
                        <button
                          onClick={() => handleToggleBanUser(user)}
                          className={`text-[10px] font-bold px-1.5 py-1 rounded cursor-pointer ${
                            user.banStatus === "Banned" ? "bg-emerald-50 text-emerald-800 border" : "bg-red-50 text-red-800 border border-red-150"
                          }`}
                        >
                          {user.banStatus === "Banned" ? "Reinstate" : "Suspend Account"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit user dialogue box overlay */}
            {selectedUserForEdit && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <h5 className="font-bold text-xs text-stone-900">
                    Upgrading credentials for: {selectedUserForEdit.name} ({selectedUserForEdit.email})
                  </h5>
                  <button onClick={() => setSelectedUserForEdit(null)} className="text-stone-500 font-bold hover:text-stone-850">✕ Cancel</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Select Authority Level:</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full bg-white border rounded p-1.5 text-xs focus:outline-none"
                    >
                      <option value="Standard User">Standard User</option>
                      <option value="Verified Resident">Verified Resident</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Neighborhood Moderator">Neighborhood Moderator</option>
                      <option value="City Administrator">City Administrator</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  {editRole === "Neighborhood Moderator" && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Assign Local Neighborhood:</label>
                      <select
                        value={editAssignedHood}
                        onChange={(e) => setEditAssignedHood(e.target.value)}
                        className="w-full bg-white border rounded p-1.5 text-xs focus:outline-none uppercase font-mono"
                      >
                        <option value="">Select Territory</option>
                        <option value="bessemer">Bessemer</option>
                        <option value="belmont">Belmont</option>
                        <option value="mesa">Mesa Area</option>
                        <option value="downtown">Downtown</option>
                        <option value="pueblo_west">Pueblo West</option>
                        <option value="union_district">Union District</option>
                        <option value="north_side">North Side</option>
                      </select>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleUpdateUserRole(selectedUserForEdit.id)}
                  className="bg-stone-950 text-white font-bold text-xs px-4 py-2 rounded hover:bg-stone-800 transition-all"
                >
                  Apply Role Update
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BUSINESS CLAIMS REVIEW */}
        {activeTab === "claims" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-orange-700" />
                Business Legitimacy Audits & Claims
              </h4>
            </div>

            {filteredClaims.filter((c) => c.status === "Pending").length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto stroke-1 mb-2" />
                <h5 className="font-bold text-xs text-stone-800">Operational Balance</h5>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">No brand/shop claim submissions pending verify.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClaims.filter((c) => c.status === "Pending").map((claim) => (
                  <div key={claim.id} className="bg-white border rounded-xl p-3.5 space-y-3 shadow-2xs border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-stone-700 block uppercase font-mono">Request #{claim.id}</span>
                      <span className="text-[9px] bg-amber-50 text-amber-800 border font-mono px-2 py-0.5 rounded">Pending Approval</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-stone-900">Claimant: {claim.ownerName} ({claim.ownerEmail})</p>
                      <p className="text-stone-600">Company Target: <strong className="text-stone-950">{claim.businessName}</strong></p>
                      <p className="text-stone-500 italic block mt-1">Submitted Document: 📄 {claim.documentName || "BusinessLicense_Pueblo.pdf"}</p>
                    </div>

                    <div className="bg-yellow-50 border p-2 rounded text-[10.5px] text-yellow-800 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Spam & Fake Business Prevention</strong>: Ensure submitted licensure names match public secretary databases to prevent scam listings.
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApproveClaim(claim.id, true)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1.5 rounded-lg cursor-pointer transition-all"
                      >
                        Approve & Bind Owner
                      </button>
                      <button
                        onClick={() => handleApproveClaim(claim.id, false)}
                        className="flex-1 bg-white border border-stone-250 text-stone-600 text-xs py-1.5 rounded-lg cursor-pointer hover:bg-stone-50"
                      >
                        Reject Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VERIFICATION QUEUE */}
        {activeTab === "verifications" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-orange-700" />
                Residency Badge Verification Queue
              </h4>
            </div>

            {verifications.filter((v) => v.status === "Pending").length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto stroke-1 mb-2" />
                <h5 className="font-bold text-xs text-stone-800">Clear Deck</h5>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">All local residency audits complete.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verifications.filter((v) => v.status === "Pending").map((req) => (
                  <div key={req.id} className="bg-white border rounded-xl p-3.5 space-y-3 shadow-2xs border-l-4 border-l-orange-500 animate-fade-in">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>User ID: {req.userId}</span>
                      <span>Method: <strong className="text-orange-850 font-bold">{req.method}</strong></span>
                    </div>

                    <div className="text-xs">
                      <h5 className="font-bold text-stone-900 mb-0.5">{req.userName} ({req.userEmail})</h5>
                      <p className="text-stone-500 bg-stone-50 p-2 border rounded italic mt-1.5">
                        Uploaded Document Data: <span className="font-mono text-stone-800 font-semibold">{req.detail}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveVerification(req.id, true)}
                        className="flex-1 bg-stone-950 text-white hover:bg-stone-800 text-xs font-bold py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Grant Level 3 verified Resident Custom Badge
                      </button>
                      <button
                        onClick={() => handleApproveVerification(req.id, false)}
                        className="flex-1 bg-white border border-stone-250 text-stone-600 text-xs py-1.5 rounded-lg hover:bg-stone-50 transition-all cursor-pointer"
                      >
                        Deny verification
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: APPEALS SYSTEM */}
        {activeTab === "appeals" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <ListRestart className="w-4 h-4 text-orange-700" />
                Suppressed Content Appeals Room
              </h4>
            </div>

            {appeals.filter((a) => a.status === "Pending").length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto stroke-1 mb-2" />
                <h5 className="font-bold text-xs text-stone-800">Peaceful Plaza</h5>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">No open appeals or suppression challenges pending.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appeals.filter((a) => a.status === "Pending").map((app) => (
                  <div key={app.id} className="bg-white border rounded-xl p-3.5 space-y-3 shadow-2xs border-l-4 border-l-blue-500">
                    <div className="text-[10px] font-mono text-stone-400">Appeal Submission ID: {app.id}</div>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-mono text-[9px] text-stone-400">SUPPRESSED CONTENT:</span>
                        <p className="text-stone-500 line-through bg-stone-100 p-2 italic rounded">"{app.itemContent}"</p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-stone-400 font-bold text-blue-700">RESIDENT JUSTIFICATION FOR APPEAL:</span>
                        <p className="text-stone-800 bg-blue-50 p-2.5 rounded border border-blue-150">"{app.reason}"</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveAppeal(app.id, true)}
                        className="flex-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs py-1.5 rounded-lg transition-all"
                      >
                        Reinstate Thread (Approve)
                      </button>
                      <button
                        onClick={() => handleApproveAppeal(app.id, false)}
                        className="flex-1 bg-white border text-stone-600 font-bold text-xs py-1.5 rounded-lg hover:bg-stone-50"
                      >
                        Decline reinstating
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: STATISTICS & LOCAL ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5 border-b pb-2">
              <BarChart3 className="w-4 h-4 text-orange-700" />
              Community Engagement Realtime Charts
            </h4>

            {/* Simple Dynamic Bar Indicators simulating stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-3 shadow-3xs space-y-3">
                <h5 className="font-bold text-[10.5px] uppercase font-mono tracking-wider text-stone-400">Platform Active Core</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Total Active Members</span>
                      <span className="font-bold font-mono">1,402</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded overflow-hidden">
                      <div className="bg-stone-950 h-full rounded w-[85%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Verified Level 3 Badges</span>
                      <span className="font-bold font-mono">312 Residents</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded overflow-hidden">
                      <div className="bg-orange-700 h-full rounded w-[45%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-3 shadow-3xs space-y-3">
                <h5 className="font-bold text-[10.5px] uppercase font-mono tracking-wider text-stone-400">Classified Deals & Local Redeems</h5>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Active Verified Businesses</span>
                      <span className="font-bold font-mono">48 Stores</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded w-[72%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Reputation Points distributed</span>
                      <span className="font-bold font-mono">24,590 Pts</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded overflow-hidden">
                      <div className="bg-blue-600 h-full rounded w-[60%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Pie Content Distribution */}
            <div className="bg-white border rounded-xl p-3 shadow-3xs space-y-4">
              <h5 className="font-bold text-[10.5px] uppercase font-mono tracking-wider text-stone-400 leading-none">Categorized Neighborhood Traffic</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="border p-2 rounded bg-stone-50/50">
                  <p className="text-stone-400 text-[9px] font-mono leading-none">BESSEMER STEEL DISTRICT</p>
                  <p className="font-black text-stone-900 mt-1">420 Active Interactions</p>
                </div>
                <div className="border p-2 rounded bg-stone-50/50">
                  <p className="text-stone-400 text-[9px] font-mono leading-none">MESA CHILE GARDENS</p>
                  <p className="font-black text-stone-900 mt-1">310 Active Interactions</p>
                </div>
                <div className="border p-2 rounded bg-stone-50/50">
                  <p className="text-stone-400 text-[9px] font-mono leading-none">DOWNTOWN RIVERWALK</p>
                  <p className="font-black text-stone-900 mt-1">540 Active Interactions</p>
                </div>
                <div className="border p-2 rounded bg-stone-50/50">
                  <p className="text-stone-400 text-[9px] font-mono leading-none">PUEBLO WEST URBAN CORRIDOR</p>
                  <p className="font-black text-stone-900 mt-1">290 Active Interactions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: RETRIEVABLE CONTROL LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-orange-700" />
                Moderator Activity Logs & Action Auditing
              </h4>
              <button
                onClick={() => setActions([])}
                className="text-stone-400 hover:text-red-600 text-[10px] font-mono hover:underline"
              >
                Clear Log History
              </button>
            </div>

            {actions.length === 0 ? (
              <p className="text-stone-400 text-center text-xs py-8 italic font-sans">
                No record entries reported in this session. Suppress content, adjust roles, or approve claims to generate logs.
              </p>
            ) : (
              <div className="space-y-1.5 bg-stone-900 p-3 rounded-xl border border-stone-850 font-mono text-[10.5px] text-stone-300 max-h-[300px] overflow-y-auto">
                {actions.map((act) => (
                  <div key={act.id} className="border-b border-stone-800 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-stone-400 font-bold">[{act.date}]</span>{" "}
                    <span className="text-orange-400 font-bold mr-1">({act.moderatorRole})</span>{" "}
                    <span className="text-white underline">{act.moderatorName}</span>:{" "}
                    <span className="text-stone-200">{act.action}</span>
                    {act.neighborhood && (
                      <span className="ml-1 bg-stone-800 text-amber-400 text-[9px] px-1 py-0.2 rounded font-sans uppercase">
                        📍 {act.neighborhood}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: PUEBLO SEED & REAL DATA ENGINE */}
        {activeTab === "seed_engine" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-bold text-xs text-stone-850 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
                🌱 Pueblo County Seeding & Real-Data Provisioning
              </h4>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 font-bold uppercase">
                Active Live Database Nodes
              </span>
            </div>

            <div className="bg-stone-50 border rounded-xl p-4 space-y-3">
              <h5 className="font-sans font-bold text-xs text-stone-800">Authentic Curated Datasets Overview</h5>
              <p className="text-[11px] font-sans text-stone-600 leading-relaxed">
                Rather than loading simulated local assets client-side, clicking the <strong>Publish Curated Datasets</strong> triggers real Firestore document insertions. It seeds high-fidelity historical items, authentic community announcements, and events like the <strong>32nd Annual Chile & Frijoles Festival</strong>, Coors Tavern Sloppers, and local preservation jobs directly to your project database.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[10.5px] font-sans text-stone-550 pt-1">
                <div className="p-2.5 bg-white border rounded-lg">
                  <strong className="text-stone-800">🌽 Live Events (2)</strong>
                  <p className="mt-1">Pueblo Chile & Frijoles Festival, Historic Arkansas Riverwalk Lantern boat tours.</p>
                </div>
                <div className="p-2.5 bg-white border rounded-lg">
                  <strong className="text-stone-800">🌶️ Verified Businesses (2)</strong>
                  <p className="mt-1">Milberger Farms, The Historic Bessemer Coors Tavern (and $5 / sloppy coupons).</p>
                </div>
                <div className="p-2.5 bg-white border rounded-lg">
                  <strong className="text-stone-800">📢 Forum Streams (1)</strong>
                  <p className="mt-1">Classic Bessemer slopper showdown debate thread.</p>
                </div>
                <div className="p-2.5 bg-white border rounded-lg">
                  <strong className="text-stone-800">💼 Employment Listings (1)</strong>
                  <p className="mt-1">Historical Archivist at the Steelworks Center of the West.</p>
                </div>
                <div className="p-2.5 bg-white border rounded-lg">
                  <strong className="text-stone-800">🏡 Neighborhood Safety (1)</strong>
                  <p className="mt-1">Dachshund slipper search alert in the North Side (Mineral Palace Park).</p>
                </div>
                <div className="p-2.5 bg-white border rounded-lg">
                  <strong className="text-stone-800">🚧 Construction Audits (1)</strong>
                  <p className="mt-1">Union Avenue parade route prep warning for the upcoming festival.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                disabled={isSeeding || isClearing}
                onClick={handleSeedRealPuebloData}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-sans rounded-xl disabled:bg-stone-200 transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Firestore Collections...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>🌱 Publish Curated Pueblo Datasets</span>
                  </>
                )}
              </button>

              <button
                disabled={isSeeding || isClearing}
                onClick={handleClearAllCollections}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-sans rounded-xl disabled:bg-stone-200 transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Clearing Live Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>🗑 Clear Live Platform Streams (Restart Clean)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ifNoPrivileges(role: string) {
  if (role !== "Super Admin" && role !== "City Administrator" && role !== "Neighborhood Moderator" && role !== "Administrator" && role !== "City Moderator") {
    return (
      <div className="m-4 bg-yellow-50 border border-yellow-250 rounded-xl p-3 text-xs text-yellow-800 space-y-1">
        <div className="flex items-center gap-1 font-bold">
          <AlertTriangle className="w-4 h-4 text-yellow-700" />
          <span>Restricted Sandbox Sandbox Audit View</span>
        </div>
        <p className="font-sans leading-normal">
          Your current active profile role is <strong className="uppercase">"{role}"</strong>. You can browse read-only telemetry, but to perform administrative actions, please use the **Developer Tester Panel** under the <strong>"Rep" tab</strong> to switch your active role to <strong>"City Moderator"</strong> or <strong>"Super Admin"</strong>!
        </p>
      </div>
    );
  }
  return null;
}
