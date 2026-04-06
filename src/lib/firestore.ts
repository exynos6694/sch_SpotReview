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

export async function updateRestaurant(
  id: string,
  data: Partial<Pick<Restaurant, "name" | "description" | "category" | "operatingHours">>
): Promise<void> {
  const restaurantRef = doc(db, "restaurants", id);
  await updateDoc(restaurantRef, data);
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

// === Image Upload ===

export async function uploadReviewPhotos(
  restaurantId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];
  const uploadUrl = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || "https://azsx6694.duckdns.org";

  for (const file of files) {
    // Compress if needed (max 1MB)
    let blob: Blob = file;
    if (file.size > 1024 * 1024) {
      blob = await compressImage(file, 1024, 0.8);
    }

    const formData = new FormData();
    formData.append("files", blob, file.name || "image.jpg");

    try {
      const response = await fetch(`${uploadUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 서버 전송에 실패했습니다.");
      }

      const data = await response.json();
      if (data.urls && data.urls.length > 0) {
        urls.push(...data.urls);
      }
    } catch (e) {
      console.error(e);
      throw new Error("이미지 업로드 중 오류가 발생했습니다.");
    }
  }
  return urls;
}

async function compressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            resolve(blob || file);
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러올 수 없습니다."));
    };
    img.src = objectUrl;
  });
}

export async function addReview(
  data: Omit<Review, "id" | "createdAt">
): Promise<void> {
  const reviewData: Record<string, unknown> = {
    ...data,
    createdAt: Timestamp.now(),
  };
  if (!data.photoURLs || data.photoURLs.length === 0) {
    delete reviewData.photoURLs;
  }
  await addDoc(collection(db, "reviews"), reviewData);

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
