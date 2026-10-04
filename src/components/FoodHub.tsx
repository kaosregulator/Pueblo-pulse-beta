import React, { useState } from "react";
import {
  Search,
  Star,
  Clock,
  MapPin,
  Phone,
  Tag,
  Check,
  Award,
  Plus,
  Share2,
  Heart,
  Eye,
  Camera,
  Briefcase,
  Store,
  Compass,
  CheckCircle,
  HelpCircle,
  DollarSign
} from "lucide-react";
import { BusinessItem, BusinessCategory, CouponItem, JobItem } from "../types";

interface FoodHubProps {
  businesses: BusinessItem[];
  userProfile: any;
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
  onUpdatePoints: (pointsAdd: number) => void;
  onSelectBusiness: (type: string, item: any) => void;
  onAddCouponToBusiness: (businessId: string, coupon: CouponItem) => void;
  onAddJob: (job: JobItem) => void;
  onUpdateBusinesses: (updated: BusinessItem[]) => void;
  onChangeTab?: (tab: string) => void;
}

const BUSINESS_CATEGORIES: string[] = [
  "Restaurants",
  "Food Trucks",
  "Retail",
  "Automotive",
  "Healthcare",
  "Contractors",
  "Entertainment",
  "Local Services"
];

export default function FoodHub({
  businesses,
  userProfile,
  setUserProfile,
  onUpdatePoints,
  onSelectBusiness,
  onAddCouponToBusiness,
  onAddJob,
  onUpdateBusinesses,
  onChangeTab,
}: FoodHubProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  
  // Interactive Overlays
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [claimedCouponId, setClaimedCouponId] = useState<string | null>(null);
  
  // Guided Claiming States
  const [claimingBusiness, setClaimingBusiness] = useState<BusinessItem | null>(null);
  const [claimOwnerName, setClaimOwnerName] = useState(userProfile.name || "");
  const [claimDocName, setClaimDocName] = useState("Pueblo_County_License_2026.pdf");
  const [claimDocType, setClaimDocType] = useState("Colorado State LLC Filing");
  const [claimProgressStep, setClaimProgressStep] = useState(1); // 1 = Entry/Forms, 2 = simulated bar counter, 3 = Completed confirmation
  
  // Add Review Local states
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewPhoto, setReviewPhoto] = useState<string>("");

  // Create Coupon Local states (for Claimed owners)
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCouponTitle, setNewCouponTitle] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponCode, setNewCouponCode] = useState("");

  // Create Job Local states (for Claimed owners)
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobType, setNewJobType] = useState("Full-Time");
  const [newJobSalary, setNewJobSalary] = useState("$20 - $25/hr");
  const [newJobDesc, setNewJobDesc] = useState("");

  const preloadedReviewPics = [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=300"
  ];

  const handleClaimListing = (biz: BusinessItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setClaimingBusiness(biz);
    setClaimOwnerName(userProfile.name || "");
    setClaimProgressStep(1);
  };

  const handleClaimCoupon = (coupon: CouponItem, bizName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClaimedCouponId(coupon.id);
    onUpdatePoints(15);
  };

  const handleFollowBusinessToggle = (biz: BusinessItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentFollowed = userProfile.followedBusinesses || [];
    const isFollowing = currentFollowed.includes(biz.id);

    let nextFollowed: string[];
    if (isFollowing) {
      nextFollowed = currentFollowed.filter((id: string) => id !== biz.id);
    } else {
      nextFollowed = [...currentFollowed, biz.id];
    }

    setUserProfile((prev: any) => ({
      ...prev,
      followedBusinesses: nextFollowed
    }));
    onUpdatePoints(10);
  };

  const handleFavoriteRestaurantToggle = (biz: BusinessItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentFavs = userProfile.savedPosts || []; // using savedPosts to carry favorites list
    const isFav = currentFavs.includes(`fav-${biz.id}`);

    let nextFavs: string[];
    if (isFav) {
      nextFavs = currentFavs.filter((id: string) => id !== `fav-${biz.id}`);
    } else {
      nextFavs = [...currentFavs, `fav-${biz.id}`];
    }

    setUserProfile((prev: any) => ({
      ...prev,
      savedPosts: nextFavs
    }));
    onUpdatePoints(10);
  };

  // Submit Review form
  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    if (!selectedBusiness) return;

    const newReview = {
      author: userProfile.name,
      rating: reviewRating,
      text: reviewText,
      date: new Date().toISOString().split("T")[0],
      imageUrl: reviewPhoto || undefined
    };

    // Calculate rating
    const currentReviews = selectedBusiness.reviews || [];
    const updatedReviews = [newReview, ...currentReviews];
    const avgRating = parseFloat(
      (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
    );

    const updated = businesses.map((b) => {
      if (b.id === selectedBusiness.id) {
        return {
          ...b,
          rating: avgRating,
          reviews: updatedReviews
        };
      }
      return b;
    });

    onUpdateBusinesses(updated);
    onUpdatePoints(30); // Points for leaving local review
    setReviewText("");
    setReviewPhoto("");
    
    // Update local selected business so UI refreshes instant
    setSelectedBusiness((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        rating: avgRating,
        reviews: updatedReviews
      };
    });

    alert("⭐ Thank you! Your local verified review has been submitted. +30 Rep points!");
  };

  // Claimed Owner creates Coupon Deal
  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    if (!newCouponTitle.trim() || !newCouponDesc.trim() || !newCouponCode.trim()) return;

    const newCoupon: CouponItem = {
      id: `cp-${Date.now()}`,
      title: newCouponTitle,
      description: newCouponDesc,
      code: newCouponCode.toUpperCase(),
      expiry: "Expires 30 Days",
      isPremiumOnly: false
    };

    onAddCouponToBusiness(selectedBusiness.id, newCoupon);
    setNewCouponTitle("");
    setNewCouponDesc("");
    setNewCouponCode("");
    setShowCouponForm(false);
    
    // update current selected biz list
    setSelectedBusiness((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        coupons: [...(prev.coupons || []), newCoupon]
      };
    });

    alert("🎟 Discount coupon uploaded successfully! Ready for residents on Home feed.");
  };

  // Claimed Owner drafts Job Listing
  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    if (!newJobTitle.trim() || !newJobDesc.trim()) return;

    const newJob: JobItem = {
      id: `jb-${Date.now()}`,
      title: newJobTitle,
      businessName: selectedBusiness.name,
      type: newJobType as any,
      location: selectedBusiness.address,
      neighborhood: selectedBusiness.neighborhood,
      salary: newJobSalary,
      description: newJobDesc,
      requirements: ["Reliable", "Customer Focused"],
      appliedUsers: []
    };

    onAddJob(newJob);
    setNewJobTitle("");
    setNewJobDesc("");
    setShowJobForm(false);

    alert("💼 Job advert published on the local board! Recruiter profile updated.");
  };

  const filteredBiz = businesses.filter((bz) => {
    const matchesSearch =
      bz.name.toLowerCase().includes(search.toLowerCase()) ||
      bz.description.toLowerCase().includes(search.toLowerCase());
    
    // Compatibility Category grouping
    const matchesCategory =
      selectedCategory === "all" ||
      bz.category === selectedCategory ||
      (selectedCategory === "Restaurants" && bz.category === "Mexican") ||
      (selectedCategory === "Restaurants" && bz.category === "Burgers") ||
      (selectedCategory === "Restaurants" && bz.category === "Pizza") ||
      (selectedCategory === "Restaurants" && bz.category === "Chinese") ||
      (selectedCategory === "Restaurants" && bz.category === "Breakfast") ||
      (selectedCategory === "Restaurants" && bz.category === "BBQ") ||
      (selectedCategory === "Restaurants" && bz.category === "Coffee");

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="business-board">
      
      {/* VOUCHER TICKET MODAL */}
      {claimedCouponId && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-2 border-orange-700 max-w-[340px] w-full p-4 rounded-2xl shadow-2xl relative space-y-3 font-sans text-stone-900">
            <div className="text-center space-y-1 animate-bounce-slow">
              <Award className="w-8 h-8 text-orange-700 mx-auto" strokeWidth={1.5} />
              <h3 className="font-bold text-sm text-stone-900">Voucher Successfully Activated!</h3>
              <p className="text-[10px] text-stone-500 font-semibold font-mono uppercase">Reputation Balance Credited +15 Points</p>
            </div>

            <div className="bg-stone-50 border-t border-b border-dashed border-stone-300 p-3 rounded-md relative -mx-4 text-center space-y-2">
              <div className="absolute -top-1.5 left-2 bg-white w-3 h-3 rounded-full border border-dashed border-stone-300"></div>
              <div className="absolute -top-1.5 right-2 bg-white w-3 h-3 rounded-full border border-dashed border-stone-300"></div>
              
              <div className="text-[10px] uppercase font-bold tracking-wider text-orange-800">
                Pueblo Community Reward
              </div>
              
              {(() => {
                const bz = businesses.find((b) => b.coupons.some((c) => c.id === claimedCouponId));
                const coup = bz?.coupons.find((c) => c.id === claimedCouponId);
                return (
                  <>
                    <h4 className="font-bold text-xs text-stone-900 leading-tight">{coup?.title}</h4>
                    <p className="text-[10px] text-stone-500 px-2 leading-relaxed">{coup?.description}</p>
                    <div className="text-[11px] font-mono bg-stone-200 py-1 px-3 w-fit mx-auto rounded font-bold text-stone-850">
                      VOUCHER CODE: {coup?.code}
                    </div>
                  </>
                );
              })()}

              <div className="pt-2 font-mono text-[8.5px] text-stone-400 font-bold uppercase">
                PROUDLY SUPPORTING PUEBLO LOCALS
              </div>
            </div>

            <p className="text-[9.5px] text-stone-400 text-center leading-relaxed">
              Show this screen to your server at the store location to redeem this deal!
            </p>

            <button
              onClick={() => setClaimedCouponId(null)}
              className="w-full bg-stone-900 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer text-center block hover:bg-stone-800 transition-all font-sans"
            >
              Close Ticket
            </button>
          </div>
        </div>
      )}

      {/* Directory Search & Filter bar */}
      <div className="bg-white border border-stone-250 p-4 rounded-2xl shadow-3xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search local directory (restaurants, food trucks, contractors, retail)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-50 border border-stone-250 text-xs rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div className="text-[11.5px] bg-amber-50 rounded-xl px-3 py-1 text-amber-900 font-semibold border border-amber-100 flex items-center gap-1.5 hover:shadow-2xs cursor-pointer" onClick={() => alert("🏢 Claim unclaimed listings to activate Premium Business Tools: deals drafts, job openings, and premium verification tags!")}>
            <Award className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Are you a Business Owner? Claim listing to post deals & jobs!</span>
          </div>
        </div>

        {/* Categories Carousel scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-full shrink-0 transition-all cursor-pointer ${
              selectedCategory === "all" ? "bg-stone-900 text-white shadow-2xs" : "bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            🏢 Class: All Businesses
          </button>
          {BUSINESS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-full shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat ? "bg-orange-700 text-white shadow-2xs" : "bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBiz.map((biz) => {
          const isFollowing = userProfile.followedBusinesses?.includes(biz.id);
          const isFavorite = userProfile.savedPosts?.includes(`fav-${biz.id}`);
          const isClaimedByMe = biz.claimed && biz.ownerId === userProfile.email;

          return (
            <div
              key={biz.id}
              onClick={() => setSelectedBusiness(biz)}
              className="bg-white border border-stone-200 hover:border-orange-650 p-4 rounded-xl shadow-3xs cursor-pointer hover:shadow-2xs transition-all space-y-3 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-stone-950 group-hover:text-orange-700 transition-colors">{biz.name}</span>
                    {biz.claimed ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 text-[8px] font-bold py-0.2 px-1.5 rounded uppercase font-mono">
                        ✓ Verified Owner
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-500 border border-stone-200 text-[8px] font-bold py-0.2 px-1.5 rounded uppercase font-mono">
                        Unclaimed Listing
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 font-sans">
                    Category: <span className="font-bold uppercase text-stone-500">{biz.category || "Local Business"}</span> • District: <span className="font-bold text-stone-550 uppercase">{biz.neighborhood.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {/* Favorite indicator to heart */}
                  <button
                    onClick={(e) => handleFavoriteRestaurantToggle(biz, e)}
                    className="p-1 px-2 border rounded-md hover:bg-stone-50 text-stone-400 hover:text-red-600 transition-all cursor-pointer"
                    title="Add Favorite Place"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                  <button
                    onClick={(e) => handleFollowBusinessToggle(biz, e)}
                    className={`text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer border ${
                      isFollowing ? "bg-stone-900 border-stone-900 text-white" : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              </div>

              <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-2">{biz.description}</p>

              {/* Action buttons (Claim, RSVP, deals) */}
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                <span className="bg-amber-100 text-amber-900 border border-amber-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded leading-none flex items-center gap-1">
                  ★ {biz.rating || "5.0"} <span className="text-[8.5px] text-stone-400 font-sans">({biz.reviews?.length || 0} reviews)</span>
                </span>

                <div className="flex gap-1.5">
                  {!biz.claimed && (
                    <button
                      onClick={(e) => handleClaimListing(biz, e)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-sans font-bold px-2 py-1 rounded-md transition-all cursor-pointer"
                    >
                      Claim Listing
                    </button>
                  )}
                  {isClaimedByMe && (
                    <span className="bg-emerald-50 text-emerald-800 border-2 border-dashed border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                      Owned by Me
                    </span>
                  )}
                  <button className="bg-stone-900 hover:bg-stone-850 text-white text-[9.5px] font-sans font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1">
                    Reviews & Deals ({biz.coupons?.length || 0})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL DEEP DIVE DIALOG DRAWER */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto animate-fade-in">
          <div className="bg-white border rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 relative font-sans text-stone-900 space-y-4">
            
            {/* Header branding */}
            <div className="flex justify-between items-start border-b border-stone-150 pb-3">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-sans font-black text-sm text-stone-950 leading-tight">{selectedBusiness.name}</h3>
                  {selectedBusiness.claimed ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-250">Verified Partner</span>
                  ) : (
                    <button onClick={(e) => handleClaimListing(selectedBusiness, e)} className="text-[8.5px] font-bold font-sans bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 py-0.2 hover:bg-amber-200 cursor-pointer">Claim Listing</button>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  📍 {selectedBusiness.address} • {selectedBusiness.neighborhood.toUpperCase().replace("_", " ")}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedBusiness(null);
                  setShowCouponForm(false);
                  setShowJobForm(false);
                }}
                className="text-stone-400 hover:text-stone-700 font-bold text-xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

            {/* Claimed Premium Administration Section */}
            {selectedBusiness.claimed && selectedBusiness.ownerId === userProfile.email && (
              <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl space-y-2">
                <h5 className="font-bold text-[10.5px] text-emerald-900 uppercase font-mono flex items-center gap-1">
                  <Award className="w-4 h-4 text-emerald-800" />
                  Premium Owner Admin Desk
                </h5>
                <p className="text-[10px] text-stone-600 leading-normal">
                  You successfully claimed verification. Customize client deals, hiring calendars, or publishing campaigns!
                </p>
                <div className="flex gap-2 text-[10px]">
                  <button
                    onClick={() => { setShowCouponForm(!showCouponForm); setShowJobForm(false); }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Publish Coupon/Deal
                  </button>
                  <button
                    onClick={() => { setShowJobForm(!showJobForm); setShowCouponForm(false); }}
                    className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5 mb-0.5" />
                    Publish Hiring Job
                  </button>
                </div>

                {/* Drawers forms */}
                {showCouponForm && (
                  <form onSubmit={handleCreateCouponSubmit} className="p-3 bg-white border border-emerald-250 rounded-xl space-y-2 text-stone-900 animate-fade-in">
                    <h6 className="font-bold text-[10px] text-stone-800 uppercase font-sans">Draft Discount Coupon Deal</h6>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input type="text" placeholder="Coupon Title (e.g., Buy One, Get One Free!)" value={newCouponTitle} onChange={(e) => setNewCouponTitle(e.target.value)} className="bg-stone-50 border rounded px-2 py-1 text-[11px] outline-none" required />
                      <input type="text" placeholder="Promo Code (e.g., CHILEBOGO)" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} className="bg-stone-50 border rounded px-2 py-1 text-[11px] outline-none uppercase font-mono" required />
                    </div>
                    <input type="text" placeholder="Describe eligibility rules or discounts..." value={newCouponDesc} onChange={(e) => setNewCouponDesc(e.target.value)} className="w-full bg-stone-50 border rounded px-2 py-1 text-[11px] outline-none" required />
                    <button type="submit" className="w-full bg-emerald-600 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer">Submit Coupon Voucher</button>
                  </form>
                )}

                {showJobForm && (
                  <form onSubmit={handleCreateJobSubmit} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 text-stone-900 animate-fade-in">
                    <h6 className="font-bold text-[10px] text-stone-800 uppercase font-sans">Draft Local Employment Advert</h6>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <input type="text" placeholder="Job Title (e.g. Line Cook)" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} className="bg-stone-50 border rounded px-2 py-1 text-[11px] col-span-2 outline-none" required />
                      <select value={newJobType} onChange={(e) => setNewJobType(e.target.value)} className="bg-stone-50 border rounded px-2 py-1 text-[11px] outline-none font-bold">
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Seasonal">Seasonal</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input type="text" placeholder="Sallary (e.g. $18/hr)" value={newJobSalary} onChange={(e) => setNewJobSalary(e.target.value)} className="bg-stone-50 border rounded px-2 py-1 text-[11px] outline-none font-mono" required />
                      <input type="text" placeholder="Key description..." value={newJobDesc} onChange={(e) => setNewJobDesc(e.target.value)} className="bg-stone-50 border rounded px-2 py-1 text-[11px] outline-none" required />
                    </div>
                    <button type="submit" className="w-full bg-stone-900 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer">Post Live Job Opening</button>
                  </form>
                )}
              </div>
            )}

            {/* Active Coupon Deals List */}
            {selectedBusiness.coupons && selectedBusiness.coupons.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block border-b pb-1">Hometown Coupons</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedBusiness.coupons.map((c) => (
                    <div key={c.id} className="bg-amber-50/40 border border-dashed border-amber-300 p-3 rounded-xl flex justify-between items-center gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">{c.title}</h4>
                        <p className="text-[10px] text-stone-500">{c.description}</p>
                      </div>
                      <button
                        onClick={(e) => handleClaimCoupon(c, selectedBusiness.name, e)}
                        className="bg-stone-900 hover:bg-stone-850 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-all"
                      >
                        Claim deal Voucher
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews list */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block border-b pb-1">Customer Reviews</span>
              {(!selectedBusiness.reviews || selectedBusiness.reviews.length === 0) ? (
                <p className="text-stone-400 text-[10.5px] italic text-center py-2">No verified reviews submitted yet. Be the first to tell neighbors!</p>
              ) : (
                <div className="space-y-3 max-h-[160px] overflow-y-auto">
                  {selectedBusiness.reviews.map((r, i) => (
                    <div key={i} className="border-b border-stone-100 last:border-0 pb-2.5 last:pb-0 space-y-1">
                      <div className="flex justify-between text-[10.5px]">
                        <span className="font-bold text-stone-800">{r.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-mono text-[9px]">{"★".repeat(r.rating)}</span>
                          <span className="text-[8.5px] text-stone-400 font-mono">{r.date}</span>
                        </div>
                      </div>
                      <p className="text-stone-600 text-[11px] leading-relaxed font-sans">{r.text}</p>
                      {r.imageUrl && (
                        <div className="w-20 h-14 rounded-lg overflow-hidden border">
                          <img src={r.imageUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave Review Form */}
            <form onSubmit={handleAddReviewSubmit} className="bg-stone-50 p-4 border rounded-xl space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-stone-500 block">Leave your own review</span>
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-stone-500 font-semibold mb-1">Your rating:</span>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="bg-white border rounded px-2 py-1 outline-none text-amber-500 font-bold"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  <option value={2}>⭐⭐ (2 Stars)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
              </div>

              <textarea
                placeholder="Write your honest comments about this business..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full h-14 bg-white border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-stone-400 resize-none font-sans"
                maxLength={200}
                required
              />

              <div className="flex justify-between items-center bg-white p-2 border rounded-lg">
                <div className="flex items-center gap-1 text-[10.5px] text-stone-500">
                  <Camera className="w-4 h-4 text-stone-400" />
                  <span>Attach food/promo image preview:</span>
                </div>
                <div className="flex gap-1">
                  {preloadedReviewPics.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewPhoto(p)}
                      className={`w-8 h-8 rounded border relative overflow-hidden cursor-pointer ${reviewPhoto === p ? "border-orange-600 border-2" : "border-stone-200"}`}
                    >
                      <img src={p} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-850 text-white font-sans font-bold text-xs py-1.5 rounded-lg cursor-pointer text-center block transition-all"
              >
                Submit Verified Review Card
              </button>
            </form>

          </div>
        </div>
      )}

      {/* MULTI-STEP CORPORATE VERIFICATION & CLAIMS WIZARD */}
      {claimingBusiness && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-fade-in" id="claims-wizard-overlay">
          <div className="bg-white border-2 border-stone-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-stone-900 px-6 py-4.5 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono bg-orange-700 text-white px-2 py-0.5 rounded uppercase font-black">
                  Secured LLC Claim Portal
                </span>
                <h3 className="font-sans font-extrabold text-sm mt-1 tracking-tight">
                  🏢 Claiming: {claimingBusiness.name}
                </h3>
              </div>
              <button
                onClick={() => setClaimingBusiness(null)}
                className="bg-white/10 hover:bg-white/20 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step indicators */}
            <div className="grid grid-cols-3 border-b border-stone-100 bg-stone-50 p-3 text-center text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold select-none">
              <div className={`py-1 rounded ${claimProgressStep === 1 ? "bg-stone-200 text-stone-900 font-black" : ""}`}>
                1. Credentials
              </div>
              <div className={`py-1 rounded ${claimProgressStep === 2 ? "bg-stone-200 text-stone-900 font-black" : ""}`}>
                2. Documents
              </div>
              <div className={`py-1 rounded ${claimProgressStep === 3 ? "bg-stone-200 text-stone-900 font-black" : ""}`}>
                3. Finalize
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* STEP 1: CREDENTIALS */}
              {claimProgressStep === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl text-[11px] leading-relaxed">
                    ℹ️ You are walking through Pueblo's <strong>Verified Merchant Stream</strong>. Please supply your credential details below to sync with county property maps.
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-mono uppercase font-black text-stone-500">
                      Legal Owner Name
                    </label>
                    <input
                      type="text"
                      value={claimOwnerName}
                      onChange={(e) => setClaimOwnerName(e.target.value)}
                      placeholder="e.g. Christopher Osorio"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-mono uppercase font-black text-stone-500">
                      Corporate Administrative Email
                    </label>
                    <input
                      type="email"
                      defaultValue={userProfile.email}
                      className="w-full bg-stone-100 border border-stone-200 text-stone-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
                      readOnly
                    />
                    <p className="text-[9.5px] text-stone-400 font-mono">Synced from currently active secure session ID.</p>
                  </div>

                  <button
                    onClick={() => {
                      if (!claimOwnerName.trim()) {
                        alert("⚠️ Please state your Legal Owner Name first.");
                        return;
                      }
                      setClaimProgressStep(2);
                    }}
                    className="w-full mt-2 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs py-2 rounded-xl text-center cursor-pointer transition-all"
                  >
                    Next Tab: Verify Corporate Documents →
                  </button>
                </div>
              )}

              {/* STEP 2: DOCUMENTS */}
              {claimProgressStep === 2 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-amber-50 border border-amber-100 text-amber-900 rounded-xl text-[11px] leading-relaxed">
                    📂 Upload or declare matching legal records validating your executive authority over <strong>{claimingBusiness.name}</strong>.
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-mono uppercase font-black text-stone-500">
                      Select Property Record Document Type
                    </label>
                    <select
                      value={claimDocType}
                      onChange={(e) => setClaimDocType(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Colorado State LLC Filing">Colorado Secretary of State LLC Filing</option>
                      <option value="Pueblo County Retail Tax Certificate">Pueblo County Retail Sales Tax License</option>
                      <option value="Municipal Food Handler Safety Card">Colorado Dept. of Agriculture Food Permit</option>
                      <option value="Utility Property Deed / Bill">Active Water/Electric Utility Account Bill</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-mono uppercase font-black text-stone-500">
                      Document Filename / ID Number
                    </label>
                    <input
                      type="text"
                      value={claimDocName}
                      onChange={(e) => setClaimDocName(e.target.value)}
                      placeholder="e.g. Pueblo_County_License_2026.pdf"
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>

                  {/* Drag and Drop Simulation UI */}
                  <div className="border-2 border-dashed border-stone-200 p-4 rounded-xl text-center text-stone-500 space-y-1 bg-stone-50 hover:bg-stone-100/50 transition-all select-none">
                    <span className="text-xl block">📄</span>
                    <span className="text-[10.5px] block font-semibold text-stone-700">Drag & drop your files here</span>
                    <span className="text-[9px] block text-stone-400 font-mono">PDF, PNG, JPG accepted (Max size 12MB)</span>
                  </div>

                  <div className="flex gap-2.5 pt-1.5">
                    <button
                      onClick={() => setClaimProgressStep(1)}
                      className="flex-1 bg-stone-100 hover:bg-stone-250 text-stone-700 font-semibold text-xs py-2 rounded-xl text-center cursor-pointer transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (!claimDocName.trim()) {
                          alert("⚠️ Please specify a valid document filename or tracking registration ID.");
                          return;
                        }
                        setClaimProgressStep(3);
                      }}
                      className="flex-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs py-2 rounded-xl text-center cursor-pointer transition-all"
                    >
                      Verify Credentials Now
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FINALIZE */}
              {claimProgressStep === 3 && (
                <div className="space-y-4 animate-fade-in text-center py-2">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center text-xl text-emerald-700 mx-auto animate-bounce">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-sans font-extrabold text-sm text-stone-900">
                      Ready to Bind Listing
                    </h4>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                      All checks have cleared. Submit this claim to verify <strong>{claimingBusiness.name}</strong> under local owner <strong>{claimOwnerName}</strong>.
                    </p>
                  </div>

                  <div className="bg-stone-50 border border-stone-150 p-3 rounded-2xl text-left text-[10px] space-y-1 max-w-sm mx-auto font-mono text-stone-600">
                    <div>👤 <strong>CLAIMANT:</strong> {claimOwnerName}</div>
                    <div>📧 <strong>PORTAL ID:</strong> {userProfile.email}</div>
                    <div>📂 <strong>VERIFICATION DOC:</strong> {claimDocType}</div>
                    <div>🎫 <strong>FILE ATTACHMENT:</strong> {claimDocName}</div>
                  </div>

                  <p className="bg-emerald-50 text-emerald-800 text-[10.5px] py-1.5 px-3 rounded-lg max-w-sm mx-auto border border-emerald-150">
                    🎁 Action grants +100 Rep points & unlocks Premium Merchant Tools!
                  </p>

                  <div className="flex gap-2.5 max-w-sm mx-auto">
                    <button
                      onClick={() => setClaimProgressStep(2)}
                      className="flex-1 bg-stone-100 hover:bg-stone-250 text-stone-700 font-semibold text-xs py-2 rounded-xl text-center cursor-pointer transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        // Recreate listings list
                        const updated = businesses.map((b) => {
                          if (b.id === claimingBusiness.id) {
                            return {
                              ...b,
                              claimed: true,
                              ownerId: userProfile.email,
                              ownerName: claimOwnerName,
                              tier: "Premium" as const
                            };
                          }
                          return b;
                        });

                        onUpdateBusinesses(updated);
                        onUpdatePoints(100);
                        
                        // Close modal & details
                        setClaimingBusiness(null);
                        setSelectedBusiness(null);
                        
                        alert(`🎉 Congratulations! "${claimingBusiness.name}" is now fully claimed and active. +100 Points added!`);
                      }}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-2 rounded-xl text-center cursor-pointer transition-all shadow-xs"
                    >
                      File Verified Claim!
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
