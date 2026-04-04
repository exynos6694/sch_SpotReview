import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
  Timestamp,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Restaurant, Review } from "@/types";

// === Restaurants ===

export async function getRestaurants(): Promise<Restaurant[]> {
  const snapshot = await getDocs(collection(db, "restaurants"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  })) as Restaurant[];
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const docRef = doc(db, "restaurants", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: (snapshot.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  } as Restaurant;
}

export async function addRestaurant(
  data: Omit<Restaurant, "id" | "avgRating" | "reviewCount" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "restaurants"), {
    ...data,
    avgRating: 0,
    reviewCount: 0,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// === Reviews ===

export async function getReviews(restaurantId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  })) as Review[];
}

export async function addReview(
  data: Omit<Review, "id" | "createdAt">
): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: Timestamp.now(),
  });

  // Update restaurant average rating
  const reviews = await getReviews(data.restaurantId);
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + data.rating;
  const newCount = reviews.length + 1;

  const restaurantRef = doc(db, "restaurants", data.restaurantId);
  await updateDoc(restaurantRef, {
    avgRating: Math.round((totalRating / newCount) * 10) / 10,
    reviewCount: newCount,
  });
}

export async function deleteReview(reviewId: string, restaurantId: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", reviewId));

  const reviews = await getReviews(restaurantId);
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const newCount = reviews.length;

  const restaurantRef = doc(db, "restaurants", restaurantId);
  await updateDoc(restaurantRef, {
    avgRating: newCount > 0 ? Math.round((totalRating / newCount) * 10) / 10 : 0,
    reviewCount: newCount,
  });
}
