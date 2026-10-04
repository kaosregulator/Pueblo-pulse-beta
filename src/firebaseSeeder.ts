import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  INITIAL_POSTS,
  INITIAL_BUSINESSES,
  INITIAL_EVENTS,
  INITIAL_JOBS,
  INITIAL_LOST_FOUND,
  INITIAL_ALERTS,
  INITIAL_MARKETPLACE
} from "./dbMock";

// Robust cleanup function that cleans preloaded/mock data from Firestore
export async function seedFirestoreIfEmpty() {
  // Check if a user is currently signed in.
  if (!auth.currentUser) {
    console.log("🌱 No signed-in user detected. Skipping cleanup for guest session.");
    return;
  }

  const collectionsToClean = [
    { name: "posts", data: INITIAL_POSTS },
    { name: "businesses", data: INITIAL_BUSINESSES },
    { name: "events", data: INITIAL_EVENTS },
    { name: "jobs", data: INITIAL_JOBS },
    { name: "lostFound", data: INITIAL_LOST_FOUND },
    { name: "alerts", data: INITIAL_ALERTS },
    { name: "marketplace", data: INITIAL_MARKETPLACE }
  ];

  console.log("🧹 Commencing automated cleanup of preloaded/mock items from Cloud Firestore...");
  
  for (const col of collectionsToClean) {
    for (const item of col.data) {
      try {
        const docRef = doc(db, col.name, item.id);
        await deleteDoc(docRef);
        console.log(`🗑️ Deleted preloaded item: ${col.name}/${item.id}`);
      } catch (err) {
        console.log(`ℹ️ Non-fatal: Skip/Failure deleting ${col.name}/${item.id} (likely doesn't exist or permissions):`, err instanceof Error ? err.message : err);
      }
    }
  }
  
  console.log("✅ Cleanup finished! All preloaded mock records have been deleted from your database.");
}
