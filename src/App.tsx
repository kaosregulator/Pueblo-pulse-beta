import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Compass,
  Map as MapIcon,
  Calendar,
  Utensils,
  Briefcase,
  AlertTriangle,
  BookOpen,
  ShoppingBag,
  User,
  ExternalLink,
  Smartphone,
  Sparkles,
  Search,
  MessageSquare,
  HelpCircle,
  X,
  Phone,
  CornerDownRight,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Tag,
  Clock,
  Compass as CompIcon
} from "lucide-react";

// Import types & preseeded collections
import {
  UserProfile,
  NeighborhoodData,
  BusinessItem,
  EventItem,
  JobItem,
  LostFoundItem,
  SafetyAlert,
  MarketplaceItem,
  ForumPost,
  UserRole
} from "./types";

import {
  defaultUserProfile,
  INITIAL_NEIGHBORHOODS,
  INITIAL_BUSINESSES,
  INITIAL_EVENTS,
  INITIAL_JOBS,
  INITIAL_LOST_FOUND,
  INITIAL_ALERTS,
  INITIAL_MARKETPLACE,
  INITIAL_POSTS
} from "./dbMock";

// Import modular sub-sections
import { SvgAvatar } from "./components/AvatarCreator";
import PuebloLiveMap from "./components/PuebloLiveMap";
import AiAssistant from "./components/AiAssistant";
import HomeFeed from "./components/HomeFeed";
import NearMe from "./components/NearMe";
import EventsTab from "./components/EventsTab";
import FoodHub from "./components/FoodHub";
import JobsTab from "./components/JobsTab";
import LostFoundTab from "./components/LostFoundTab";
import HeritageTab from "./components/HeritageTab";
import CommunityTab from "./components/CommunityTab";
import ProfileModTab from "./components/ProfileModTab";
import LibrariesHub from "./components/LibrariesHub";
import { PinnedRoutes } from "./components/PuebloTransit";

// New Expansion Components
import MediaUploader from "./components/MediaUploader";
import NotificationCenter, { DEFAULT_NOTIFICATIONS, AppNotification } from "./components/NotificationCenter";
import DirectMessaging from "./components/DirectMessaging";
import FoundingMemberWall from "./components/FoundingMemberWall";
import OnboardingExperience from "./components/OnboardingExperience";
import PuebloSpecialsHub from "./components/PuebloSpecialsHub";
import PuebloEncyclopedia from "./components/PuebloEncyclopedia";

// Systems panels imports
import AdminCenter from "./components/AdminCenter";
import BusinessPortal from "./components/BusinessPortal";
import NeighborhoodPortals from "./components/NeighborhoodPortals";
import CityCommandCenter from "./components/CityCommandCenter";
import VerificationPanel from "./components/VerificationPanel";
import { BusinessClaim, VerificationRequest, ContentReport, ContentAppeal, ModeratorAction } from "./types";

// Firebase integrations
import { auth, db, signInWithGoogleUnderIframe, logoutUser, OperationType, handleFirestoreError } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, addDoc, query, orderBy, limit, deleteDoc, where, getDocs } from "firebase/firestore";
import { seedFirestoreIfEmpty } from "./firebaseSeeder";

