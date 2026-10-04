import React, { useState } from "react";
import {
  Send,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
  Megaphone,
  ShieldAlert,
  BadgeCheck,
  Users,
  Plus,
  FileText,
  Share2,
  Bookmark,
  UserPlus,
  UserCheck,
  Check,
  MapPin,
  Calendar,
  Utensils,
  Tag,
  Briefcase,
  Search,
  Eye,
  Camera,
  Video,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Sparkles,
  DollarSign,
  Trash2
} from "lucide-react";
import { ForumPost, UserProfile, EventItem, BusinessItem, JobItem, LostFoundItem, SafetyAlert, NeighborhoodID } from "../types";
import { SvgAvatar } from "./AvatarCreator";

interface HomeFeedProps {
  posts: ForumPost[];
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  alerts: SafetyAlert[];
  events: EventItem[];
  businesses: BusinessItem[];
  jobs: JobItem[];
  lostFound: LostFoundItem[];
  onAddPost: (newPost: ForumPost) => void;
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, content: string) => void;
  onRSVPToggle: (eventId: string) => void;
  onApplyJob: (jobId: string) => void;
  onSelectPin: (type: string, item: any) => void;
  onChangeTab: (tab: any) => void;
  onSavePostToggle: (postId: string) => void;
  onFollowUserToggle: (author: string) => void;
  onFollowBusinessToggle: (businessId: string) => void;
  onDeleteDoc?: (collectionName: string, id: string) => void;
}

