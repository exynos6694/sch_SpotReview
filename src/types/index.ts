export interface Restaurant {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface Review {
  id: string;
  restaurantId: string;
  author: string;
  rating: number;
  content: string;
  createdAt: Date;
}

export const CATEGORIES = [
  { value: "korean", label: "한식", emoji: "🍚" },
  { value: "chinese", label: "중식", emoji: "🥟" },
  { value: "japanese", label: "일식", emoji: "🍣" },
  { value: "western", label: "양식", emoji: "🍝" },
  { value: "chicken", label: "치킨", emoji: "🍗" },
  { value: "pizza", label: "피자", emoji: "🍕" },
  { value: "cafe", label: "카페", emoji: "☕" },
  { value: "pub", label: "술집", emoji: "🍺" },
  { value: "other", label: "기타", emoji: "🍴" },
] as const;
