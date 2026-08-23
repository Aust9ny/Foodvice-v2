import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  Firestore,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { Restaurant, QueueTicket, UserSubscription, Review } from '../types';
import { INITIAL_RESTAURANTS, INITIAL_REVIEWS } from '../data/mockRestaurants';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Database ID if configured
const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
let db: Firestore;

try {
  db = databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);

  // Enable offline persistence if in browser
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      console.info('Firebase offline persistence notice:', err.code);
    });
  }
} catch (e) {
  console.warn('Firestore fallback to default:', e);
  db = getFirestore(app);
}

export { db };

// Collections
const RESTAURANTS_COLLECTION = 'restaurants';
const QUEUES_COLLECTION = 'queues';
const SUBSCRIPTIONS_COLLECTION = 'user_subscriptions';
const REVIEWS_COLLECTION = 'restaurant_reviews';

/**
 * Initialize / Seed Firestore with starter restaurants and reviews if empty
 */
export async function initializeFirestoreDatabase(): Promise<Restaurant[]> {
  try {
    const colRef = collection(db, RESTAURANTS_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      console.log('Seeding initial traditional restaurants to Firestore...');
      for (const rest of INITIAL_RESTAURANTS) {
        await setDoc(doc(db, RESTAURANTS_COLLECTION, rest.id), rest);
      }
      // Also seed initial traveler reviews
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, REVIEWS_COLLECTION, rev.id), rev);
      }
      return INITIAL_RESTAURANTS;
    } else {
      const list: Restaurant[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as Restaurant);
      });
      return list;
    }
  } catch (error) {
    console.warn('Firestore seeding/fetch fallback to local data:', error);
    return INITIAL_RESTAURANTS;
  }
}

/**
 * Real-time subscription to Restaurants collection
 */
export function subscribeToRestaurants(callback: (restaurants: Restaurant[]) => void) {
  try {
    const colRef = collection(db, RESTAURANTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Restaurant[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Restaurant);
          });
          callback(list);
        } else {
          // If empty in Firestore, seed and callback
          initializeFirestoreDatabase().then(callback);
        }
      },
      (error) => {
        console.warn('Firestore real-time restaurant sync error, using cached:', error);
        callback(INITIAL_RESTAURANTS);
      }
    );
  } catch (e) {
    console.warn('Firestore listener setup failed:', e);
    callback(INITIAL_RESTAURANTS);
    return () => {};
  }
}

/**
 * Add / Suggest a new traditional restaurant to Firestore (Crowd-sourced contribution)
 */
export async function addRestaurantToFirestore(restaurant: Restaurant): Promise<Restaurant> {
  try {
    await setDoc(doc(db, RESTAURANTS_COLLECTION, restaurant.id), restaurant);
    console.log('Successfully added restaurant to Firestore:', restaurant.id);
  } catch (error) {
    console.warn('Could not save restaurant to Firestore, using offline storage:', error);
  }
  return restaurant;
}

/**
 * Real-time subscription to Reviews for a specific restaurant (or all reviews)
 */
export function subscribeToRestaurantReviews(restaurantId: string | null, callback: (reviews: Review[]) => void) {
  try {
    const colRef = collection(db, REVIEWS_COLLECTION);
    const q = restaurantId
      ? query(colRef, where('restaurantId', '==', restaurantId))
      : colRef;

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Review[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Review);
          });
          callback(list);
        } else {
          // Fallback to initial reviews if matching
          const filtered = restaurantId
            ? INITIAL_REVIEWS.filter((r) => r.restaurantId === restaurantId)
            : INITIAL_REVIEWS;
          callback(filtered);
        }
      },
      (error) => {
        console.warn('Firestore reviews listener fallback:', error);
        const filtered = restaurantId
          ? INITIAL_REVIEWS.filter((r) => r.restaurantId === restaurantId)
          : INITIAL_REVIEWS;
        callback(filtered);
      }
    );
  } catch (e) {
    console.warn('Reviews setup failed:', e);
    const filtered = restaurantId
      ? INITIAL_REVIEWS.filter((r) => r.restaurantId === restaurantId)
      : INITIAL_REVIEWS;
    callback(filtered);
    return () => {};
  }
}

/**
 * Submit a Community Review to Firestore & update restaurant rating
 */
export async function addRestaurantReview(review: Omit<Review, 'id'>, currentRestaurant?: Restaurant): Promise<Review> {
  const reviewId = 'rev_' + Date.now();
  const fullReview: Review = { ...review, id: reviewId };
  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, reviewId), fullReview);

    // Update restaurant rating & review count if provided
    if (currentRestaurant) {
      const newReviewCount = (currentRestaurant.reviewCount || 0) + 1;
      const newRating = Number(
        (((currentRestaurant.rating * (currentRestaurant.reviewCount || 1)) + review.rating) / newReviewCount).toFixed(2)
      );
      try {
        const restRef = doc(db, RESTAURANTS_COLLECTION, currentRestaurant.id);
        await updateDoc(restRef, {
          reviewCount: newReviewCount,
          rating: newRating
        });
      } catch (err) {
        console.warn('Failed to update restaurant rating aggregate:', err);
      }
    }
  } catch (e) {
    console.warn('Review saved locally:', e);
  }
  return fullReview;
}

/**
 * Save VIP / Ad-Free subscription state (Supports Lifetime One-Time Pass)
 */
export async function saveUserSubscription(userId: string, subscription: UserSubscription): Promise<void> {
  try {
    const subRef = doc(db, SUBSCRIPTIONS_COLLECTION, userId);
    await setDoc(subRef, subscription);
  } catch (error) {
    console.warn('Error saving subscription to Firestore:', error);
  }
}

/**
 * Load user subscription state
 */
export function subscribeToUserSubscription(userId: string, callback: (sub: UserSubscription) => void) {
  try {
    const subRef = doc(db, SUBSCRIPTIONS_COLLECTION, userId);
    return onSnapshot(
      subRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as UserSubscription);
        } else {
          callback({ isVip: false, status: 'free' });
        }
      },
      (err) => {
        console.warn('Subscription listener error:', err);
      }
    );
  } catch (e) {
    return () => {};
  }
}

/**
 * Join Virtual Queue in Firestore (Kept for backwards compatibility)
 */
export async function joinVirtualQueue(ticket: Omit<QueueTicket, 'id'>): Promise<QueueTicket> {
  const ticketId = 'queue_' + Date.now();
  const fullTicket: QueueTicket = {
    ...ticket,
    id: ticketId,
  };
  try {
    await setDoc(doc(db, QUEUES_COLLECTION, ticketId), fullTicket);
  } catch (error) {}
  return fullTicket;
}

/**
 * Report live wait time (Crowd-sourced wait updater)
 */
export async function reportRestaurantWaitTime(restaurantId: string, newWaitMinutes: number): Promise<void> {
  try {
    let waitStatus: Restaurant['waitStatus'] = 'low';
    let crowdDensity = 25;
    if (newWaitMinutes > 30) {
      waitStatus = 'peak';
      crowdDensity = 90;
    } else if (newWaitMinutes > 15) {
      waitStatus = 'busy';
      crowdDensity = 70;
    } else if (newWaitMinutes > 8) {
      waitStatus = 'moderate';
      crowdDensity = 45;
    }

    const restRef = doc(db, RESTAURANTS_COLLECTION, restaurantId);
    await updateDoc(restRef, {
      waitMinutes: newWaitMinutes,
      waitStatus,
      crowdDensity,
    });
  } catch (error) {
    console.warn('Could not report wait time to Firestore:', error);
  }
}