export default function HomeFeed({
  posts,
  userProfile,
  setUserProfile,
  alerts,
  events,
  businesses,
  jobs,
  lostFound,
  onAddPost,
  onLikePost,
  onCommentPost,
  onRSVPToggle,
  onApplyJob,
  onSelectPin,
  onChangeTab,
  onSavePostToggle,
  onFollowUserToggle,
  onFollowBusinessToggle,
  onDeleteDoc,
}: HomeFeedProps) {
  // Post Filter type
  const [selectedPostType, setSelectedPostType] = useState<string>("all");
  const [showWriteForm, setShowWriteForm] = useState(false);

  // New Post Form Local States
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPostType, setNewPostType] = useState<string>("📢 Community Updates");
  const [newHood, setNewHood] = useState<NeighborhoodID>("downtown");
  const [mockPhoto, setMockPhoto] = useState<string>("");
  const [mockVideo, setMockVideo] = useState<string>("");
  const [newRating, setNewRating] = useState<number>(5);
  const [activeComments, setActiveComments] = useState<Record<string, string>>({});
  
  // Status checkouts
  const [claimedCoupon, setClaimedCoupon] = useState<string | null>(null);
  const [appliedJobsLocally, setAppliedJobsLocally] = useState<string[]>([]);
  const [localComments, setLocalComments] = useState<Record<string, string>>({});

  // Simulated visual upload
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Distance range selector inside Home Preview
  const [nearMeRadius, setNearMeRadius] = useState<number>(5);

  const POST_TYPES = [
    "📢 Community Updates",
    "🎉 Events",
    "🐕 Lost & Found",
    "🏠 Garage Sales",
    "🍔 Restaurant Reviews",
    "📸 Local Photos",
    "❓ Questions",
    "💼 Jobs",
    "🚧 Road Issues",
    "⚠️ Alerts",
    "🏛️ History Posts",
    "🏪 Business Promotions"
  ];

  // Preseeded mock pictures to simulate uploads
  const MOCK_PICS = [
    { name: "Pueblo Chile", url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400" },
    { name: "Slopper", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Union Avenue", url: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=400" },
    { name: "Beagle", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400" }
  ];

  const handleMockPhotoSelect = (url: string) => {
    setIsUploadingPhoto(true);
    setTimeout(() => {
      setMockPhoto(url);
      setIsUploadingPhoto(false);
    }, 600);
  };

  const handleMockVideoSelect = () => {
    setIsUploadingVideo(true);
    setTimeout(() => {
      setMockVideo("https://assets.mixkit.co/videos/preview/mixkit-farmer-roasting-chile-farm-42281-large.mp4");
      setIsUploadingVideo(false);
    }, 700);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: ForumPost = {
      id: `p-${Date.now()}`,
      author: userProfile.name,
      authorRole: userProfile.role,
      category: "general",
      postType: newPostType,
      title: newTitle,
      content: newContent,
      neighborhood: newHood,
      likes: [],
      comments: [],
      date: new Date().toISOString().split("T")[0],
      photoUrl: mockPhoto || undefined,
      videoUrl: mockVideo || undefined,
      rating: newPostType === "🍔 Restaurant Reviews" ? newRating : undefined,
      shares: 0,
      saves: []
    };

    onAddPost(created);
    setNewTitle("");
    setNewContent("");
    setMockPhoto("");
    setMockVideo("");
    setShowWriteForm(false);
    alert("✨ Your interactive local post has been published! +15 Reputation!");
  };

  const handlePostCommentSubmit = (postId: string) => {
    const text = activeComments[postId];
    if (!text || !text.trim()) return;

    onCommentPost(postId, text);
    setActiveComments((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleShareSimulate = (title: string) => {
    alert(`🔗 Share link copied to clipboard for: "${title}"`);
  };

  // 1. Trending Pueblo Post Selection (High Likes or Shares)
  const trendingPost = posts.reduce((prev, current) => {
    const prevScore = (prev.likes?.length || 0) + (prev.shares || 0);
    const currScore = (current.likes?.length || 0) + (current.shares || 0);
    return currScore > prevScore ? current : prev;
  }, posts[0]);

  // Filter posts based on timeline selections
  const filteredPosts = posts.filter((p) => {
    if (selectedPostType === "all") return true;
    return p.postType === selectedPostType;
  });

  return (
    <div className="space-y-8" id="primary-home-scroll">
      
      {/* 1. TRENDING PUEBLO */}
      <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-orange-950 text-stone-100 rounded-2xl p-5 shadow-md relative overflow-hidden" id="feed-sec-trending">
        <div className="absolute top-0 right-0 w-44 h-44 bg-orange-700/10 rounded-full blur-2xl"></div>
        <div className="relative space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <h2 className="font-sans font-black text-sm uppercase tracking-wider text-orange-450 leading-none">
                  Trending Pueblo
                </h2>
                <p className="text-[10px] text-stone-300 font-mono">Pueblo County General Activity Index</p>
              </div>
            </div>
            <div className="flex gap-2 text-[10px] font-mono text-stone-400 bg-stone-950/60 px-3 py-1 rounded-full border border-stone-800">
              <span>👥 1,420 Active</span>
              <span>•</span>
              <span>🌶️ 32nd Chile Countdown: 18 days</span>
            </div>
          </div>

          {trendingPost && (
            <div className="bg-stone-950/45 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-orange-650/30 text-orange-400 border border-orange-550/40 text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                  ⚡ Highly Engaged Discussion
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {trendingPost.neighborhood.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-xs text-white hover:underline cursor-pointer" onClick={() => onSelectPin("post", trendingPost)}>
                  {trendingPost.title}
                </h3>
                <p className="text-stone-300 text-xs mt-1 line-clamp-2">
                  {trendingPost.content}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/60 pt-2.5">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-stone-300">{trendingPost.author}</span>
                  <span className="bg-stone-850 px-1.5 py-0.2 rounded text-[10px] uppercase font-mono">{trendingPost.authorRole}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>👍 {trendingPost.likes.length} Likes</span>
                  <span>🔄 {trendingPost.shares || 0} Shares</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. NEAR ME PREVIEW */}
      <section className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-4" id="feed-sec-nearme">
        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-sans font-bold text-xs text-white">Near Me Cluster Radar</h3>
              <p className="text-[10px] text-stone-400 font-mono uppercase">Neighborhood proximity locator</p>
            </div>
          </div>
          
          <button
            onClick={() => onChangeTab("near_me")}
            className="text-[10.5px] text-orange-400 font-bold hover:underline flex items-center gap-1"
          >
            Open Proximity Tab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-850">
          <div className="text-xs font-sans text-stone-300">
            Current Base: <span className="font-bold text-orange-450 uppercase">{userProfile.neighborhood.replace("_", " ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-mono">Radius Filter:</span>
            <select
              value={nearMeRadius}
              onChange={(e) => setNearMeRadius(Number(e.target.value))}
              className="bg-stone-900 border border-stone-800 text-stone-200 text-xs px-2 py-0.5 rounded focus:outline-none"
            >
              <option value={1}>1 Mile (Very Local)</option>
              <option value={5}>5 Miles (Downtown Core)</option>
              <option value={10}>10 Miles (City Limits)</option>
              <option value={25}>25 Miles (Pueblo County)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-stone-950/40 p-3 rounded-lg border border-stone-850 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-amber-500 font-mono">🕒 Upcoming Nearby Events</div>
            {events.slice(0, 2).map((ev) => (
              <div key={ev.id} className="text-xs hover:bg-stone-950 p-1.5 rounded transition-all flex justify-between items-center border-b border-stone-900 last:border-0 pb-1">
                <span className="text-stone-300 font-semibold truncate max-w-[130px]">{ev.title}</span>
                <span className="text-[10px] text-stone-400">{ev.neighborhood.replace("_", " ")}</span>
              </div>
            ))}
          </div>
          <div className="bg-stone-950/40 p-3 rounded-lg border border-stone-850 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-red-400 font-mono">🐕 Local Alerts & Safety</div>
            {lostFound.filter(lf => !lf.resolved).slice(0, 2).map((lf) => (
              <div key={lf.id} className="text-xs hover:bg-stone-950 p-1.5 rounded transition-all flex justify-between items-center border-b border-stone-900 last:border-0 pb-1">
                <span className="text-stone-300 truncate max-w-[130px]">⚠ Lost {lf.type.includes("Pet") ? "Pet" : "Item"}: {lf.title}</span>
                <span className="text-[10px] text-red-450 uppercase font-mono">{lf.neighborhood.substring(0, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMMUNITY POSTS (Social Community System) */}
      <section className="space-y-4" id="feed-sec-social">
        <div className="flex justify-between items-center border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-stone-800" />
            <div>
              <h3 className="font-sans font-black text-sm text-stone-900">Pueblo Digital Public Square</h3>
              <p className="text-[10px] text-stone-400 font-mono">Real-Time Community Updates & Forums</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowWriteForm(!showWriteForm)}
            className="bg-orange-700 hover:bg-orange-850 text-white text-xs font-bold font-sans py-1.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>

        {/* Compose Form */}
        {showWriteForm && (
          <form onSubmit={handleCreatePost} className="p-4 bg-white rounded-2xl border border-stone-250 shadow-sm space-y-3 animate-fade-in" id="write-post-form">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h4 className="font-sans font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-700" />
                Draft Interactive Post
              </h4>
              <button
                type="button"
                onClick={() => setShowWriteForm(false)}
                className="text-stone-400 hover:text-stone-600 text-[11px] font-sans font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Post Type Category</label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none focus:border-orange-650"
                >
                  {POST_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Target Neighborhood</label>
                <select
                  value={newHood}
                  onChange={(e) => setNewHood(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none focus:border-orange-650"
                >
                  <option value="mesa">Mesa Area</option>
                  <option value="downtown">Downtown</option>
                  <option value="pueblo_west">Pueblo West</option>
                  <option value="bessemer">Bessemer</option>
                  <option value="union_district">Union District</option>
                  <option value="belmont">Belmont</option>
                  <option value="mesa_junction">Mesa Junction</option>
                  <option value="state_fair">State Fair Area</option>
                  <option value="riverwalk">Riverwalk</option>
                  <option value="university">University</option>
                  <option value="walking_stick">Walking Stick</option>
                </select>
              </div>

              {newPostType === "🍔 Restaurant Reviews" && (
                <div>
                  <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Star Rating (1-5)</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none focus:border-orange-650 font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (Very Good)</option>
                    <option value={3}>⭐⭐⭐ (Average)</option>
                    <option value={2}>⭐⭐ (Poor)</option>
                    <option value={1}>⭐ (Terrible)</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Headline</label>
              <input
                type="text"
                placeholder="e.g., Road block on Loop road / Found lost cat / Great slopper today"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-650"
                maxLength={70}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Detailed Story / Information</label>
              <textarea
                placeholder="What is happening in Pueblo? Reach out to your local neighborhood network..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full h-20 bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-650 resize-none"
                maxLength={300}
                required
              />
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleMockVideoSelect}
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10.5px] px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  {isUploadingVideo ? "Processing video..." : mockVideo ? "✓ Video Attached" : "Attach Video"}
                </button>
              </div>

              <div className="flex gap-1">
                {MOCK_PICS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    title={`Attach ${p.name}`}
                    onClick={() => handleMockPhotoSelect(p.url)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 relative cursor-pointer ${
                      mockPhoto === p.url ? "border-orange-600 scale-105 shadow-xs" : "border-stone-200"
                    }`}
                  >
                    <img src={p.url} className="w-full h-full object-cover" />
                    {mockPhoto === p.url && <span className="absolute inset-0 bg-orange-650/20 flex items-center justify-center text-xs font-bold text-white">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 text-white font-sans font-bold text-xs py-2 rounded-xl hover:bg-stone-850 transition-all cursor-pointer"
            >
              Publish Timeline Post Card
            </button>
          </form>
        )}

        {/* Post Type Filters list */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          <button
            onClick={() => setSelectedPostType("all")}
            className={`px-3 py-1 text-[11px] rounded-full shrink-0 transition-all font-semibold ${
              selectedPostType === "all" ? "bg-stone-900 text-white shadow-2xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            📰 All Platform Streams
          </button>
          {POST_TYPES.map((pt) => (
            <button
              key={pt}
              onClick={() => setSelectedPostType(pt)}
              className={`px-3 py-1 text-[11px] rounded-full shrink-0 transition-all font-semibold ${
                selectedPostType === pt ? "bg-orange-700 text-white shadow-2xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {pt}
            </button>
          ))}
        </div>

        {/* Posts Stream */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-6 bg-white border border-stone-200 rounded-xl">
              <p className="text-stone-400 text-xs font-sans">No matching neighborhood postings found in this feed stream.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const hasLiked = post.likes.includes(userProfile.email);
              const hasSaved = userProfile.savedPosts?.includes(post.id);
              const isFollowingAuthor = userProfile.followedUsers?.includes(post.author);

              return (
                <div key={post.id} className="bg-white border border-stone-200 rounded-xl p-4 shadow-3xs space-y-3" id={`post-${post.id}`}>
                  
                  {/* Author Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      {post.author === userProfile.name && userProfile.avatarConfig ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-orange-200 shadow-3xs">
                          <SvgAvatar config={userProfile.avatarConfig} className="w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs text-stone-600 border border-stone-200 uppercase">
                          {post.author.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-stone-900">{post.author}</span>
                          <span className="text-[9px] uppercase font-mono font-bold bg-stone-100 px-1.5 py-0.2 rounded-full text-stone-500">
                            {post.authorRole}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-sans">
                          Neighborhood: <span className="font-bold text-stone-650 uppercase">{post.neighborhood.replace("_", " ")}</span> • {post.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Follow User Trigger */}
                      {post.author !== userProfile.name && (
                        <button
                          type="button"
                          onClick={() => onFollowUserToggle(post.author)}
                          className="p-1 px-2 text-[10px] rounded border transition-all flex items-center gap-1 text-stone-500 hover:border-stone-400"
                          title="Follow Resident"
                        >
                          {isFollowingAuthor ? (
                            <>
                              <UserCheck className="w-3 h-3 text-green-600" />
                              <span className="text-green-600 font-bold">Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}

                      {onDeleteDoc && ["Super Admin", "City Administrator", "Administrator", "City Moderator"].includes(userProfile.role) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`🗑️ Are you sure you want to delete this community post: "${post.title}"?`)) {
                              onDeleteDoc("posts", post.id);
                            }
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete Post (Moderator Action)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-850 border border-orange-100 uppercase">
                        {post.postType || "📢 Updates"}
                      </span>
                    </div>
                  </div>

                  {/* Body text & ratings */}
                  <div className="space-y-2">
                    {post.rating && (
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="text-xs">
                            {i < (post.rating || 5) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                    )}
                    <h4 className="font-sans font-bold text-xs text-stone-900">{post.title}</h4>
                    <p className="text-stone-600 text-xs font-sans leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Optional Photos/Videos Media */}
                  {post.photoUrl && (
                    <div className="h-44 rounded-xl overflow-hidden border border-stone-150">
                      <img src={post.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  {post.videoUrl && (
                    <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-950 p-0.5">
                      <video src={post.videoUrl} controls className="w-full max-h-48 object-cover" muted loop />
                    </div>
                  )}

                  {/* Interaction counts & triggers */}
                  <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[10.5px] text-stone-500 select-none">
                    <div className="flex gap-4">
                      {/* Like */}
                      <button
                        onClick={() => onLikePost(post.id)}
                        className={`flex items-center gap-1 cursor-pointer transition-all ${
                          hasLiked ? "text-orange-700 font-semibold" : "hover:text-stone-850"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-orange-100" : ""}`} />
                        <span>{post.likes.length} Likes</span>
                      </button>

                      {/* Comment */}
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                        <span>{post.comments.length} Comments</span>
                      </div>

                      {/* Share */}
                      <button
                        onClick={() => handleShareSimulate(post.title)}
                        className="flex items-center gap-1 hover:text-stone-850"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Bookmark Save */}
                    <button
                      onClick={() => onSavePostToggle(post.id)}
                      className={`flex items-center gap-1 cursor-pointer transition-all ${
                        hasSaved ? "text-emerald-700 font-semibold" : "hover:text-stone-850"
                      }`}
                      title={hasSaved ? "Saved" : "Save Post"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${hasSaved ? "fill-emerald-100" : ""}`} />
                      <span>{hasSaved ? "Saved" : "Save"}</span>
                    </button>
                  </div>

                  {/* Comment Thread List */}
                  {post.comments.length > 0 && (
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-150 text-[11px] space-y-1.5 max-h-32 overflow-y-auto">
                      {post.comments.map((cm) => (
                        <div key={cm.id} className="border-b border-stone-100 last:border-0 pb-1.5 last:pb-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-bold text-stone-800 text-[10px]">{cm.author}</span>
                            <span className="text-[8px] text-stone-400 font-mono">{cm.date}</span>
                          </div>
                          <p className="font-sans text-stone-600">{cm.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply container */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add neighbors reply..."
                      value={localComments[post.id] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalComments(prev => ({ ...prev, [post.id]: val }));
                        setActiveComments(prev => ({ ...prev, [post.id]: val }));
                      }}
                      className="flex-1 bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        handlePostCommentSubmit(post.id);
                        setLocalComments(prev => ({ ...prev, [post.id]: "" }));
                      }}
                      className="bg-stone-800 text-stone-100 hover:bg-stone-900 font-bold px-3 py-1 rounded text-[10.5px] cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. EVENTS HAPPENING TODAY */}
      <section className="bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs space-y-4" id="feed-sec-events">
        <div className="flex justify-between items-center border-b border-stone-150 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-orange-700 animate-pulse" />
            <div>
              <h3 className="font-sans font-bold text-xs text-stone-900">Events Happening Today</h3>
              <p className="text-[10px] text-stone-400 font-mono uppercase">Local schedule and festival guides</p>
            </div>
          </div>
          <button
            onClick={() => onChangeTab("events")}
            className="text-[10px] text-orange-700 font-bold hover:underline"
          >
            See Calendar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {events.slice(0, 2).map((ev) => {
            const hasRSVP = ev.rsvps.includes(userProfile.email);
            return (
              <div key={ev.id} className="border border-stone-150 p-3 rounded-xl bg-stone-50/50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between text-[9px] text-orange-850 font-bold uppercase font-mono mb-1">
                    <span>{ev.neighborhood.toUpperCase()}</span>
                    <span>⏳ {ev.date}</span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 leading-tight">{ev.title}</h4>
                  <p className="text-[10.5px] text-stone-500 line-clamp-2 mt-1">{ev.description}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/50">
                  <span className="text-[9px] text-stone-400">{ev.time}</span>
                  <button
                    onClick={() => onRSVPToggle(ev.id)}
                    className={`text-[9.5px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                      hasRSVP ? "bg-orange-750 text-white" : "bg-stone-900 text-white hover:bg-stone-850"
                    }`}
                  >
                    {hasRSVP ? "✓ Saved RSVP" : "RSVP Spot"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. RESTAURANT DEALS */}
      <section className="bg-amber-50/40 border-2 border-dashed border-amber-300 rounded-2xl p-4 shadow-3xs space-y-4 animate-pulse-slow" id="feed-sec-food">
        <div className="flex justify-between items-center border-b border-amber-150 pb-2">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-sans font-bold text-xs text-amber-900">Featured Restaurant Coupons</h3>
              <p className="text-[10px] text-amber-700 font-mono uppercase">Local discounts & Slopper rewards</p>
            </div>
          </div>
          <button
            onClick={() => onChangeTab("food")}
            className="text-[10px] text-amber-800 font-bold hover:underline"
          >
            Review Places
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {businesses.filter(b => b.coupons && b.coupons.length > 0).slice(0, 2).map((biz) => {
            const coup = biz.coupons[0];
            const isClaimed = claimedCoupon === coup.id;
            return (
              <div key={biz.id} className="bg-white border border-amber-150 p-3 rounded-xl shadow-3xs space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-450 text-yellow-950 font-mono text-[8px] font-bold px-2 py-0.5 rounded-bl">
                  SPECIAL OFFER
                </div>
                <div>
                  <h4 className="font-bold text-[11px] text-stone-500 uppercase tracking-wide leading-none">{biz.name}</h4>
                  <h5 className="font-black text-xs text-stone-900 mt-1">{coup.title}</h5>
                  <p className="text-[10px] text-stone-500 mt-1">{coup.description}</p>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-stone-100">
                  <span className="text-[9px] text-stone-400 font-mono">CODE: {coup.code}</span>
                  <button
                    onClick={() => {
                      setClaimedCoupon(coup.id);
                      alert("🎟 Voucher claimed is ready! Show at store checkout.");
                    }}
                    className={`text-[9.5px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
                      isClaimed ? "bg-amber-600 text-white" : "bg-stone-900 text-white hover:bg-stone-850"
                    }`}
                  >
                    {isClaimed ? "✓ Activated" : "Activate Voucher"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. LOST & FOUND */}
      <section className="bg-white border border-stone-250 rounded-2xl p-4 shadow-3xs space-y-4" id="feed-sec-lost">
        <div className="flex justify-between items-center border-b border-stone-150 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🐕</span>
            <div>
              <h3 className="font-sans font-bold text-xs text-stone-900">Missing Pets & Valuables</h3>
              <p className="text-[10px] text-stone-400 font-mono uppercase">Immediate local search assistance</p>
            </div>
          </div>
          <button
            onClick={() => onChangeTab("lost")}
            className="text-[10px] text-orange-700 font-bold hover:underline"
          >
            Open Missing Pets Board
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lostFound.slice(0, 2).map((lf) => (
            <div
              key={lf.id}
              onClick={() => onSelectPin("lost_found", lf)}
              className="border border-stone-200 rounded-xl overflow-hidden flex cursor-pointer hover:bg-stone-50 bg-stone-50/20"
            >
              <div className="w-20 h-20 shrink-0">
                <img src={lf.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[8px] font-mono leading-none">
                    <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded font-bold">{lf.type.toUpperCase()}</span>
                    <span className="text-stone-400 font-semibold">{lf.date}</span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 mt-1 truncate">{lf.title}</h4>
                  <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{lf.description}</p>
                </div>
                <div className="text-[9px] text-orange-850 font-bold font-mono">
                  📍 {lf.neighborhood.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LOCAL JOBS */}
      <section className="bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs space-y-4" id="feed-sec-jobs">
        <div className="flex justify-between items-center border-b border-stone-150 pb-2">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-stone-800" />
            <div>
              <h3 className="font-sans font-bold text-xs text-stone-900">Active Local Jobs</h3>
              <p className="text-[10px] text-stone-400 font-mono uppercase">Jobs with Colorado businesses</p>
            </div>
          </div>
          <button
            onClick={() => onChangeTab("community")}
            className="text-[10px] text-stone-600 font-bold hover:underline"
          >
            Find Classifieds
          </button>
        </div>

        <div className="space-y-2.5">
          {jobs.slice(0, 2).map((jb) => {
            const hasApplied = jb.appliedUsers.includes(userProfile.email) || appliedJobsLocally.includes(jb.id);
            return (
              <div key={jb.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 flex flex-wrap justify-between items-center gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-mono font-bold bg-stone-200 px-1.5 py-0.2 rounded text-stone-600">{jb.type}</span>
                    <span className="text-[11.5px] font-bold text-stone-850">{jb.title}</span>
                  </div>
                  <p className="text-[10.5px] text-stone-500 font-sans">
                    {jb.businessName} • 📍 District: <span className="font-bold uppercase">{jb.neighborhood}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-800 text-xs">{jb.salary}</span>
                  <button
                    onClick={() => {
                      onApplyJob(jb.id);
                      setAppliedJobsLocally(prev => [...prev, jb.id]);
                      alert("🎉 Your profile application has been forwarded successfully to the business recuriter! +10 Rep!");
                    }}
                    disabled={hasApplied}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      hasApplied ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-stone-900 text-white hover:bg-stone-800"
                    }`}
                  >
                    {hasApplied ? "✓ Applied" : "Easy Apply"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BUSINESS PROMOTIONS */}
      <section className="bg-white border border-stone-250 rounded-2xl p-4 shadow-3xs space-y-4" id="feed-sec-promo">
        <div className="flex justify-between items-center border-b border-stone-150 pb-2">
          <div className="flex items-center gap-1.5">
            <Tag className="w-5 h-5 text-orange-700" />
            <div>
              <h3 className="font-sans font-bold text-xs text-stone-900">Hometown Partner directory</h3>
              <p className="text-[10px] text-stone-400 font-mono uppercase">Claim your listings and support local</p>
            </div>
          </div>
          <button
            onClick={() => onChangeTab("food")}
            className="text-[10px] text-stone-600 font-bold hover:underline"
          >
            Claim business profile
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {businesses.filter(b => b.tier === "Premium").slice(0, 2).map((biz) => (
            <div key={biz.id} className="bg-stone-50/50 border border-stone-200 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[8.5px] font-mono leading-none mb-1">
                  <span className="text-orange-700 font-bold">Premium Partner</span>
                  <span className="text-stone-400">Class: {biz.category}</span>
                </div>
                <h4 className="font-bold text-xs text-stone-900 truncate">{biz.name}</h4>
                <p className="text-[10px] text-stone-500 line-clamp-2 mt-1">{biz.description}</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-200/50">
                <span className="text-[9.5px] text-stone-400 font-semibold truncate max-w-[130px]">📍 {biz.address}</span>
                <span className="bg-amber-100 text-amber-800 text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded leading-none">★ {biz.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. PUEBLO HISTORY HIGHLIGHTS */}
      <section className="bg-stone-50 border border-stone-250 rounded-2xl p-4 shadow-3xs space-y-4" id="feed-sec-history">
        <div className="flex justify-between items-center border-b border-stone-150 pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="font-sans font-bold text-xs text-stone-900">Pueblo Heritage Highlights</h3>
              <p className="text-[10px] text-stone-400 font-mono uppercase">Then & now slide summaries</p>
            </div>
          </div>
          <button
            onClick={() => onChangeTab("history")}
            className="text-[10px] text-stone-600 font-bold hover:underline"
          >
            See Historical Exhibits
          </button>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-150 space-y-3">
          <div className="flex gap-2 text-[9px] font-mono font-black text-amber-800 uppercase leading-none rounded p-1 bg-amber-50 w-fit">
            <span>🏛 Historical Focus Spot: Bessemer</span>
          </div>
          <div>
            <h4 className="font-bold text-xs text-stone-950">How the Rails Shaped the West</h4>
            <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
              In 1882, the Colorado Fuel and Iron company built the blast furnace on Bessemer's flat, bringing over forty nationalities who settled around Minnequa works. They crafted rails that crossed the entire Rockies!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
