import React, { useState } from "react";
import {
  Building,
  DollarSign,
  Briefcase,
  Calendar,
  Layers,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle,
  AlertTriangle,
  Send,
  Plus
} from "lucide-react";
import {
  UserProfile,
  BusinessItem,
  BusinessClaim,
  EventItem,
  JobType,
  JobItem,
  CouponItem,
  NeighborhoodID
} from "../types";

interface BusinessPortalProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  businesses: BusinessItem[];
  setBusinesses: React.Dispatch<React.SetStateAction<BusinessItem[]>>;
  claims: BusinessClaim[];
  setClaims: React.Dispatch<React.SetStateAction<BusinessClaim[]>>;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  jobs: JobItem[];
  setJobs: React.Dispatch<React.SetStateAction<JobItem[]>>;
}

export default function BusinessPortal({
  userProfile,
  setUserProfile,
  businesses,
  setBusinesses,
  claims,
  setClaims,
  events,
  setEvents,
  jobs,
  setJobs
}: BusinessPortalProps) {
  const [activeTab, setActiveTab] = useState<"claim" | "dashboard" | "coupons" | "jobs" | "events" | "reviews">("claim");
  
  // Claiming variables
  const [selectedBizToClaim, setSelectedBizToClaim] = useState<string>("");
  const [claimDocName, setClaimDocName] = useState<string>("Pueblo_County_License_2026.pdf");
  const [claimError, setClaimError] = useState<string | null>(null);

  // New coupon variables
  const [newCouponTitle, setNewCouponTitle] = useState("");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponExpiry, setNewCouponExpiry] = useState("Expires 30 Days");

  // New job variables
  const [jobTitle, setJobTitle] = useState("");
  const [jobType, setJobType] = useState<JobType>("Full Time");
  const [jobSalary, setJobSalary] = useState("$18.50 - $22.00 / hr");
  const [jobDesc, setJobDesc] = useState("");

  // New Event variables
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState<any>("Community Events");
  const [eventDate, setEventDate] = useState("2026-07-15");
  const [eventTime, setEventTime] = useState("10:00 AM");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  // Review reply variables
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(null);
  const [ownerReplyText, setOwnerReplyText] = useState("");

  // Filter businesses owned by current user
  const myBusinesses = businesses.filter(
    (b) => b.claimed && b.ownerEmail === userProfile.email
  );

  const [selectedActiveBiz, setSelectedActiveBiz] = useState<BusinessItem | null>(
    myBusinesses.length > 0 ? myBusinesses[0] : null
  );

  // Fallback update selected active business if owned list changes
  React.useEffect(() => {
    if (myBusinesses.length > 0 && !selectedActiveBiz) {
      setSelectedActiveBiz(myBusinesses[0]);
    }
  }, [myBusinesses]);

  // Submit claim handler
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizToClaim) {
      setClaimError("Please choose a local listing to claim ownership.");
      return;
    }

    const business = businesses.find((b) => b.id === selectedBizToClaim);
    if (!business) return;

    if (business.claimed) {
      setClaimError("This business has already been claimed.");
      return;
    }

    const duplicateClaim = claims.some(
      (c) => c.businessId === business.id && c.ownerEmail === userProfile.email && c.status === "Pending"
    );
    if (duplicateClaim) {
      setClaimError("A claim for this business is already pending moderator approval!");
      return;
    }

    const newClaim: BusinessClaim = {
      id: `clm-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      ownerId: userProfile.id,
      ownerName: userProfile.name,
      ownerEmail: userProfile.email,
      documentName: claimDocName,
      status: "Pending",
      date: new Date().toLocaleDateString()
    };

    setClaims((prev) => [newClaim, ...prev]);
    setSelectedBizToClaim("");
    setClaimError(null);
    alert(`Success: Your ownership claim for "${business.name}" has been routed to the Pueblo County Admin Center! Please wait for a moderator to audit your license.`);
  };

  // Add Coupon Code
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActiveBiz) return;
    if (!newCouponTitle || !newCouponCode) {
      alert("Missing required code info.");
      return;
    }

    const newCoupon: CouponItem = {
      id: `cp-${Date.now()}`,
      code: newCouponCode.toUpperCase().replace(/\s+/g, ""),
      title: newCouponTitle,
      description: newCouponDesc || "Take disadvantage of our new Pueblo local deal!",
      expiry: newCouponExpiry,
      isPremiumOnly: false
    };

    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== selectedActiveBiz.id) return b;
        return {
          ...b,
          coupons: [...b.coupons, newCoupon]
        };
      })
    );

    setSelectedActiveBiz((prev) => {
      if (!prev) return null;
      return { ...prev, coupons: [...prev.coupons, newCoupon] };
    });

    setNewCouponTitle("");
    setNewCouponCode("");
    setNewCouponDesc("");
    alert("💸 Verified coupon created & synced! Registered immediately on the Pueblo Specs Tab.");
  };

  // Create Job
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActiveBiz) return;
    if (!jobTitle) {
      alert("Please provide a job title.");
      return;
    }

    const newJob: JobItem = {
      id: `job-${Date.now()}`,
      title: jobTitle,
      businessName: selectedActiveBiz.name,
      type: jobType,
      location: selectedActiveBiz.address,
      neighborhood: selectedActiveBiz.neighborhood,
      salary: jobSalary,
      description: jobDesc,
      requirements: ["Pueblo Resident prefer", "High reliability", "Must love Chile sloppers!"],
      appliedUsers: []
    };

    setJobs((prev) => [newJob, ...prev]);
    setJobTitle("");
    setJobDesc("");
    alert("💼 Job listed! Broadcast immediately to the local Pueblo Classifieds Jobs category.");
  };

  // Publish Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActiveBiz) return;
    if (!eventTitle) {
      alert("Please write an event name.");
      return;
    }

    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      title: eventTitle,
      category: eventCategory,
      date: eventDate,
      time: eventTime,
      location: eventLocation || selectedActiveBiz.address,
      neighborhood: selectedActiveBiz.neighborhood,
      lat: selectedActiveBiz.lat || 38.254,
      lng: selectedActiveBiz.lng || -104.609,
      description: eventDesc,
      image: selectedActiveBiz.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400",
      rsvps: [],
      saves: [],
      organizer: selectedActiveBiz.name
    };

    setEvents((prev) => [newEvent, ...prev]);
    setEventTitle("");
    setEventDesc("");
    setEventLocation("");
    alert("📅 Special event scheduled! Marked as a verified business event across Pueblo maps.");
  };

  // Submit owner review comment reply
  const handleAddReviewReply = (reviewIndex: number) => {
    if (!selectedActiveBiz || !ownerReplyText) return;

    alert(`Reply published to author: "${ownerReplyText}"`);
    
    // Simulate updating review list with direct reply markup
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== selectedActiveBiz.id) return b;
        const currentReviews = b.reviews || [];
        const updated = currentReviews.map((rev, idx) => {
          if (idx !== reviewIndex) return rev;
          return {
            ...rev,
            text: rev.text + `\n\nOwner Reply: "${ownerReplyText}"`
          };
        });
        return { ...b, reviews: updated };
      })
    );

    setSelectedActiveBiz((prev) => {
      if (!prev) return null;
      const currentReviews = prev.reviews || [];
      const updated = currentReviews.map((rev, idx) => {
        if (idx !== reviewIndex) return rev;
        return {
          ...rev,
          text: rev.text + `\n\nOwner Reply: "${ownerReplyText}"`
        };
      });
      return { ...prev, reviews: updated };
    });

    setOwnerReplyText("");
    setSelectedReviewIndex(null);
  };

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-xs text-stone-900" id="business-portal-container">
      {/* Top Title Banner */}
      <div className="bg-orange-850 p-4 border-b border-orange-900 flex justify-between items-center text-white">
        <div className="flex items-center gap-1.5">
          <Building className="w-5.5 h-5.5 text-white" />
          <div>
            <h4 className="font-sans font-black text-xs">Steel City Community Retailer Portal</h4>
            <span className="text-[10px] text-orange-200 font-mono block">Claim listings, post deals, events, & review feeds.</span>
          </div>
        </div>
        <div className="bg-orange-950 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-orange-100">
          Partner Core
        </div>
      </div>

      {myBusinesses.length > 0 && (
        <div className="bg-stone-55 flex border-b font-sans text-xs select-none">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 hover:bg-stone-100 py-2.5 font-bold transition-all ${
              activeTab === "dashboard" ? "border-b-2 border-orange-700 font-black text-stone-950" : "text-stone-500"
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex-1 hover:bg-stone-100 py-2.5 font-bold transition-all ${
              activeTab === "coupons" ? "border-b-2 border-orange-700 font-black text-stone-950" : "text-stone-500"
            }`}
          >
            💸 Coupons
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 hover:bg-stone-100 py-2.5 font-bold transition-all ${
              activeTab === "jobs" ? "border-b-2 border-orange-700 font-black text-stone-950" : "text-stone-500"
            }`}
          >
            💼 Jobs
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 hover:bg-stone-100 py-2.5 font-bold transition-all ${
              activeTab === "events" ? "border-b-2 border-orange-700 font-black text-stone-950" : "text-stone-500"
            }`}
          >
            📅 Events
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 hover:bg-stone-100 py-2.5 font-bold transition-all ${
              activeTab === "reviews" ? "border-b-2 border-orange-700 font-black text-stone-950" : "text-stone-500"
            }`}
          >
            💬 reviews
          </button>
          <button
            onClick={() => setActiveTab("claim")}
            className="px-4 border-l bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold"
          >
            + Claim Another
          </button>
        </div>
      )}

      {/* BODY SECTIONS BASED ON SELECTION */}
      <div className="p-4">
        {/* CASE 1: CLAIM A BUSINESS */}
        {(activeTab === "claim" || myBusinesses.length === 0) && (
          <div className="space-y-4 font-sans animate-fade-in">
            <div className="bg-stone-50 border p-3 rounded-xl">
              <h5 className="font-bold text-xs text-stone-900 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-orange-700" />
                Claim Your Real Business Listing
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                Connecting your business allows you to run promotions, publish local jobs with wage rates, sponsor neighborhood events, and publish community coupons!
              </p>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Select Pueblo Business Listing:</label>
                <select
                  value={selectedBizToClaim}
                  onChange={(e) => setSelectedBizToClaim(e.target.value)}
                  className="w-full bg-white border border-stone-250 p-2 rounded-xl text-xs font-sans focus:outline-none"
                >
                  <option value="">-- Choose an unclaimed business listing --</option>
                  {businesses
                    .filter((b) => !b.claimed)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Located: {b.address.split(",")[0]}, {b.neighborhood.toUpperCase().replace("_", " ")})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Upload LLC / Pueblo Tax Receipt name:</label>
                <input
                  type="text"
                  value={claimDocName}
                  onChange={(e) => setClaimDocName(e.target.value)}
                  placeholder="e.g. Pueblo_County_Lic_2026.pdf"
                  className="w-full bg-white border border-stone-250 p-2 rounded-xl text-xs font-mono focus:outline-none"
                />
                <span className="text-[9.5px] text-stone-400 block mt-0.5">Proof of operation in Pueblo County ensures safety and blocks fraud.</span>
              </div>

              {claimError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-lg text-xs font-bold leading-none">
                  ⚠️ {claimError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-750 hover:bg-orange-850 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
              >
                File Verified Claim Submission
              </button>
            </form>

            {myBusinesses.length > 0 && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className="w-full bg-stone-900 text-white hover:bg-stone-850 font-bold text-xs py-1.5 rounded-xl block text-center"
              >
                ← Back to owner dashboard
              </button>
            )}

            {/* List Submitted Claims */}
            {claims.filter((c) => c.ownerEmail === userProfile.email).length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <h6 className="font-bold text-[10px] uppercase font-mono tracking-wider text-stone-400">My Claim Status Summary</h6>
                {claims
                  .filter((c) => c.ownerEmail === userProfile.email)
                  .map((c) => (
                    <div key={c.id} className="bg-stone-50 border p-2 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <strong className="block text-stone-850">{c.businessName}</strong>
                        <span className="text-[9px] text-stone-400 font-mono">Submitted Doc: {c.documentName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        c.status === "Rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* OWNER IS VERIFIED: SHOW OWNER SYSTEMS */}
        {myBusinesses.length > 0 && activeTab !== "claim" && selectedActiveBiz && (
          <div className="space-y-4 animate-fade-in font-sans">
            {/* Business selector if they own multiple */}
            {myBusinesses.length > 1 && (
              <div className="bg-stone-50 p-2.5 rounded-xl border flex justify-between items-center text-xs">
                <span className="font-bold text-stone-500">Selected Managed Business:</span>
                <select
                  value={selectedActiveBiz.id}
                  onChange={(e) => {
                    const found = myBusinesses.find((b) => b.id === e.target.value);
                    if (found) setSelectedActiveBiz(found);
                  }}
                  className="bg-white border rounded p-1 text-xs outline-none"
                >
                  {myBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CASE 2: OWNER INSTANT ANALYTICS */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-xs text-stone-900 border-b pb-1">
                    Performance Dashboard: {selectedActiveBiz.name}
                  </h5>
                  <span className="bg-emerald-50 text-emerald-800 tracking-wide text-[8.5px] font-mono border border-emerald-150 px-1.5 py-0.5 rounded">
                    Active Premium Sync
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-[9px] block text-stone-400 font-bold uppercase">Weekly Views</span>
                    <span className="text-sm font-black text-stone-900 block mt-1">
                      {Math.floor(selectedActiveBiz.rating * 140)}
                    </span>
                    <span className="text-[7.5px] text-emerald-600 font-bold">↑ 18% Traffic</span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-[9px] block text-stone-400 font-bold uppercase">Active Coupons</span>
                    <span className="text-sm font-black text-stone-900 block mt-1">
                      {selectedActiveBiz.coupons.length}
                    </span>
                    <span className="text-[7.5px] text-orange-650 font-bold">Pub deals</span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="text-[9px] block text-stone-400 font-bold uppercase">Deals Claimed</span>
                    <span className="text-sm font-black text-stone-900 block mt-1">
                      {selectedActiveBiz.coupons.length * 14}
                    </span>
                    <span className="text-[7.5px] text-emerald-600 font-bold">Local codes</span>
                  </div>
                </div>

                <div className="bg-amber-50/20 border border-amber-300 rounded-xl p-3 space-y-2">
                  <h6 className="font-bold text-[10.5px] text-amber-905 flex items-center gap-1 leading-none">
                    <Sparkles className="w-4 h-4 text-amber-700 animate-spin-slow" />
                    How to optimize your Steel City Community presence
                  </h6>
                  <p className="text-[10px] leading-relaxed text-stone-600">
                    Create promotions or sponsor a neighborhood forum event! Companies that sponsor events within 1.5 miles of their store coordinates see a <strong className="text-stone-900">3x increase in weekly coupon claims</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* CASE 3: COUPONS MANAGER */}
            {activeTab === "coupons" && (
              <div className="space-y-4">
                <h5 className="font-bold text-xs text-stone-900 border-b pb-1">Create Daily Promotion Coupon</h5>
                
                <form onSubmit={handleCreateCoupon} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Coupon Title:</label>
                      <input
                        type="text"
                        required
                        value={newCouponTitle}
                        onChange={(e) => setNewCouponTitle(e.target.value)}
                        placeholder="e.g. 15% Off Half-Sloppers"
                        className="w-full bg-white border p-1.5 text-xs rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Promo Code:</label>
                      <input
                        type="text"
                        required
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="e.g. SLOPPER15"
                        className="w-full bg-white border p-1.5 text-xs rounded font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Coupon Description:</label>
                    <input
                      type="text"
                      value={newCouponDesc}
                      onChange={(e) => setNewCouponDesc(e.target.value)}
                      placeholder="e.g. Get 15% off any half slopper with fries this Tuesday!"
                      className="w-full bg-white border p-1.5 text-xs rounded"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Publish Live Public Coupon
                  </button>
                </form>

                {/* Existing Coupons list */}
                <div className="space-y-2 border-t pt-4">
                  <h6 className="font-bold text-[10px] uppercase font-mono tracking-wider text-stone-400">Current active coupons ({selectedActiveBiz.coupons.length})</h6>
                  {selectedActiveBiz.coupons.length === 0 ? (
                    <p className="text-stone-400 text-xs italic font-sans">No coupons currently active.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedActiveBiz.coupons.map((cp) => (
                        <div key={cp.id} className="bg-stone-50 border p-2.5 rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-stone-955">{cp.title}</span>
                            <span className="font-mono text-emerald-850 bg-emerald-50 border px-1.5 py-0.2 rounded text-[10px]">{cp.code}</span>
                          </div>
                          <p className="text-[10.5px] text-stone-500 leading-normal">{cp.description}</p>
                          <span className="text-[9px] font-mono font-bold block text-stone-400 mt-1">⌛ Expiry: {cp.expiry}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CASE 4: JOBS MANAGER */}
            {activeTab === "jobs" && (
              <div className="space-y-4">
                <h5 className="font-bold text-xs text-stone-900 border-b pb-1">Broadcast Local Pueblo Job</h5>
                
                <form onSubmit={handleCreateJob} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Job Title:</label>
                      <input
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Row Cook / Prep Chef"
                        className="w-full bg-white border p-1.5 text-xs rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Wage Rate / Salary:</label>
                      <input
                        type="text"
                        value={jobSalary}
                        onChange={(e) => setJobSalary(e.target.value)}
                        placeholder="e.g. $18.50 - $22.00 / hr"
                        className="w-full bg-white border p-1.5 text-xs rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Employment Category Type:</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as JobType)}
                      className="w-full bg-white border p-1.5 text-xs rounded focus:outline-none"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Seasonal">Seasonal</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Job Requirements / Descriptions:</label>
                    <textarea
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      rows={2}
                      placeholder="Describe roles, tasks, working environment, and benefits..."
                      className="w-full bg-white border p-1.5 text-xs rounded focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Submit Open Job Position
                  </button>
                </form>
              </div>
            )}

            {/* CASE 5: CREATE EVENTS */}
            {activeTab === "events" && (
              <div className="space-y-4">
                <h5 className="font-bold text-xs text-stone-900 border-b pb-1">Sponsor Local Shop Event</h5>
                
                <form onSubmit={handleCreateEvent} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Event Name / Title:</label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g. Slopper Eating Contest"
                        className="w-full bg-white border p-1.5 text-xs rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Category Type:</label>
                      <select
                        value={eventCategory}
                        onChange={(e) => setEventCategory(e.target.value)}
                        className="w-full bg-white border p-1.5 text-xs rounded font-sans"
                      >
                        <option value="Community Events">Community Events</option>
                        <option value="Festivals">Festivals</option>
                        <option value="Farmers Markets">Farmers Markets</option>
                        <option value="Concerts">Concerts</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Scheduled Date:</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-white border p-1.5 text-xs rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Time Block:</label>
                      <input
                        type="text"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        placeholder="e.g. 5:00 PM - 8:00 PM"
                        className="w-full bg-white border p-1.5 text-xs rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Meeting Specific Venue Location:</label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Leave empty to default to store address"
                      className="w-full bg-white border p-1.5 text-xs rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Event Details:</label>
                    <textarea
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      rows={2}
                      placeholder="Write brief outlines, benefits, entries cost, etc."
                      className="w-full bg-white border p-1.5 text-xs rounded focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Schedule Sponsored Event
                  </button>
                </form>
              </div>
            )}

            {/* CASE 6: RESPOND TO CIVIC REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                <h5 className="font-bold text-xs text-stone-900 border-b pb-1">Resident Feedback & Reviews</h5>
                
                {(!selectedActiveBiz.reviews || selectedActiveBiz.reviews.length === 0) ? (
                  <p className="text-stone-400 text-xs italic font-sans py-3 text-center">No customer reviews published yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedActiveBiz.reviews.map((rev, index) => (
                      <div key={index} className="bg-stone-50 border p-3 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <strong className="text-stone-850">⭐ {rev.rating} rating by {rev.author}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">{rev.date}</span>
                        </div>
                        <p className="text-stone-605 whitespace-pre-wrap font-sans">"{rev.text}"</p>
                        
                        {selectedReviewIndex === index ? (
                          <div className="space-y-1.5 pt-2 border-t">
                            <textarea
                              value={ownerReplyText}
                              onChange={(e) => setOwnerReplyText(e.target.value)}
                              rows={2}
                              placeholder="Type official owner reply feedback here..."
                              className="w-full bg-white border p-1.5 text-xs rounded focus:outline-none font-sans"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddReviewReply(index)}
                                className="bg-stone-950 text-white font-bold text-[10px] px-3 py-1 rounded cursor-pointer"
                              >
                                Send Reply
                              </button>
                              <button
                                onClick={() => setSelectedReviewIndex(null)}
                                className="bg-white border text-stone-500 text-[10px] px-2 py-1 rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReviewIndex(index);
                              setOwnerReplyText("");
                            }}
                            className="bg-white border hover:bg-stone-100 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 text-stone-600 block"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Reply as Owner
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