export default function App() {
  // --- Persistent Firebase Protected States ---
  const [userProfile, setUserProfileState] = useState<UserProfile>({
    id: "guest-loading",
    name: "Guest Citizen",
    email: "guest@pueblopulse.org",
    role: "User",
    badges: [],
    points: 0,
    neighborhood: "downtown",
    activeCity: "Pueblo",
    simulatedInPuebloCounty: true,
    emailVerified: false,
    phoneVerified: false,
    residentVerified: false,
    banStatus: "Active",
    savedPosts: [],
    followedUsers: [],
    followedBusinesses: [],
    followedNeighborhoods: []
  });

  const [posts, setPostsState] = useState<ForumPost[]>([]);
  const [events, setEventsState] = useState<EventItem[]>([]);
  const [businesses, setBusinessesState] = useState<BusinessItem[]>([]);
  const [jobs, setJobsState] = useState<JobItem[]>([]);
  const [lostFound, setLostFoundState] = useState<LostFoundItem[]>([]);
  const [claims, setClaimsState] = useState<BusinessClaim[]>([]);
  const [verifications, setVerificationsState] = useState<VerificationRequest[]>([]);
  const [reports, setReportsState] = useState<ContentReport[]>([]);
  const [appeals, setAppealsState] = useState<ContentAppeal[]>([]);
  const [actions, setActionsState] = useState<ModeratorAction[]>([]);
  const [allUsers, setAllUsersState] = useState<UserProfile[]>([]);
  const [marketplace, setMarketplaceState] = useState<MarketplaceItem[]>([]);
  const [alerts, setAlertsState] = useState<SafetyAlert[]>([]);

  // Show Seeded / Pre populated content vs live real data toggle
  const [showSeeded, setShowSeeded] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Navigation track
  type MainTab =
    | "home"
    | "near_me"
    | "map"
    | "events"
    | "food"
    | "jobs"
    | "lost"
    | "history"
    | "community"
    | "profile"
    | "neighborhood_channels"
    | "business_hub"
    | "command_center"
    | "identity_auth"
    | "admin_gate"
    | "ai_assistant"
    | "specials"
    | "messages"
    | "founding"
    | "local_services";

  const [activeTab, setActiveTab] = useState<MainTab>("home");
  
  // New States for Expansion
  const [notifications, setNotifications] = useState<AppNotification[]>(DEFAULT_NOTIFICATIONS);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  
  // Overlay details detail item
  const [activeDetailItem, setActiveDetailItem] = useState<{
    type: "event" | "business" | "lost_found" | "marketplace_item";
    data: any;
  } | null>(null);

  // --- PWA Install-to-Home-Screen Support ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
      console.log("🎉 Steel City Community was successfully installed to the home screen!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // --- Toast notifications list state ---
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const [showInstallerWizard, setShowInstallerWizard] = useState<boolean>(false);
  const [installProgress, setInstallProgress] = useState<number>(0);

  // High-fidelity audio synthesizer chime
  const playDing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Traditional crystal pure chord G5 + C6
      osc1.frequency.setValueAtTime(783.99, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
      
      osc1.type = "sine";
      osc2.type = "sine";
      
      osc1.start(audioCtx.currentTime);
      osc2.start(audioCtx.currentTime);
      
      osc1.stop(audioCtx.currentTime + 0.6);
      osc2.stop(audioCtx.currentTime + 0.6);
    } catch (err) {
      console.warn("Audio Context blocked by client policies:", err);
    }
  };

  // Tracking notifications length to trigger real-time toast popups and chimes
  const [prevNotifLength, setPrevNotifLength] = useState<number>(DEFAULT_NOTIFICATIONS.length);
  useEffect(() => {
    if (notifications.length > 0) {
      if (prevNotifLength > 0 && notifications.length > prevNotifLength) {
        const newest = notifications[0];
        if (newest) {
          setActiveToasts(prev => [...prev, newest]);
          playDing();
        }
      }
      setPrevNotifLength(notifications.length);
    } else {
      setPrevNotifLength(0);
    }
  }, [notifications]);

  // Timed dismiss for slide-out toasts
  useEffect(() => {
    if (activeToasts.length > 0) {
      const timer = setTimeout(() => {
        setActiveToasts(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToasts]);

  // --- Favorited Bus Routes State & Quick Boards ---
  const [favoritedRouteIds, setFavoritedRouteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("favorited_bus_routes");
      return saved ? JSON.parse(saved) : ["route_2_north"]; // defaults to Lane 2 North Express
    } catch {
      return ["route_2_north"];
    }
  });

  const handleToggleFavoriteRoute = (id: string) => {
    setFavoritedRouteIds(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(r => r !== id);
        const dismissedNotif: AppNotification = {
          id: `fav-dismiss-${Date.now()}`,
          type: "verification",
          title: "📌 Route Pin Released",
          body: "Lane route was removed from your sideboard",
          date: "Just Now",
          read: false
        };
        setActiveToasts(prevToasts => [...prevToasts, dismissedNotif]);
      } else {
        next = [...prev, id];
        const successNotif: AppNotification = {
          id: `fav-add-${Date.now()}`,
          type: "message",
          title: "⭐ Route Pinned to Sideboard!",
          body: "Live estimated approach times will display persistently",
          date: "Just Now",
          read: false
        };
        setActiveToasts(prevToasts => [...prevToasts, successNotif]);
        playDing();
      }
      localStorage.setItem("favorited_bus_routes", JSON.stringify(next));
      return next;
    });
  };

  const handleSimulationInstallApp = () => {
    if (deferredPrompt) {
      triggerPwaInstall();
      return;
    }
    setShowInstallerWizard(true);
    setInstallProgress(0);
    
    // Simulate high fidelity install counting
    let prg = 0;
    const interval = setInterval(() => {
      prg += 10;
      setInstallProgress(prg);
      if (prg >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAppInstalled(true);
          setShowInstallerWizard(false);
          
          // Add reward point additions & badge Pioneer
          handleUpdatePoints(40);
          setUserProfile(prev => ({
            ...prev,
            badges: Array.from(new Set([...(prev.badges || []), "App Pioneer"]))
          }));

          setNotifications(prev => [
            {
              id: `notif-pwa-${Date.now()}`,
              type: "verification" as const,
              title: "📲 App Installed!",
              content: "Steel City Community client has been bound. Received the exclusive 'App Pioneer' badge & +40 Reputation!",
              timestamp: "Just Now",
              read: false
            },
            ...prev
          ]);
        }, 600);
      }
    }, 120);
  };

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`👤 User installation response: ${outcome}`);
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
    }
  };

  const syncSimulatedUserProfile = async (email: string) => {
    const sanitizedId = "fastpass-" + email.replace(/[^a-zA-Z0-9]/g, "-");
    const userDocRef = doc(db, "users", sanitizedId);
    try {
      const userDoc = await getDoc(userDocRef);
      let currentProfile: UserProfile;
      if (userDoc.exists()) {
        currentProfile = userDoc.data() as UserProfile;
      } else {
        currentProfile = {
          id: sanitizedId,
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          email: email,
          role: "Verified User",
          badges: ["Verified Resident"],
          points: 120,
          neighborhood: "mesa",
          activeCity: "Pueblo",
          simulatedInPuebloCounty: true,
          emailVerified: true,
          phoneVerified: false,
          residentVerified: true,
          banStatus: "Active",
          savedPosts: [],
          followedUsers: [],
          followedBusinesses: [],
          followedNeighborhoods: []
        };
      }

      const adminEmails = ["christopherosorio7@gmail.com", "admin@pueblopulse.org", "moderator@pueblopulse.org"];
      if (currentProfile.email && adminEmails.includes(currentProfile.email.toLowerCase())) {
        if (!["Super Admin", "City Administrator", "Administrator"].includes(currentProfile.role)) {
          currentProfile.role = "Super Admin";
          if (!currentProfile.badges.includes("Verified Resident")) {
            currentProfile.badges.push("Verified Resident");
          }
          currentProfile.points = Math.max(currentProfile.points, 500);
          console.log(`👑 ADMIN_PROMOTION: Promoted simulated user ${currentProfile.email} to Super Admin.`);
        }
      }

      if (currentProfile.email) {
        try {
          const querySnap = await getDocs(collection(db, "businesses"));
          let isBusinessOwner = false;
          let claimedBusinessName = "";
          const matchedBusinesses: any[] = [];
          querySnap.forEach((docSnap) => {
            const bData = docSnap.data();
            if (bData.ownerEmail && bData.ownerEmail.toLowerCase() === currentProfile.email.toLowerCase()) {
              isBusinessOwner = true;
              claimedBusinessName = bData.name;
              matchedBusinesses.push({ id: docSnap.id, ...bData });
            }
          });
          if (isBusinessOwner) {
            for (const mb of matchedBusinesses) {
              if (mb.ownerId !== currentProfile.id || !mb.claimed) {
                const bDocRef = doc(db, "businesses", mb.id);
                await updateDoc(bDocRef, {
                  ownerId: currentProfile.id,
                  ownerName: currentProfile.name,
                  claimed: true
                });
              }
            }
            if (currentProfile.role !== "Business Owner" && !["Super Admin", "City Administrator", "Administrator"].includes(currentProfile.role)) {
              currentProfile.role = "Business Owner";
              if (!currentProfile.badges.includes("Business Owner")) {
                currentProfile.badges.push("Business Owner");
              }
              currentProfile.points = Math.max(currentProfile.points, 250);
            }
          }
        } catch (err) {
          console.warn("⚠️ Auto assignment business lookup bypassed: ", err);
        }
      }

      await setDoc(userDocRef, currentProfile);
      setUserProfileState(currentProfile);
      return currentProfile;
    } catch (error) {
      console.error("Fastpath login sync failed:", error);
      throw error;
    }
  };

  // --- Real-time OnSnapshot Listener Sync & Auth Setup ---
  useEffect(() => {
    // 1. Authentication and profiles bind
    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          let currentProfile: UserProfile;
          if (userDoc.exists()) {
            currentProfile = userDoc.data() as UserProfile;
          } else {
            // New user registration defaults
            currentProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Pueblo Neighbor",
              email: firebaseUser.email || "",
              role: "Verified User",
              badges: ["Verified Resident"],
              points: 100,
              neighborhood: "mesa",
              activeCity: "Pueblo",
              simulatedInPuebloCounty: true,
              emailVerified: firebaseUser.emailVerified,
              phoneVerified: false,
              residentVerified: false,
              banStatus: "Active",
              savedPosts: [],
              followedUsers: [],
              followedBusinesses: [],
              followedNeighborhoods: []
            };
          }

          // Check if user should be auto promoted to Admin/Moderator based on email
          const adminEmails = ["christopherosorio7@gmail.com", "admin@pueblopulse.org", "moderator@pueblopulse.org"];
          if (currentProfile.email && adminEmails.includes(currentProfile.email.toLowerCase())) {
            if (!["Super Admin", "City Administrator", "Administrator"].includes(currentProfile.role)) {
              currentProfile.role = "Super Admin";
              if (!currentProfile.badges.includes("Verified Resident")) {
                currentProfile.badges.push("Verified Resident");
              }
              currentProfile.points = Math.max(currentProfile.points, 500);
              console.log(`👑 ADMIN_PROMOTION: Promoted verified user ${currentProfile.email} to Super Admin.`);
            }
          }

          // Business Owner Auto assignment check (checks if user email matches any business ownerEmail)
          if (currentProfile.email) {
            try {
              const querySnap = await getDocs(collection(db, "businesses"));
              let isBusinessOwner = false;
              let claimedBusinessName = "";
              const matchedBusinesses: any[] = [];
              
              querySnap.forEach((docSnap) => {
                const bData = docSnap.data();
                if (bData.ownerEmail && bData.ownerEmail.toLowerCase() === currentProfile.email.toLowerCase()) {
                  isBusinessOwner = true;
                  claimedBusinessName = bData.name;
                  matchedBusinesses.push({ id: docSnap.id, ...bData });
                }
              });

              if (isBusinessOwner) {
                // Auto-assign ownerId and claim status for matched businesses in Firestore
                for (const mb of matchedBusinesses) {
                  if (mb.ownerId !== currentProfile.id || !mb.claimed) {
                    const bDocRef = doc(db, "businesses", mb.id);
                    await updateDoc(bDocRef, {
                      ownerId: currentProfile.id,
                      ownerName: currentProfile.name,
                      claimed: true
                    });
                    console.log(`💼 AUTO_ASSIGN: Linked business '${mb.name}' to verified owner UID: ${currentProfile.id}`);
                  }
                }

                // Update the user's role to "Business Owner" and award badges/points!
                if (currentProfile.role !== "Business Owner" && !["Super Admin", "City Administrator", "Administrator"].includes(currentProfile.role)) {
                  currentProfile.role = "Business Owner";
                  if (!currentProfile.badges.includes("Business Owner")) {
                    currentProfile.badges.push("Business Owner");
                  }
                  currentProfile.points = Math.max(currentProfile.points, 250);
                  console.log(`🎖️ AUTO_ASSIGN: Upgraded user ${currentProfile.email} status to Business Owner for: ${claimedBusinessName}`);
                }
              }
            } catch (err) {
              console.warn("⚠️ Auto assignment business lookup bypassed: ", err);
            }
          }

          await setDoc(userDocRef, currentProfile);
          setUserProfileState(currentProfile);

          // Trigger seeding now that we have an authenticated user session
          seedFirestoreIfEmpty();
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        const savedSimEmail = localStorage.getItem("simulatedUserEmail");
        if (savedSimEmail) {
          syncSimulatedUserProfile(savedSimEmail);
        } else {
          setUserProfileState({
            id: "guest-citizen",
            name: "Guest Citizen",
            email: "guest@pueblopulse.org",
            role: "User",
            badges: [],
            points: 0,
            neighborhood: "downtown",
            activeCity: "Pueblo",
            simulatedInPuebloCounty: true,
            emailVerified: false,
            phoneVerified: false,
            residentVerified: false,
            banStatus: "Active",
            savedPosts: [],
            followedUsers: [],
            followedBusinesses: [],
            followedNeighborhoods: []
          });
        }
      }
    });

    return () => {
      authUnsub();
    };
  }, []);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const isGuest = !userProfile || userProfile.id === "guest-loading" || userProfile.id === "guest-citizen" || userProfile.id === "guest";
    const role = userProfile?.role || "User";
    const isAdminOrMod = ["Super Admin", "City Administrator", "Administrator", "Neighborhood Moderator", "City Moderator"].includes(role);

    // --- 1. Public Subscriptions (Anyone including Guests can list) ---
    unsubs.push(
      onSnapshot(collection(db, "posts"), (snap) => {
        const list: ForumPost[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as ForumPost));
        setPostsState(list.sort((a, b) => b.date.localeCompare(a.date)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, "posts"))
    );

    unsubs.push(
      onSnapshot(collection(db, "businesses"), (snap) => {
        const list: BusinessItem[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as BusinessItem));
        setBusinessesState(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, "businesses"))
    );

    unsubs.push(
      onSnapshot(collection(db, "events"), (snap) => {
        const list: EventItem[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as EventItem));
        setEventsState(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, "events"))
    );

    unsubs.push(
      onSnapshot(collection(db, "jobs"), (snap) => {
        const list: JobItem[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as JobItem));
        setJobsState(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, "jobs"))
    );

    unsubs.push(
      onSnapshot(collection(db, "lostFound"), (snap) => {
        const list: LostFoundItem[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as LostFoundItem));
        setLostFoundState(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, "lostFound"))
    );

    unsubs.push(
      onSnapshot(collection(db, "marketplace"), (snap) => {
        const list: MarketplaceItem[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as MarketplaceItem));
        setMarketplaceState(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, "marketplace"))
    );

    unsubs.push(
      onSnapshot(collection(db, "alerts"), (snap) => {
        const list: SafetyAlert[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as SafetyAlert));
        setAlertsState(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, "alerts"))
    );

    unsubs.push(
      onSnapshot(collection(db, "actions"), (snap) => {
        const list: ModeratorAction[] = [];
        snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as ModeratorAction));
        setActionsState(list.sort((a,b) => b.date.localeCompare(a.date)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, "actions"))
    );

    // --- 2. Restricted Subscriptions ---
    if (!isGuest) {
      const email = userProfile?.email;
      if (email) {
        unsubs.push(
          onSnapshot(
            query(collection(db, "notifications"), where("userId", "==", email)),
            (snap) => {
              const list: AppNotification[] = [];
              snap.forEach((doc) => {
                const data = doc.data();
                list.push({
                  id: doc.id,
                  type: data.type || "reminder",
                  title: data.title || "",
                  body: data.body || data.content || "",
                  date: data.date || "Just now",
                  read: data.read || false,
                  actionTab: data.actionTab || undefined,
                  referenceId: data.referenceId || undefined
                } as AppNotification);
              });
              setNotifications(list);
            },
            (err) => handleFirestoreError(err, OperationType.LIST, `notifications?userId=${email}`)
          )
        );
      }

      if (isAdminOrMod) {
        // Admins and Mods get the global complete views
        unsubs.push(
          onSnapshot(collection(db, "claims"), (snap) => {
            const list: BusinessClaim[] = [];
            snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as BusinessClaim));
            setClaimsState(list);
          }, (err) => handleFirestoreError(err, OperationType.LIST, "claims"))
        );

        unsubs.push(
          onSnapshot(collection(db, "verifications"), (snap) => {
            const list: VerificationRequest[] = [];
            snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as VerificationRequest));
            setVerificationsState(list);
          }, (err) => handleFirestoreError(err, OperationType.LIST, "verifications"))
        );

        unsubs.push(
          onSnapshot(collection(db, "reports"), (snap) => {
            const list: ContentReport[] = [];
            snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as ContentReport));
            setReportsState(list);
          }, (err) => handleFirestoreError(err, OperationType.LIST, "reports"))
        );

        unsubs.push(
          onSnapshot(collection(db, "appeals"), (snap) => {
            const list: ContentAppeal[] = [];
            snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as ContentAppeal));
            setAppealsState(list);
          }, (err) => handleFirestoreError(err, OperationType.LIST, "appeals"))
        );

        unsubs.push(
          onSnapshot(collection(db, "users"), (snap) => {
            const list: UserProfile[] = [];
            snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as UserProfile));
            setAllUsersState(list);
          }, (err) => handleFirestoreError(err, OperationType.LIST, "users"))
        );
      } else {
        // Standard signed-in users only see their own records using secure filtered queries
        // This is extremely secure and prevents O(n) scan rejects by Firestore Rules!
        const uid = userProfile.id;
        const email = userProfile.email;

        unsubs.push(
          onSnapshot(
            query(collection(db, "claims"), where("ownerId", "==", uid)),
            (snap) => {
              const list: BusinessClaim[] = [];
              snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as BusinessClaim));
              setClaimsState(list);
            },
            (err) => handleFirestoreError(err, OperationType.LIST, `claims?ownerId=${uid}`)
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "verifications"), where("userId", "==", uid)),
            (snap) => {
              const list: VerificationRequest[] = [];
              snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as VerificationRequest));
              setVerificationsState(list);
            },
            (err) => handleFirestoreError(err, OperationType.LIST, `verifications?userId=${uid}`)
          )
        );

        if (email) {
          unsubs.push(
            onSnapshot(
              query(collection(db, "appeals"), where("userEmail", "==", email)),
              (snap) => {
                const list: ContentAppeal[] = [];
                snap.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as ContentAppeal));
                setAppealsState(list);
              },
              (err) => handleFirestoreError(err, OperationType.LIST, `appeals?userEmail=${email}`)
            )
          );
        }
      }
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [userProfile?.id, userProfile?.role]);

  // --- Transactional, Multi-User Cloud Sync Wrappers ---
  const setUserProfile = async (value: React.SetStateAction<UserProfile>) => {
    const next = typeof value === "function" ? value(userProfile) : value;
    setUserProfileState(next);
    if (next.id && next.id !== "guest-citizen" && next.id !== "guest-loading") {
      try {
        await setDoc(doc(db, "users", next.id), next);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${next.id}`);
      }
    }
  };

  const setBusinesses = async (value: React.SetStateAction<BusinessItem[]>) => {
    const next = typeof value === "function" ? value(businesses) : value;
    for (const item of next) {
      const ext = businesses.find((b) => b.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "businesses", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `businesses/${item.id}`);
        }
      }
    }
  };

  const setClaims = async (value: React.SetStateAction<BusinessClaim[]>) => {
    const next = typeof value === "function" ? value(claims) : value;
    for (const item of next) {
      const ext = claims.find((c) => c.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "claims", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `claims/${item.id}`);
        }
      }
    }
  };

  const setVerifications = async (value: React.SetStateAction<VerificationRequest[]>) => {
    const next = typeof value === "function" ? value(verifications) : value;
    for (const item of next) {
      const ext = verifications.find((v) => v.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "verifications", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `verifications/${item.id}`);
        }
      }
    }
  };

  const setReports = async (value: React.SetStateAction<ContentReport[]>) => {
    const next = typeof value === "function" ? value(reports) : value;
    for (const item of next) {
      const ext = reports.find((r) => r.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "reports", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `reports/${item.id}`);
        }
      }
    }
  };

  const setAppeals = async (value: React.SetStateAction<ContentAppeal[]>) => {
    const next = typeof value === "function" ? value(appeals) : value;
    for (const item of next) {
      const ext = appeals.find((a) => a.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "appeals", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `appeals/${item.id}`);
        }
      }
    }
  };

  const setActions = async (value: React.SetStateAction<ModeratorAction[]>) => {
    const next = typeof value === "function" ? value(actions) : value;
    for (const item of next) {
      const ext = actions.find((a) => a.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "actions", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `actions/${item.id}`);
        }
      }
    }
  };

  const setAllUsers = async (value: React.SetStateAction<UserProfile[]>) => {
    const next = typeof value === "function" ? value(allUsers) : value;
    for (const item of next) {
      const ext = allUsers.find((u) => u.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "users", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${item.id}`);
        }
      }
    }
  };

  const setEvents = async (value: React.SetStateAction<EventItem[]>) => {
    const next = typeof value === "function" ? value(events) : value;
    for (const item of next) {
      const ext = events.find((e) => e.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "events", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `events/${item.id}`);
        }
      }
    }
  };

  const setJobs = async (value: React.SetStateAction<JobItem[]>) => {
    const next = typeof value === "function" ? value(jobs) : value;
    for (const item of next) {
      const ext = jobs.find((j) => j.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "jobs", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `jobs/${item.id}`);
        }
      }
    }
  };

  const setPosts = async (value: React.SetStateAction<ForumPost[]>) => {
    const next = typeof value === "function" ? value(posts) : value;
    for (const item of next) {
      const ext = posts.find((p) => p.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "posts", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `posts/${item.id}`);
        }
      }
    }
  };

  const setLostFound = async (value: React.SetStateAction<LostFoundItem[]>) => {
    const next = typeof value === "function" ? value(lostFound) : value;
    for (const item of next) {
      const ext = lostFound.find((f) => f.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "lostFound", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `lostFound/${item.id}`);
        }
      }
    }
  };

  const setMarketplace = async (value: React.SetStateAction<MarketplaceItem[]>) => {
    const next = typeof value === "function" ? value(marketplace) : value;
    for (const item of next) {
      const ext = marketplace.find((m) => m.id === item.id);
      if (!ext || JSON.stringify(ext) !== JSON.stringify(item)) {
        try {
          await setDoc(doc(db, "marketplace", item.id), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `marketplace/${item.id}`);
        }
      }
    }
  };



  // --- Dynamic Personal Notifications Dispatcher ---
  const addNotification = async (
    targetEmail: string,
    type: AppNotification["type"],
    title: string,
    body: string,
    actionTab?: string,
    referenceId?: string
  ) => {
    try {
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        userId: targetEmail,
        type,
        title,
        body,
        date: "Just now",
        timestamp: Date.now(),
        read: false,
        actionTab: actionTab || "",
        referenceId: referenceId || ""
      });
    } catch (err) {
      console.error("Failed to commit notification write:", err);
    }
  };

  // --- Interaction state handlers ---
  const handleUpdatePoints = async (addPoints: number) => {
    setUserProfile((prev) => {
      const nextPoints = (prev.points || 0) + addPoints;
      if (prev.id && prev.id !== "guest-citizen" && prev.id !== "guest" && prev.id !== "guest-loading") {
        updateDoc(doc(db, "users", prev.id), { points: nextPoints }).catch((err) => {
          console.error("Failed to sync accrued points back to Firestore profile:", err);
        });
      }
      return {
        ...prev,
        points: nextPoints
      };
    });
  };

  const handleAddPost = async (newPost: ForumPost) => {
    // 1. GEOFENCE LOCATION CHECK
    if (!userProfile.simulatedInPuebloCounty) {
      alert("⚠️ GEOFENCE VIOLATION BLOCKED: You are currently simulated outside Pueblo County limits. Switch your location to 'Pueblo Core' in the top-bar controls or verify your resident card to publish posts!");
      throw new Error("Geofence check failed");
    }

    // 2. SPAM KEYWORD SCAN
    const spamKeywords = ["free cash", "earn millions", "payout fast", "crypto rich", "earn money"];
    const textToScan = `${newPost.title.toLowerCase()} ${newPost.content.toLowerCase()}`;
    const detectedSpam = spamKeywords.some(kw => textToScan.includes(kw));

    if (detectedSpam) {
      const code = Math.random().toString(36).substring(2, 7);
      const spamReport: ContentReport = {
        id: `rep-auto-${code}`,
        itemId: `post-flagged-${code}`,
        itemType: "post",
        itemTitle: newPost.title,
        itemContent: newPost.content,
        itemNeighborhood: newPost.neighborhood,
        itemAuthor: newPost.author,
        reporter: "Pulse_Spam_Detection_Bot",
        reason: "Spam Detection",
        status: "Pending",
        date: new Date().toLocaleDateString()
      };
      
      // Persist bot report to contentReports
      await setDoc(doc(db, "reports", spamReport.id), spamReport);

      // Log moderator action auto audit
      const newAct: ModeratorAction = {
        id: `act-${Date.now()}`,
        moderatorName: "Pulse Sentinel AI",
        moderatorRole: "Administrator",
        action: `Auto-flagged & suppressed spam post keywords from "${newPost.author}"`,
        neighborhood: newPost.neighborhood,
        date: new Date().toLocaleString()
      };
      await setDoc(doc(db, "actions", newAct.id), newAct);

      alert("⚠️ SYSTEM SECURITY NOTICE: Your content contains keywords flagged by our community Guidelines (e.g. promotional cash codes). Restricting publication. It has been routed to the Pueblo County Admin Review Queue!");
      throw new Error("Spam check failed");
    }

    try {
      await setDoc(doc(db, "posts", newPost.id), newPost);
      await handleUpdatePoints(15); // Points for listing posts
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${newPost.id}`);
      throw err;
    }
  };

  const handleDeleteDoc = async (collectionName: string, docId: string) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      alert(`🗑️ Document successfully deleted: ${collectionName} / ${docId}`);
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert(`⚠️ Verification failed or writing error: Check permissions context.`);
    }
  };

  const handleLikePost = async (postId: string) => {
    const postToLike = posts.find((p) => p.id === postId);
    if (!postToLike) return;
    const exists = postToLike.likes.includes(userProfile.email);
    const updatedLikes = exists
      ? postToLike.likes.filter((e) => e !== userProfile.email)
      : [...postToLike.likes, userProfile.email];

    try {
      await updateDoc(doc(db, "posts", postId), { likes: updatedLikes });
      
      // Dispatch a push notification context to the post author
      if (!exists && postToLike.author !== userProfile.name) {
        const authorMatch = allUsers.find((u) => u.name === postToLike.author);
        if (authorMatch && authorMatch.email) {
          await addNotification(
            authorMatch.email,
            "like",
            "❤️ Post Liked!",
            `${userProfile.name} liked your published story "${postToLike.title.slice(0, 30)}..."`,
            "home",
            postId
          );
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${postId}`);
    }
  };

  const handleCommentPost = async (postId: string, content: string) => {
    const postToComment = posts.find((p) => p.id === postId);
    if (!postToComment) return;

    const cm = {
      id: `c-${Date.now()}`,
      author: userProfile.name,
      authorRole: userProfile.role,
      content,
      date: new Date().toISOString().split("T")[0],
    };

    const updatedComments = [...(postToComment.comments || []), cm];

    try {
      await updateDoc(doc(db, "posts", postId), { comments: updatedComments });
      await handleUpdatePoints(5); // Points for replying

      // Dispatch comment alert to the post author
      if (postToComment.author !== userProfile.name) {
        const authorMatch = allUsers.find((u) => u.name === postToComment.author);
        if (authorMatch && authorMatch.email) {
          await addNotification(
            authorMatch.email,
            "comment",
            "💬 New Comment on your Story",
            `${userProfile.name} commented: "${content.slice(0, 50)}..."`,
            "home",
            postId
          );
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${postId}`);
    }
  };

  const handleRSVPToggle = async (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    const exists = ev.rsvps.includes(userProfile.email);
    const updatedRSVPs = exists
      ? ev.rsvps.filter((e) => e !== userProfile.email)
      : [...ev.rsvps, userProfile.email];

    try {
      await updateDoc(doc(db, "events", eventId), { rsvps: updatedRSVPs });
      await handleUpdatePoints(10);

      // Notify the organizer/host
      if (!exists && ev.organizer) {
        const hostMatch = allUsers.find((u) => u.name === ev.organizer || u.role === ev.organizer);
        if (hostMatch && hostMatch.email && hostMatch.email !== userProfile.email) {
          await addNotification(
            hostMatch.email,
            "reminder",
            "📅 New Event RSVP!",
            `${userProfile.name} is now attending your event: "${ev.title.slice(0, 30)}..."`,
            "events",
            eventId
          );
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${eventId}`);
    }
  };

  const handleApplyJob = async (jobId: string) => {
    const j = jobs.find((item) => item.id === jobId);
    if (!j) return;
    if (j.appliedUsers.includes(userProfile.email)) return;
    const updatedApplied = [...j.appliedUsers, userProfile.email];

    try {
      await updateDoc(doc(db, "jobs", jobId), { appliedUsers: updatedApplied });
      await handleUpdatePoints(15);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `jobs/${jobId}`);
    }
  };

  const handleAddLostFound = async (item: LostFoundItem) => {
    try {
      await setDoc(doc(db, "lostFound", item.id), item);
      await handleUpdatePoints(15);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lostFound/${item.id}`);
      throw err;
    }
  };

  const handleResolveLostFound = async (itemId: string) => {
    try {
      await updateDoc(doc(db, "lostFound", itemId), { resolved: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lostFound/${itemId}`);
    }
  };

  const handleAddMarketplaceItem = async (item: MarketplaceItem) => {
    try {
      await setDoc(doc(db, "marketplace", item.id), item);
      await handleUpdatePoints(15);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `marketplace/${item.id}`);
      throw err;
    }
  };

  const handleSavePostToggle = async (postId: string) => {
    setUserProfile((prev) => {
      const currentSaved = prev.savedPosts || [];
      const updated = currentSaved.includes(postId)
        ? currentSaved.filter((id) => id !== postId)
        : [...currentSaved, postId];
      
      if (prev.id && prev.id !== "guest-citizen" && prev.id !== "guest") {
        updateDoc(doc(db, "users", prev.id), { savedPosts: updated }).catch((err) => {
          console.error("Failed to sync saved posts back to Firestore:", err);
        });
      }
      return { ...prev, savedPosts: updated };
    });
    await handleUpdatePoints(5);
  };

  const handleFollowUserToggle = async (author: string) => {
    setUserProfile((prev) => {
      const currentFollowed = prev.followedUsers || [];
      const updated = currentFollowed.includes(author)
        ? currentFollowed.filter((a) => a !== author)
        : [...currentFollowed, author];
      
      if (prev.id && prev.id !== "guest-citizen" && prev.id !== "guest") {
        updateDoc(doc(db, "users", prev.id), { followedUsers: updated }).catch((err) => {
          console.error("Failed to sync followed users back to Firestore:", err);
        });
      }
      return { ...prev, followedUsers: updated };
    });
    await handleUpdatePoints(10);
  };

  const handleFollowBusinessToggle = async (businessId: string) => {
    setUserProfile((prev) => {
      const currentFollowed = prev.followedBusinesses || [];
      const updated = currentFollowed.includes(businessId)
        ? currentFollowed.filter((id) => id !== businessId)
        : [...currentFollowed, businessId];

      if (prev.id && prev.id !== "guest-citizen" && prev.id !== "guest") {
        updateDoc(doc(db, "users", prev.id), { followedBusinesses: updated }).catch((err) => {
          console.error("Failed to sync followed businesses back to Firestore:", err);
        });
      }
      return { ...prev, followedBusinesses: updated };
    });
    await handleUpdatePoints(10);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserProfile((prev) => ({ ...prev, role: newRole }));
  };

  // Select Pin handles modal opens
  const handleSelectPin = (type: string, item: any) => {
    setActiveDetailItem({
      type: type as any,
      data: item,
    });
  };

  // Seeded / pre-populated local historical IDs mappings
  const seededPostIds = React.useMemo(() => new Set(INITIAL_POSTS.map(p => p.id)), []);
  const seededBusinessIds = React.useMemo(() => new Set(INITIAL_BUSINESSES.map(b => b.id)), []);
  const seededEventIds = React.useMemo(() => new Set(INITIAL_EVENTS.map(e => e.id)), []);
  const seededJobIds = React.useMemo(() => new Set(INITIAL_JOBS.map(j => j.id)), []);
  const seededLostFoundIds = React.useMemo(() => new Set(INITIAL_LOST_FOUND.map(lf => lf.id)), []);
  const seededMarketplaceIds = React.useMemo(() => new Set(INITIAL_MARKETPLACE.map(m => m.id)), []);
  const seededAlertIds = React.useMemo(() => new Set(INITIAL_ALERTS.map(a => a.id)), []);

  const displayPosts = React.useMemo(() => showSeeded ? posts : posts.filter(p => !seededPostIds.has(p.id)), [posts, showSeeded, seededPostIds]);
  const displayBusinesses = React.useMemo(() => showSeeded ? businesses : businesses.filter(b => !seededBusinessIds.has(b.id)), [businesses, showSeeded, seededBusinessIds]);
  const displayEvents = React.useMemo(() => showSeeded ? events : events.filter(e => !seededEventIds.has(e.id)), [events, showSeeded, seededEventIds]);
  const displayJobs = React.useMemo(() => showSeeded ? jobs : jobs.filter(j => !seededJobIds.has(j.id)), [jobs, showSeeded, seededJobIds]);
  const displayLostFound = React.useMemo(() => showSeeded ? lostFound : lostFound.filter(lf => !seededLostFoundIds.has(lf.id)), [lostFound, showSeeded, seededLostFoundIds]);
  const displayMarketplace = React.useMemo(() => showSeeded ? marketplace : marketplace.filter(m => !seededMarketplaceIds.has(m.id)), [marketplace, showSeeded, seededMarketplaceIds]);
  const displayAlerts = React.useMemo(() => showSeeded ? alerts : alerts.filter(a => !seededAlertIds.has(a.id)), [alerts, showSeeded, seededAlertIds]);

  // FILTER DATA BY ACTIVE SELECTION CITY
  const activeCityName = userProfile.activeCity || "Pueblo";
  
  const filteredActiveBusinesses = displayBusinesses.filter((b) => {
    if (activeCityName === "Pueblo") {
      return ["pueblo_west", "north_side", "south_side", "east_side", "west_side", "downtown", "mesa", "bessemer", "belmont", "mesa_junction", "grove", "eilers", "union_district"].includes(b.neighborhood.toLowerCase());
    } else if (activeCityName === "Colorado Springs") {
      return ["broadmoor", "downtown_cs", "manitou_springs"].includes(b.neighborhood.toLowerCase());
    } else if (activeCityName === "Canon City") {
      return ["river_front", "skyline"].includes(b.neighborhood.toLowerCase());
    } else if (activeCityName === "Trinidad") {
      return ["corazon", "historic_trinidad"].includes(b.neighborhood.toLowerCase());
    } else if (activeCityName === "Denver") {
      return ["lodo", "capitol_hill", "rino"].includes(b.neighborhood.toLowerCase());
    }
    return true;
  });

  const filteredActiveEvents = displayEvents.filter((e) => {
    if (activeCityName === "Pueblo") {
      return ["pueblo_west", "north_side", "south_side", "east_side", "west_side", "downtown", "mesa", "bessemer", "belmont", "mesa_junction", "grove", "eilers", "union_district"].includes(e.neighborhood.toLowerCase());
    } else if (activeCityName === "Colorado Springs") {
      return ["broadmoor", "downtown_cs", "manitou_springs"].includes(e.neighborhood.toLowerCase());
    } else if (activeCityName === "Canon City") {
      return ["river_front", "skyline"].includes(e.neighborhood.toLowerCase());
    } else if (activeCityName === "Trinidad") {
      return ["corazon", "historic_trinidad"].includes(e.neighborhood.toLowerCase());
    } else if (activeCityName === "Denver") {
      return ["lodo", "capitol_hill", "rino"].includes(e.neighborhood.toLowerCase());
    }
    return true;
  });

  const filteredActivePosts = displayPosts.filter((p) => {
    if (activeCityName === "Pueblo") {
      return ["pueblo_west", "north_side", "south_side", "east_side", "west_side", "downtown", "mesa", "bessemer", "belmont", "mesa_junction", "grove", "eilers", "union_district"].includes(p.neighborhood.toLowerCase());
    } else if (activeCityName === "Colorado Springs") {
      return ["broadmoor", "downtown_cs", "manitou_springs"].includes(p.neighborhood.toLowerCase());
    } else if (activeCityName === "Canon City") {
      return ["river_front", "skyline"].includes(p.neighborhood.toLowerCase());
    } else if (activeCityName === "Trinidad") {
      return ["corazon", "historic_trinidad"].includes(p.neighborhood.toLowerCase());
    } else if (activeCityName === "Denver") {
      return ["lodo", "capitol_hill", "rino"].includes(p.neighborhood.toLowerCase());
    }
    return true;
  });

  const desktopNavSections = [
    {
      title: "Community Feed Hub",
      items: [
        { id: "home" as const, label: "Timeline Feed", icon: Home },
        { id: "near_me" as const, label: "District Sparks", icon: Compass },
        { id: "map" as const, label: "Interactive Map", icon: MapIcon },
        { id: "events" as const, label: "Local Events", icon: Calendar },
        { id: "history" as const, label: "History & Heritage", icon: BookOpen },
        { id: "founding" as const, label: "Supporters & Badges", icon: TrendingUp }
      ],
    },
    {
      title: "Services & Economy",
      items: [
        { id: "local_services" as const, label: "Services & Libraries", icon: BookOpen, highlight: true },
        { id: "neighborhood_channels" as const, label: "District Feeds", icon: CompIcon },
        { id: "business_hub" as const, label: "Retail Portal", icon: Briefcase },
        { id: "food" as const, label: "Specs & Coupons", icon: Utensils },
        { id: "specials" as const, label: "Green Chile Specials", icon: Tag, highlight: true },
        { id: "community" as const, label: "Classifieds Hub", icon: ShoppingBag },
        { id: "jobs" as const, label: "Local Jobs", icon: Briefcase },
        { id: "lost" as const, label: "Lost & Found", icon: Search }
      ],
    },
    {
      title: "Systems & Identity",
      items: [
        { id: "ai_assistant" as const, label: "Concierge AI", icon: Sparkles, highlight: true },
        { id: "identity_auth" as const, label: "Digital Badging", icon: ShieldCheck },
        { id: "messages" as const, label: "Secure Messenger", icon: MessageSquare },
        { id: "command_center" as const, label: "County Radar", icon: Clock }
      ],
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col antialiased selection:bg-orange-200">
      
      {/* Top Branding Header */}
      <header className="bg-stone-900 border-b border-stone-850 px-4 py-3 shrink-0 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="text-3xl select-none leading-none">🌶️</div>
          <div>
            <h1 className="text-stone-100 font-sans font-bold text-sm leading-none flex items-center gap-1.5 uppercase tracking-wider">
              Steel City Community <span className="text-[10px] bg-orange-700 text-white font-mono rounded px-1.5 py-0.5 ml-1">CO</span>
            </h1>
            <p className="text-[10px] text-stone-400 font-mono tracking-tight mt-1">
              Digital Hometown of Pueblo & Pueblo County, CO • UTC Live Node
            </p>
            <div id="build-marker-badge" className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-yellow-400 text-black font-mono text-[9px] font-black uppercase tracking-wider animate-pulse border border-yellow-300 shadow-md">
              ⚠️ BUILD VERSION: June 12 2026 - Build Test 001
            </div>
          </div>
        </div>

        {/* Dynamic Location & Geofence Simulator Selector */}
        <div className="hidden sm:flex items-center gap-3 bg-stone-950 p-2 rounded-xl border border-stone-800 text-[11px] text-white select-none">
          <div className="flex flex-col">
            <span className="text-[8.5px] uppercase font-bold text-stone-500 leading-none">Active City DB:</span>
            <select
              value={userProfile.activeCity || "Pueblo"}
              onChange={(e) => {
                const updatedCity = e.target.value;
                setUserProfile(prev => ({ ...prev, activeCity: updatedCity }));
                alert(`🏙️ DB SYNC: Switched active municipal database to: ${updatedCity}!`);
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer mt-1 text-[10px]"
            >
              <option value="Pueblo" className="bg-stone-900 text-stone-100">Pueblo, CO</option>
              <option value="Colorado Springs" className="bg-stone-900 text-stone-100">Colorado Springs, CO</option>
              <option value="Canon City" className="bg-stone-900 text-stone-100">Canon City, CO</option>
              <option value="Trinidad" className="bg-stone-900 text-stone-100">Trinidad, CO</option>
              <option value="Denver" className="bg-stone-900 text-stone-100">Denver, CO</option>
            </select>
          </div>

          <span className="text-stone-700 font-mono">|</span>

          <div className="flex flex-col">
            <span className="text-[8.5px] uppercase font-bold text-stone-500 leading-none">GPS Geofence Lock:</span>
            <select
              value={userProfile.simulatedInPuebloCounty ? "inside" : "outside"}
              onChange={(e) => {
                const inside = e.target.value === "inside";
                setUserProfile(prev => ({ ...prev, simulatedInPuebloCounty: inside }));
                alert(`🛰️ GPS COORDINATES MODIFIED: Simulated location is now ${inside ? "INSIDE" : "OUTSIDE"} Pueblo County limits.`);
              }}
              className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer mt-1 text-[10px]"
            >
              <option value="inside" className="bg-stone-900 text-emerald-400">📍 Inside Limits</option>
              <option value="outside" className="bg-stone-900 text-red-400">🗺️ Outside Limits</option>
            </select>
          </div>

          <span className="text-stone-700 font-mono">|</span>

          <div className="flex flex-col">
            <span className="text-[8.5px] uppercase font-bold text-stone-500 leading-none">Preloaded Content:</span>
            <div className="mt-1 text-[10px] bg-transparent text-amber-500 font-bold flex items-center gap-1 select-none">
              <span>🛡️ Only Real (Live)</span>
            </div>
          </div>
        </div>

        {/* Global profile statistics */}
        <div className="flex items-center gap-4 text-xs font-sans">
          {deferredPrompt && (
            <button
              onClick={triggerPwaInstall}
              className="px-2.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white border border-orange-500 rounded-md font-mono text-[9px] uppercase cursor-pointer flex items-center gap-1.5 font-bold animate-pulse"
              title="Install Steel City Community app to your home screen"
            >
              <span>📱 Install App</span>
            </button>
          )}
          {isAppInstalled && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-stone-950 border border-emerald-950 rounded text-emerald-400 text-[9px] font-mono lowercase">
              ✔ App Installed
            </span>
          )}

          {auth.currentUser || (userProfile.id && userProfile.id !== "guest-citizen" && userProfile.id !== "guest-loading") ? (
            <button
              onClick={async () => {
                if (auth.currentUser) {
                  await logoutUser();
                }
                localStorage.removeItem("simulatedUserEmail");
                setUserProfileState({
                  id: "guest-citizen",
                  name: "Guest Citizen",
                  email: "guest@pueblopulse.org",
                  role: "User",
                  badges: [],
                  points: 0,
                  neighborhood: "downtown",
                  activeCity: "Pueblo",
                  simulatedInPuebloCounty: true,
                  emailVerified: false,
                  phoneVerified: false,
                  residentVerified: false,
                  banStatus: "Active",
                  savedPosts: [],
                  followedUsers: [],
                  followedBusinesses: [],
                  followedNeighborhoods: []
                });
                alert("🚪 Signed Out: You have returned to the Guest Citizen view.");
              }}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-md font-mono text-[9px] uppercase cursor-pointer transition-all"
            >
              Sign Out
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={async () => {
                  try {
                    const user = await signInWithGoogleUnderIframe();
                    if (user) {
                      alert(`🔑 Firebase Auth: Connected securely as ${user.displayName}! Your community dashboard is fully synced.`);
                    }
                  } catch (err) {
                    alert("⚠️ Auth error under sandboxed iframe. Please try opening in a new tab or use the Citizen Portal option!");
                  }
                }}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-sans font-bold rounded-md text-[9px] uppercase cursor-pointer shadow-sm transition-all"
                title="Connect securely with Google Auth Popup"
              >
                Connect Google
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-2.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-500 text-white font-sans font-bold border border-orange-500 rounded-md text-[9px] uppercase cursor-pointer shadow-sm transition-all flex items-center gap-1 font-bold animate-pulse"
                title="Citizen Resident & Admin Authentication Board"
              >
                🔑 Citizen Portal
              </button>
            </div>
          )}

          {/* Notifications Center Bell */}
          <NotificationCenter
            notifications={notifications}
            onMarkRead={async (id) => {
              try {
                await updateDoc(doc(db, "notifications", id), { read: true });
              } catch (err) {
                console.error("Failed to mark notification as read:", err);
              }
            }}
            onMarkAllRead={async () => {
              try {
                for (const n of notifications) {
                  if (!n.read) {
                    await updateDoc(doc(db, "notifications", n.id), { read: true });
                  }
                }
              } catch (err) {
                console.error("Failed to mark all notifications as read:", err);
              }
            }}
            onClearAll={async () => {
              try {
                for (const n of notifications) {
                  await deleteDoc(doc(db, "notifications", n.id));
                }
              } catch (err) {
                console.error("Failed to clear notification documents:", err);
              }
            }}
            onNavigateToTab={(tab) => {
              setActiveTab(tab as any);
            }}
          />

          <div className="hidden md:flex flex-col items-end">
            <span className="text-stone-300 font-medium">{userProfile.name}</span>
            <span className="text-[9px] uppercase tracking-wider text-orange-400 font-mono font-bold">
              🎖️ {userProfile.points} Reputation Points
            </span>
          </div>
          <button
            onClick={() => setActiveTab("profile")}
            className="w-8.5 h-8.5 cursor-pointer rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-white text-xs hover:border-stone-500 overflow-hidden uppercase transition-all"
            title="Open Profile Dashboard"
          >
            {userProfile.avatarConfig ? (
              <SvgAvatar config={userProfile.avatarConfig} className="w-full h-full" />
            ) : (
              userProfile.name?.slice(0, 2) || "G"
            )}
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Tabs (Visible only on mobile/tablet) */}
      <div className="lg:hidden bg-stone-900 border-b border-stone-850 px-2 py-2.5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-10 shadow-xs select-none">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "home" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🏠 Timeline
        </button>
        <button
          onClick={() => setActiveTab("near_me")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "near_me" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          ⚡ Near me
        </button>
        <button
          onClick={() => setActiveTab("local_services")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "local_services" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          📚 Services & Libraries
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "map" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🗺️ Interactive Map
        </button>
        <button
          onClick={() => setActiveTab("neighborhood_channels")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "neighborhood_channels" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          📍 District Feeds
        </button>
        <button
          onClick={() => setActiveTab("business_hub")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "business_hub" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🏢 Retail Portal
        </button>
        <button
          onClick={() => setActiveTab("food")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "food" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🍔 Specs & Coupons
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "jobs" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          💼 Local Jobs
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "events" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          📅 Events
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "community" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🛍️ Classifieds
        </button>
        <button
          onClick={() => setActiveTab("ai_assistant")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "ai_assistant" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          ✨ Concierge AI
        </button>
        <button
          onClick={() => setActiveTab("identity_auth")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "identity_auth" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🛡️ Digital Badging
        </button>
        <button
          onClick={() => setActiveTab("command_center")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "command_center" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          📡 County Radar
        </button>
        <button
          onClick={() => setActiveTab("specials")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "specials" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🌶️ Green Chile Specials
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "messages" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          💬 Secure Messenger
        </button>
        <button
          onClick={() => setActiveTab("founding")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "founding" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          🥇 Supporters & Wall
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "history" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          📜 Heritage
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
            activeTab === "profile" ? "bg-orange-700 text-white shadow-xs" : "bg-stone-800 text-stone-300 hover:bg-stone-750"
          }`}
        >
          👤 Reputation
        </button>
        {["Super Admin", "City Administrator", "Neighborhood Moderator", "Administrator", "City Moderator"].includes(userProfile.role) && (
          <button
            onClick={() => setActiveTab("admin_gate")}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-black whitespace-nowrap cursor-pointer transition-all ${
              activeTab === "admin_gate" ? "bg-red-800 text-white shadow-xs" : "bg-red-50 text-red-750 hover:bg-red-100"
            }`}
          >
            ⚙️ Control Board
          </button>
        )}
      </div>

      {/* Main Dual Wing Layout Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR NAVIGATION BOARD */}
        <aside className="hidden lg:flex flex-col lg:col-span-3 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-6 lg:sticky lg:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar select-none" id="desktop-sidebar-column">
          
          {/* Reputation Progress Widget */}
          <div className="bg-stone-50 border border-stone-200/65 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-stone-400 font-bold leading-none">
              <span>Your Citizen Rating</span>
              <span className="text-orange-700">★ Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <div>
                <p className="text-stone-900 font-bold text-xs font-sans">{userProfile.name}</p>
                <p className="text-[10px] text-stone-500 font-mono font-medium lowercase italic leading-none mt-0.5">{userProfile.role}</p>
              </div>
            </div>
            {/* XP ProgressBar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-mono text-stone-500">
                <span>{userProfile.points} Reputation XP</span>
                <span>Level {Math.floor(userProfile.points / 100) + 1}</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (userProfile.points % 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* ⭐ Citizen Favorites Board Widget */}
          <div className="bg-amber-50/45 border border-amber-200/80 rounded-xl p-3.5 space-y-2.5 animate-fade-in" id="favorites-board-sidebar">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-amber-905 font-extrabold leading-none">
              <span className="flex items-center gap-1">⭐ Pinned Sideboard</span>
              <span className="text-[8px] bg-amber-200 text-amber-950 px-1 py-0.5 rounded font-black select-none uppercase">Schedule</span>
            </div>
            
            <PinnedRoutes
              routeIds={favoritedRouteIds}
              onOpen={() => setActiveTab("local_services")}
            />
          </div>

          {/* Navigation Segments */}
          <div className="space-y-5">
            {desktopNavSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <h4 className="text-[9px] uppercase tracking-wider font-mono font-extrabold text-stone-400 border-b border-stone-150 pb-1">
                  {section.title}
                </h4>
                <nav className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full px-3 py-2 rounded-xl text-[11.5px] tracking-tight font-sans font-extrabold flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? "bg-stone-900 text-amber-400 font-black shadow-xsScale"
                            : "bg-transparent text-stone-650 hover:bg-stone-100 hover:text-stone-900"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-stone-400"}`} />
                          <span>{item.label}</span>
                        </span>
                        {item.highlight && !isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}

            {/* Special Separated Admin Segment */}
            {["Super Admin", "City Administrator", "Neighborhood Moderator", "Administrator", "City Moderator"].includes(userProfile.role) && (
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("admin_gate")}
                  className={`w-full px-3 py-2 rounded-xl text-[11.5px] font-sans font-extrabold flex items-center gap-2.5 cursor-pointer transition-all ${
                    activeTab === "admin_gate"
                      ? "bg-red-800 text-white font-black shadow-xsScale"
                      : "bg-red-50 text-red-750 hover:bg-red-100"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Mod Control Board</span>
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-stone-150 pt-3 space-y-2">
            {!isAppInstalled ? (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 p-2.5 rounded-xl space-y-1.5 select-none" id="install-client-sidebar-box">
                <div className="flex items-center gap-1">
                  <span className="text-xs">📲</span>
                  <span className="font-sans font-extrabold text-[10.5px] text-stone-900 leading-none">Install Steel City Community</span>
                </div>
                <p className="text-[9px] text-stone-600 leading-snug font-sans">
                  Get real-time local alarms, persistent directory caching, and unlock the <strong>App Pioneer Badge (+40 PTS)</strong>!
                </p>
                <button
                  onClick={handleSimulationInstallApp}
                  className="w-full bg-stone-900 hover:bg-stone-850 text-white font-extrabold text-[9px] uppercase py-1.5 rounded-lg text-center cursor-pointer transition-all shadow-3xs"
                  id="btn-sidebar-install"
                >
                  Install App Client
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 select-none" id="installed-client-sidebar-box">
                <span className="text-lg">📱</span>
                <div className="min-w-0 flex-1">
                  <span className="font-sans font-bold text-[10px] text-emerald-900 block leading-tight">Dynamic Mobile Hub</span>
                  <span className="text-[8.5px] font-mono text-emerald-700 block mt-0.5 font-medium leading-none">Status: Standalone Node Live</span>
                </div>
              </div>
            )}
            <div className="text-[9px] font-mono text-stone-400 leading-relaxed pt-1 select-none">
              📍 Secured with true agricultural and industrial dedication in Pueblo County, CO.
            </div>
          </div>
        </aside>

        {/* MAIN FULL-SCALE APP VIEWPORT AREA */}
        <section className="col-span-1 lg:col-span-9 space-y-6 flex flex-col" id="main-scaled-viewport-column">
          
          {/* Dynamic Top Announcement Banner - Show only if real event exists */}
          {events.some(e => e.id === "chile_fest_2026") && (
            <div className="bg-amber-600 hover:bg-amber-650 text-amber-50 px-4 py-3 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 shadow-xs border-b border-amber-700 select-none transition-all">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-lg animate-bounce">🌶️</span>
                <div>
                  <p className="font-sans leading-none"><strong>32nd Annual Chile & Frijoles Festival Countdown</strong></p>
                  <p className="text-[10px] text-amber-100 mt-1.5 font-mono font-medium leading-none">Starting September 18th in Historic Union Avenue Plaza!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const chileEvent = events.find((e) => e.id === "chile_fest_2026");
                  if (chileEvent) handleSelectPin("event", chileEvent);
                }}
                className="px-3 py-1.5 text-[10px] font-bold bg-amber-950 text-amber-200 hover:bg-amber-900 rounded-lg uppercase cursor-pointer text-center whitespace-nowrap self-stretch sm:self-auto transition-all"
              >
                Learn More
              </button>
            </div>
          )}

          {/* Active Tab Component Container */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 md:p-6 shadow-xs min-h-[580px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="pb-6"
              >
                {activeTab === "home" && (
                  <HomeFeed
                    posts={displayPosts}
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    alerts={displayAlerts}
                    events={displayEvents}
                    businesses={displayBusinesses}
                    jobs={displayJobs}
                    lostFound={displayLostFound}
                    onAddPost={handleAddPost}
                    onLikePost={handleLikePost}
                    onCommentPost={handleCommentPost}
                    onRSVPToggle={handleRSVPToggle}
                    onApplyJob={handleApplyJob}
                    onSelectPin={handleSelectPin}
                    onChangeTab={(tab) => setActiveTab(tab)}
                    onSavePostToggle={handleSavePostToggle}
                    onFollowUserToggle={handleFollowUserToggle}
                    onFollowBusinessToggle={handleFollowBusinessToggle}
                    onDeleteDoc={handleDeleteDoc}
                  />
                )}

                {activeTab === "near_me" && (
                  <NearMe
                    events={displayEvents}
                    businesses={displayBusinesses}
                    lostFound={displayLostFound}
                    alerts={displayAlerts}
                    posts={displayPosts}
                    onSelectPin={handleSelectPin}
                  />
                )}

                {activeTab === "map" && (
                  <PuebloLiveMap
                    events={displayEvents}
                    businesses={displayBusinesses}
                    jobs={displayJobs}
                    lostFound={displayLostFound}
                    alerts={displayAlerts}
                    onSelectPin={handleSelectPin}
                  />
                )}

                {activeTab === "events" && (
                  <EventsTab
                    events={displayEvents}
                    userEmail={userProfile.email}
                    onSelectEvent={handleSelectPin}
                    onToggleRsvp={handleRSVPToggle}
                    userRole={userProfile.role}
                    onDeleteDoc={handleDeleteDoc}
                  />
                )}

                {activeTab === "food" && (
                  <FoodHub
                    businesses={displayBusinesses}
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    onUpdatePoints={handleUpdatePoints}
                    onSelectBusiness={handleSelectPin}
                    onAddCouponToBusiness={(businessId, coupon) => {
                      setBusinesses((prev) =>
                        prev.map((b) => {
                          if (b.id !== businessId) return b;
                          return {
                            ...b,
                            coupons: [...b.coupons, coupon],
                          };
                        })
                      );
                    }}
                    onAddJob={(newJob) => {
                      setJobs((prev) => [newJob, ...prev]);
                    }}
                    onUpdateBusinesses={(updated) => {
                      setBusinesses(updated);
                    }}
                    onChangeTab={(tab) => setActiveTab(tab as any)}
                  />
                )}

                {activeTab === "jobs" && (
                  <JobsTab
                    jobs={displayJobs}
                    userEmail={userProfile.email}
                    onApplyJob={handleApplyJob}
                    onUpdatePoints={handleUpdatePoints}
                    userRole={userProfile.role}
                    onDeleteDoc={handleDeleteDoc}
                  />
                )}

                {activeTab === "lost" && (
                  <LostFoundTab
                    lostFound={displayLostFound}
                    onAddLostFound={handleAddLostFound}
                    onResolveItem={handleResolveLostFound}
                    onUpdatePoints={handleUpdatePoints}
                    onSelectPin={handleSelectPin}
                    userRole={userProfile.role}
                    onDeleteDoc={handleDeleteDoc}
                  />
                )}

                {activeTab === "local_services" && (
                  <LibrariesHub
                    userProfile={userProfile}
                    onAddLocalEvent={async (newEvent) => {
                      await setEvents((prev) => [newEvent, ...prev]);
                    }}
                    favoritedRouteIds={favoritedRouteIds}
                    onToggleFavoriteRoute={handleToggleFavoriteRoute}
                  />
                )}

                {activeTab === "history" && (
                  <PuebloEncyclopedia
                    userProfile={userProfile}
                    onIncrementPoints={handleUpdatePoints}
                  />
                )}

                {activeTab === "specials" && (
                  <PuebloSpecialsHub
                    userProfile={userProfile}
                    onIncrementPoints={handleUpdatePoints}
                  />
                )}

                {activeTab === "messages" && (
                  <DirectMessaging
                    userProfile={userProfile}
                    onIncrementPoints={handleUpdatePoints}
                  />
                )}

                {activeTab === "founding" && (
                  <FoundingMemberWall
                    userProfile={userProfile}
                    onJoinProgram={() => {
                      setUserProfile(prev => ({
                        ...prev,
                        points: prev.points + 50,
                        badges: Array.from(new Set([...prev.badges, "Founding Resident"]))
                      }));
                      setNotifications(prev => [
                        {
                          id: `notif-${Date.now()}`,
                          type: "verification" as const,
                          title: "🎖️ Supporter Space Claimed!",
                          content: "You claimed your space on the Founding Wall! Enjoy early-adopter prestige and +50 points!",
                          timestamp: "Just Now",
                          read: false
                        },
                        ...prev
                      ]);
                    }}
                  />
                )}

                {activeTab === "community" && (
                  <CommunityTab
                    marketplaceItems={displayMarketplace}
                    onAddMarketplaceItem={handleAddMarketplaceItem}
                    onUpdatePoints={handleUpdatePoints}
                    onSelectPin={handleSelectPin}
                    posts={displayPosts}
                    events={displayEvents}
                    businesses={displayBusinesses}
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                  />
                )}

                {activeTab === "profile" && (
                  <ProfileModTab
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    onChangeRole={handleRoleChange}
                    onClearFlags={() => {}}
                    posts={displayPosts}
                    businesses={displayBusinesses}
                    onSelectPin={handleSelectPin}
                    onTriggerOnboarding={() => setShowOnboarding(true)}
                  />
                )}

                {activeTab === "neighborhood_channels" && (
                  <NeighborhoodPortals
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    businesses={filteredActiveBusinesses}
                    events={filteredActiveEvents}
                    posts={filteredActivePosts}
                    onSelectPin={handleSelectPin}
                    onAddPost={handleAddPost}
                  />
                )}

                {activeTab === "business_hub" && (
                  <BusinessPortal
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    businesses={businesses}
                    setBusinesses={setBusinesses}
                    claims={claims}
                    setClaims={setClaims}
                    events={events}
                    setEvents={setEvents}
                    jobs={jobs}
                    setJobs={setJobs}
                  />
                )}

                {activeTab === "command_center" && (
                  <CityCommandCenter
                    businesses={businesses}
                    events={events}
                    jobs={jobs}
                    lostFound={lostFound}
                    alerts={alerts}
                    posts={posts}
                    claims={claims}
                    verifications={verifications}
                    reports={reports}
                    actions={actions}
                    favoritedRouteIds={favoritedRouteIds}
                    onToggleFavoriteRoute={handleToggleFavoriteRoute}
                  />
                )}

                {activeTab === "identity_auth" && (
                  <VerificationPanel
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    verifications={verifications}
                    setVerifications={setVerifications}
                  />
                )}

                {activeTab === "admin_gate" && (
                  <AdminCenter
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    businesses={businesses}
                    setBusinesses={setBusinesses}
                    posts={posts}
                    setPosts={setPosts}
                    claims={claims}
                    setClaims={setClaims}
                    verifications={verifications}
                    setVerifications={setVerifications}
                    reports={reports}
                    setReports={setReports}
                    appeals={appeals}
                    setAppeals={setAppeals}
                    actions={actions}
                    setActions={setActions}
                    allUsers={allUsers}
                    setAllUsers={setAllUsers}
                  />
                )}

                {activeTab === "ai_assistant" && (
                  <div className="space-y-4">
                    <div className="bg-stone-50 border rounded-xl p-4 space-y-1">
                      <h4 className="font-sans font-bold text-xs text-stone-850 flex items-center gap-1.5">
                        <Sparkles className="w-5 h-5 text-orange-700 animate-pulse" />
                        Pueblo Concierge AI
                      </h4>
                      <p className="text-[10.5px] text-stone-550 font-sans">
                        Powered by gemini-3.5-flash with local Front Range geographic context. Ask about historic sites, active chile festivals, or municipal services.
                      </p>
                    </div>
                    <div className="h-[520px] overflow-hidden flex flex-col pt-1 bg-stone-50 rounded-xl p-1 border">
                      <AiAssistant />
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* Mobile Sticky Bottom Tab Bar (Visible only on mobile/tablet) */}
      <div className="lg:hidden bg-stone-950 border-t border-stone-850 px-2 py-2 flex justify-around items-center shrink-0 z-20 sticky bottom-0 select-none">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-sans font-black transition-all cursor-pointer ${
            activeTab === "home" ? "text-orange-500" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab("near_me")}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-sans font-black transition-all cursor-pointer ${
            activeTab === "near_me" ? "text-orange-500" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <Compass className="w-4.5 h-4.5" />
          <span>Near Me</span>
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-sans font-black transition-all cursor-pointer ${
            activeTab === "map" ? "text-orange-500" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <MapIcon className="w-4.5 h-4.5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-sans font-black transition-all cursor-pointer ${
            activeTab === "events" ? "text-orange-500" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <Calendar className="w-4.5 h-4.5" />
          <span>Events</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_assistant")}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-sans font-black transition-all cursor-pointer relative ${
            activeTab === "ai_assistant" ? "text-orange-500" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span>AI Chat</span>
          <span className="absolute top-0 right-1 bg-orange-750 w-1.5 h-1.5 rounded-full"></span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-sans font-black transition-all cursor-pointer ${
            activeTab === "profile" ? "text-orange-500" : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <User className="w-4.5 h-4.5" />
          <span>Rep</span>
        </button>
      </div>

      {/* --- Detail fly-out popup overlays --- */}
      <AnimatePresence>
        {activeDetailItem && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-stone-200 max-w-[390px] w-full rounded-2xl shadow-2xl relative font-sans text-stone-900 overflow-hidden"
              id="global-details-modal"
            >
              
              {/* Header Visual */}
              <div className="h-32 bg-stone-100 relative">
                <img
                  src={
                    activeDetailItem.data.image ||
                    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=400"
                  }
                  alt="Detail Visual"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setActiveDetailItem(null)}
                  className="absolute top-2 right-2 bg-stone-900/85 text-white hover:bg-stone-950 p-1 rounded-full cursor-pointer transition-all shadow"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-stone-900/85 text-stone-100 text-[8.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded leading-none">
                  {activeDetailItem.type.replace("_", " ")} Node
                </div>
              </div>

              {/* Main Contents description */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-stone-950 leading-tight">
                    {activeDetailItem.data.title || activeDetailItem.data.name}
                  </h3>
                  {activeDetailItem.data.neighborhood && (
                    <p className="text-[10px] text-orange-850 font-semibold uppercase tracking-wider font-sans mt-0.5">
                      District: {activeDetailItem.data.neighborhood.toUpperCase().replace("_", " ")}
                    </p>
                  )}
                </div>

                <p className="text-stone-600 text-xs leading-relaxed font-sans">
                  {activeDetailItem.data.description || activeDetailItem.data.content || "Pueblo local node details."}
                </p>

                {/* Simulated driving detour/route specific to items */}
                <div className="bg-stone-50 border border-stone-150 rounded-xl p-2.5 space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-stone-500 font-mono font-bold leading-none">
                    <CornerDownRight className="w-3.5 h-3.5 text-orange-700" />
                    How to get there from Downtown
                  </div>
                  <p className="text-[10.5px] font-sans text-stone-600 leading-normal pl-2 border-l border-stone-300">
                    "Take Interstate 25 South to exit 98B toward Historic District. Head West on 4th Street, turn south at the avenue intersection. Approximate travel: 4 minutes."
                  </p>
                </div>

                {/* Specific items handles */}
                {activeDetailItem.type === "event" && (
                  <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                    <div className="text-[10px] text-stone-400">
                      📅 {activeDetailItem.data.date} • {activeDetailItem.data.time}
                    </div>
                    <button
                      onClick={() => {
                        handleRSVPToggle(activeDetailItem.data.id);
                        setActiveDetailItem(null);
                        alert("✓ RSVP Register Synced!");
                      }}
                      className="bg-stone-900 text-white font-bold px-3 py-1 text-xs rounded-lg hover:bg-stone-850 transition-all cursor-pointer"
                    >
                      {activeDetailItem.data.rsvps.includes(userProfile.email) ? "Cancel RSVP" : "RSVP Spot"}
                    </button>
                  </div>
                )}

                {activeDetailItem.type === "business" && (
                  <div className="space-y-2 border-t border-stone-100 pt-3 text-xs font-sans text-stone-700">
                    <div className="flex justify-between items-center text-[10px] text-stone-400">
                      <span>Clock: {activeDetailItem.data.hours}</span>
                    </div>
                    {/* Menu items selection */}
                    {activeDetailItem.data.menu && activeDetailItem.data.menu.length > 0 && (
                      <div className="space-y-1 bg-stone-50 p-2 rounded-lg border border-stone-150">
                        <div className="text-[8.5px] font-bold uppercase tracking-wide text-stone-400 font-mono">
                          Signature Slopper Selections:
                        </div>
                        {activeDetailItem.data.menu.map((menu: any, index: number) => (
                          <div key={index} className="flex justify-between text-[10px] leading-tight border-b border-stone-200/50 pb-0.5 last:border-0 last:pb-0">
                            <span className="font-semibold text-stone-800">{menu.name}</span>
                            <span className="font-mono font-bold text-stone-500">{menu.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                        <Phone className="w-3.5 h-3.5 text-stone-300" />
                        {activeDetailItem.data.phone}
                      </div>
                      <span className="bg-amber-100 text-amber-905 font-bold font-mono px-2 py-0.5 text-[9.5px] rounded border border-amber-200">
                        ⭐ {activeDetailItem.data.rating} rating
                      </span>
                    </div>
                  </div>
                )}

                {activeDetailItem.type === "lost_found" && (
                  <div className="flex justify-between items-center border-t border-stone-100 pt-3 text-xs font-sans text-stone-800">
                    <div className="text-[10px] text-stone-400">
                      Report at: {activeDetailItem.data.location}
                    </div>
                    <div className="flex items-center gap-0.5 bg-stone-100 px-3.5 py-1 rounded font-bold text-stone-700">
                      <Phone className="w-3.5 h-3.5 text-stone-300" />
                      {activeDetailItem.data.contact}
                    </div>
                  </div>
                )}

                {activeDetailItem.type === "marketplace_item" && (
                  <div className="flex justify-between items-center border-t border-stone-100 pt-3 text-xs font-sans">
                    <span className="text-sm font-bold text-emerald-850 font-mono">
                      {activeDetailItem.data.price}
                    </span>
                    <div className="text-[10.51px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200">
                      Contact: {activeDetailItem.data.contact}
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE FLOATING TOAST NOTIFICATIONS DRAWER WITH CHIME */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full font-sans" id="live-audio-toast-stack">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl p-4 shadow-xl flex items-start gap-3 select-none"
            >
              <span className="text-xl shrink-0 mt-0.5">🔔</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] tracking-tight">{toast.title}</span>
                  <span className="text-[8px] font-mono text-stone-500 uppercase font-black uppercase">Live Alert</span>
                </div>
                <p className="text-[10px] text-stone-305 mt-1 leading-snug">{toast.content || toast.body}</p>
              </div>
              <button
                onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-stone-500 hover:text-stone-300 transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PWA INSTALLATION WIZARD SIMULATION OVERLAY */}
      {showInstallerWizard && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in" id="pwa-wizard-overlay">
          <div className="bg-white border-2 border-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-stone-900 px-6 py-4.5 text-white flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono bg-orange-700 text-white px-2 py-0.5 rounded font-black">
                  Active Installer Port
                </span>
                <h3 className="font-sans font-black text-sm tracking-tight mt-1">
                  📥 Launching Native Application
                </h3>
              </div>
              <button
                onClick={() => setShowInstallerWizard(false)}
                className="bg-white/10 hover:bg-white/20 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <span className="text-4xl block animate-pulse">📲</span>
              <div className="space-y-1.5">
                <h4 className="font-sans font-extrabold text-sm text-stone-900">Installing Steel City Community Client...</h4>
                <p className="text-[10.5px] text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Configuring standalone secure app sandbox, binding offline databases, and registering with municipal push gateways.
                </p>
              </div>

              {/* Progress bar container */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-stone-500 font-bold">
                  <span>SANDBOX SETUP:</span>
                  <span>{installProgress}%</span>
                </div>
                <div className="w-full bg-stone-100 h-3 border rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-orange-700 h-full rounded-full transition-all duration-150"
                    style={{ width: `${installProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-[9.5px] text-stone-400 font-mono italic leading-none pt-1">
                Configuring background county sync loop...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom Credit lines */}
      <footer className="bg-stone-900 border-t border-stone-850 py-3 px-4 text-center text-[10px] text-stone-500 font-sans tracking-wide shrink-0">
        Steel City Community Applet © 2026. Made with true agricultural and industrial dedication supporting Pueblo County, CO. All rights reserved.
      </footer>

      {showOnboarding && (
        <OnboardingExperience
          onClose={() => setShowOnboarding(false)}
          onComplete={(data) => {
            setUserProfile(prev => ({
              ...prev,
              neighborhood: data.neighborhood,
              avatarConfig: data.avatarConfig,
              customPhoto: data.customPhoto,
              points: prev.points + data.accruedPoints,
              badges: Array.from(new Set([...prev.badges, data.welcomeBadge]))
            }));
            setShowOnboarding(false);
            
            // Push active onboarding notification alert inside list
            setNotifications(prev => [
              {
                id: `notif-${Date.now()}`,
                type: "verification" as const,
                title: "🥇 Profile Activated!",
                content: `Registered safely in ${data.neighborhood.replace("_", " ").toUpperCase()}. Enjoy +50 Reputation points starting bonus!`,
                timestamp: "Just Now",
                read: false
              },
              ...prev
            ]);
          }}
        />
      )}

      {/* Actual Resident & Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border-2 border-orange-600 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header with Pueblo inspired Banner style */}
            <div className="bg-gradient-to-r from-orange-700 via-orange-850 to-amber-700 px-6 py-5 text-white relative">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono bg-orange-950/45 border border-orange-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider text-amber-200 font-bold">
                  City & County Portal
                </span>
              </div>
              <h3 className="font-sans font-black text-base tracking-tight mt-1 px-1 flex items-center gap-2">
                🌶️ Steel City Community Citizen Port
              </h3>
              <p className="text-[10.5px] text-orange-100 mt-1.5 leading-snug">
                Connect securely as a registered Pueblo resident, business owner, or city admin. Syncs your true municipal activity directly to Cloud Firestore.
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Actual Email Enter Form */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                const emailInput = (e.currentTarget.elements.namedItem("loginEmail") as HTMLInputElement).value;
                if (emailInput && emailInput.trim()) {
                  const targetEmail = emailInput.trim().toLowerCase();
                  localStorage.setItem("simulatedUserEmail", targetEmail);
                  await syncSimulatedUserProfile(targetEmail);
                  setShowLoginModal(false);
                }
              }} className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 font-black">
                  Enter Local Registered Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="loginEmail"
                    required
                    placeholder="e.g. christopherosorio7@gmail.com"
                    className="flex-1 bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-orange-500 focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                  >
                    Enter Portal
                  </button>
                </div>
              </form>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[9px] font-mono text-stone-450 uppercase tracking-widest leading-none">
                  Quick Access Local Roles
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              {/* Quick Connect Verified Pueblo Accounts */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                {[
                  {
                    email: "christopherosorio7@gmail.com",
                    name: "Christopher Osorio",
                    desc: "Lead Admin & Pueblo Community Architect",
                    role: "Super Admin",
                    icon: "👑",
                    landmark: "Historic Union District"
                  },
                  {
                    email: "admin@pueblopulse.org",
                    name: "City System Administrator",
                    desc: "Official municipal stream database manager",
                    role: "Super Admin",
                    icon: "🏦",
                    landmark: "Downtown Hall"
                  },
                  {
                    email: "moderator@pueblopulse.org",
                    name: "Regional Stream Moderator",
                    desc: "Safety monitor for Steel District & Bessemer",
                    role: "City Moderator",
                    icon: "🛡️",
                    landmark: "Bessemer District"
                  },
                  {
                    email: "pete.g@milbergerfarms.com",
                    name: "Pete Giadone (Milberger Farms)",
                    desc: "Local grower & retail market supervisor",
                    role: "Business Owner",
                    icon: "👨‍🌾",
                    landmark: "Pueblo East Mesa Farms"
                  }
                ].map((acc) => (
                  <button
                    key={acc.email}
                    onClick={async () => {
                      localStorage.setItem("simulatedUserEmail", acc.email);
                      await syncSimulatedUserProfile(acc.email);
                      setShowLoginModal(false);
                    }}
                    className="text-left w-full border border-stone-200 hover:border-orange-500 hover:bg-orange-50/15 p-2.5 rounded-2xl transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <span className="text-xl bg-stone-50 border border-stone-150 group-hover:bg-white p-1 rounded-xl shrink-0 transition-all">
                      {acc.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-850 group-hover:text-orange-900 font-sans leading-none">{acc.name}</span>
                        <span className="text-[8px] font-mono bg-stone-100 group-hover:bg-orange-100 group-hover:text-orange-955 px-1.5 py-0.2 rounded font-bold uppercase leading-none">
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 font-sans leading-tight truncate">{acc.desc}</p>
                      <div className="flex items-center justify-between mt-1 text-[8.5px] font-mono text-stone-400">
                        <span className="truncate">{acc.email}</span>
                        <span className="text-orange-550 font-bold shrink-0">📍 {acc.landmark}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
