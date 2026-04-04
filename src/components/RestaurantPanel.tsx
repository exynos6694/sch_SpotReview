"use client";

import { useState, useEffect } from "react";
import type { Restaurant, Review } from "@/types";
import { CATEGORIES } from "@/types";
import { getReviews, addReview } from "@/lib/firestore";
import StarRating from "./StarRating";

interface Props {
  restaurant: Restaurant;
  onClose: () => void;
  onUpdate: () => void;
}

export default function RestaurantPanel({ restaurant, onClose, onUpdate }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const category = CATEGORIES.find((c) => c.value === restaurant.category);

  useEffect(() => {
    loadReviews();
  }, [restaurant.id]);

  async function loadReviews() {
    setLoading(true);
    const data = await getReviews(restaurant.id);
    setReviews(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setSubmitting(true);
    await addReview({
      restaurantId: restaurant.id,
      author: author.trim(),
      rating,
      content: content.trim(),
    });

    setAuthor("");
    setRating(5);
    setContent("");
    setShowForm(false);
    setSubmitting(false);
    await loadReviews();
    onUpdate();
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-20 flex flex-col border-l border-gray-100 animate-slide-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{category?.emoji}</span>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {category?.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-2">
              {restaurant.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
            {restaurant.description && (
              <p className="text-sm text-gray-600 mt-2">{restaurant.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Rating Summary */}
        <div className="flex items-center gap-4 mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">
              {restaurant.avgRating > 0 ? restaurant.avgRating : "-"}
            </div>
            <div className="text-xs text-amber-600/70 font-medium">평점</div>
          </div>
          <div className="flex-1">
            <StarRating rating={restaurant.avgRating} readonly size="lg" />
            <p className="text-xs text-gray-500 mt-1">
              리뷰 {restaurant.reviewCount}개
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">리뷰</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {showForm ? "취소" : "+ 리뷰 작성"}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3"
          >
            <input
              type="text"
              placeholder="닉네임"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                평점
              </label>
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>
            <textarea
              placeholder="솔직한 리뷰를 남겨주세요!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "등록 중..." : "리뷰 등록"}
            </button>
          </form>
        )}

        {/* Review List */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-gray-400 text-sm">아직 리뷰가 없어요</p>
            <p className="text-gray-400 text-xs mt-1">첫 번째 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">
                    {review.author}
                  </span>
                  <span className="text-xs text-gray-400">
                    {review.createdAt.toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <StarRating rating={review.rating} readonly size="sm" />
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
