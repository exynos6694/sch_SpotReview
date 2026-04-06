export interface Restaurant {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  operatingHours: string; // "모름" or free-form text like "11:00 - 21:00"
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
}

export const OPERATING_HOURS_PRESETS = [
  "모름",
  "24시간",
  "09:00 - 21:00",
  "10:00 - 22:00",
  "11:00 - 21:00",
  "11:00 - 22:00",
  "11:30 - 21:30",
  "직접 입력",
] as const;

export interface Review {
  id: string;
  restaurantId: string;
  author: string;
  rating: number;
  content: string;
  photoURLs?: string[];
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
