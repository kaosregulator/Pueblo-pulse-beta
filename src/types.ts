export type UserRole =
  | "Super Admin"
  | "City Administrator"
  | "Neighborhood Moderator"
  | "Verified Resident"
  | "Business Owner"
  | "Standard User"
  | "User"
  | "Verified User"
  | "City Moderator"
  | "Administrator";

export type BadgeType =
  | "Local Guide"
  | "Event Reporter"
  | "Historian"
  | "Community Helper"
  | "Business Owner"
  | "Food Reviewer"
  | "Verified Resident"
  | "Top Contributor";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badges: BadgeType[];
  points: number;
  neighborhood: string;
  savedPosts?: string[];
  followedUsers?: string[];
  followedBusinesses?: string[];
  followedNeighborhoods?: string[];
  // New systems integration fields
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  residentVerified?: boolean;
  verificationSubmitted?: boolean;
  verificationMethod?: "Utility Bill" | "Library Card" | "Manual Moderator Approval" | "Address Verification";
  verificationDocName?: string;
  assignedNeighborhood?: string; // For Neighborhood Moderator assigned sector
  activeCity?: string; // Multi-city future expansion ("Pueblo", "Colorado Springs", etc.)
  simulatedInPuebloCounty?: boolean; // Geofencing tracker
  banStatus?: "Active" | "Banned";
  avatarConfig?: any;
}

export interface BusinessClaim {
  id: string;
  businessId: string;
  businessName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  documentName?: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: "Utility Bill" | "Library Card" | "Manual Moderator Approval" | "Address Verification";
  detail: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export interface ContentReport {
  id: string;
  itemId: string;
  itemType: "post" | "comment" | "business" | "event" | "marketplace";
  itemTitle?: string;
  itemContent: string;
  itemNeighborhood: string;
  itemAuthor: string;
  reporter: string;
  reason: string;
  status: "Pending" | "Suppressed" | "Dismissed";
  date: string;
}

export interface ModeratorAction {
  id: string;
  moderatorName: string;
  moderatorRole: string;
  action: string;
  neighborhood?: string;
  date: string;
}

export interface ContentAppeal {
  id: string;
  reportId: string;
  itemId: string;
  itemContent: string;
  userEmail: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export type NeighborhoodID =
  | "pueblo_west"
  | "north_side"
  | "south_side"
  | "east_side"
  | "west_side"
  | "downtown"
  | "mesa"
  | "bessemer"
  | "belmont"
  | "mesa_junction"
  | "grove"
  | "eilers"
  | "goat_hill"
  | "aberdeen"
  | "walking_stick"
  | "university"
  | "state_fair"
  | "salt_creek"
  | "sunset"
  | "union_district"
  | "riverwalk";

export interface TimelineEvent {
  year: string;
  title: string;
  text: string;
}

export interface NeighborhoodData {
  id: NeighborhoodID;
  name: string;
  type: "modern" | "heritage";
  overview: string;
  history: string;
  timeline: TimelineEvent[];
  notableResidents: string[];
  landmarks: string[];
  popularBusinessIds: string[];
  highlights: string[];
}

export type EventCategory =
  | "Community Events"
  | "Festivals"
  | "Concerts"
  | "Farmers Markets"
  | "School Events"
  | "Church Events"
  | "Sports"
  | "Car Shows"
  | "Gaming Events"
  | "Fundraisers";

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  neighborhood: NeighborhoodID;
  lat: number;
  lng: number;
  description: string;
  image: string;
  rsvps: string[]; // User IDs or emails
  saves: string[]; // User IDs or emails
  organizer: string;
}

export type BusinessCategory =
  | "Mexican"
  | "Burgers"
  | "Pizza"
  | "Chinese"
  | "Breakfast"
  | "BBQ"
  | "Coffee"
  | "Other";

export interface MenuItem {
  name: string;
  price: string;
  description: string;
}

export interface CouponItem {
  id: string;
  code: string;
  title: string;
  description: string;
  expiry: string;
  isPremiumOnly: boolean;
}

export interface BusinessItem {
  id: string;
  name: string;
  tier: "Free" | "Premium";
  category: BusinessCategory;
  description: string;
  rating: number;
  address: string;
  phone: string;
  hours: string;
  image: string;
  neighborhood: NeighborhoodID;
  menu: MenuItem[];
  coupons: CouponItem[];
  lat: number;
  lng: number;
  featured?: boolean;
  claimed?: boolean;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  reviews?: {
    author: string;
    rating: number;
    text: string;
    date: string;
    imageUrl?: string;
  }[];
}

export type JobType = "Full Time" | "Part Time" | "Seasonal" | "Volunteer";

export interface JobItem {
  id: string;
  title: string;
  businessName: string;
  type: JobType;
  location: string;
  neighborhood: NeighborhoodID;
  salary: string;
  description: string;
  requirements: string[]; // Array of strings
  appliedUsers: string[]; // Email IDs
}

export type LostFoundType = "Lost Pet" | "Found Pet" | "Missing Item" | "Found Item";

export interface LostFoundItem {
  id: string;
  type: LostFoundType;
  title: string;
  description: string;
  date: string;
  location: string;
  neighborhood: NeighborhoodID;
  lat: number;
  lng: number;
  contact: string;
  image: string;
  resolved: boolean;
}

export type AlertCategory =
  | "Weather"
  | "Road Closures"
  | "Water Outages"
  | "Public Safety"
  | "Community Notices";

export interface SafetyAlert {
  id: string;
  category: AlertCategory;
  title: string;
  content: string;
  date: string;
  level: "critical" | "warning" | "info";
  verified: boolean;
  neighborhood?: NeighborhoodID;
}

export type MarketplaceCategory =
  | "Furniture"
  | "Electronics"
  | "Vehicles"
  | "Gaming"
  | "Collectibles"
  | "Free Items";

export interface MarketplaceItem {
  id: string;
  title: string;
  price: string;
  description: string;
  image: string;
  category: MarketplaceCategory;
  seller: string;
  contact: string;
  neighborhood: NeighborhoodID;
  date: string;
}

export interface ForumPost {
  id: string;
  author: string;
  authorRole: UserRole;
  category: "discussion" | "announcement" | "q-a" | "general" | string;
  postType: string; // e.g., "Community Updates", "Events", "Lost & Found", "Garage Sales", "Restaurant Reviews", "Local Photos", "Questions", "Jobs", "Road Issues", "Alerts", "History Posts", "Business Promotions"
  title: string;
  content: string;
  neighborhood: NeighborhoodID;
  likes: string[]; // User emails
  shares?: number;
  saves?: string[]; // User emails who saved this post
  comments: {
    id: string;
    author: string;
    authorRole: UserRole;
    content: string;
    date: string;
  }[];
  date: string;
  photoUrl?: string;
  videoUrl?: string;
  rating?: number; // for restaurant reviews
}
