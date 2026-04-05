"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Restaurant, Review } from "@/types";
import { CATEGORIES } from "@/types";
import { getReviews, addReview, deleteReview } from "@/lib/firestore";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StarRating from "./StarRating";

interface Props {
  restaurant: Restaurant;
  onClose: () => void;
  onUpdate: () => void;
  isAdmin: boolean;
}

// Snap points as percentage of viewport height from bottom
const SNAP_HALF = 0.45;
const SNAP_FULL = 1.0;
const SNAP_CLOSED = 0;

export default function RestaurantPanel({
  restaurant,
  onClose,
  onUpdate,
  isAdmin,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Bottom sheet state
  const [sheetHeight, setSheetHeight] = useState(SNAP_HALF);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const category = CATEGORIES.find((c) => c.value === restaurant.category);

  useEffect(() => {
    loadReviews();
    // Animate in
    setSheetHeight(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSheetHeight(SNAP_HALF);
      });
    });
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

  async function handleDeleteRestaurant() {
    if (!confirm("정말 이 음식점을 삭제하시겠습니까?")) return;
    setDeleting(true);
    for (const review of reviews) {
      await deleteDoc(doc(db, "reviews", review.id));
    }
    await deleteDoc(doc(db, "restaurants", restaurant.id));
    setDeleting(false);
    onClose();
    onUpdate();
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
    await deleteReview(reviewId, restaurant.id);
    await loadReviews();
    onUpdate();
  }

  function handleClose() {
    setIsClosing(true);
    setSheetHeight(0);
    setTimeout(onClose, 300);
  }

  // Snap to nearest point
  const snapTo = useCallback((height: number) => {
    if (height < 0.2) {
      // Close
      setIsClosing(true);
      setSheetHeight(0);
      setTimeout(onClose, 300);
    } else if (height < 0.7) {
      setSheetHeight(SNAP_HALF);
    } else {
      setSheetHeight(SNAP_FULL);
    }
  }, [onClose]);

  // Touch handlers for drag
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // If scrollable content is scrolled, don't start drag
      const el = contentRef.current;
      if (el && el.scrollTop > 0 && sheetHeight >= SNAP_FULL) return;

      setIsDragging(true);
      dragStartY.current = e.touches[0].clientY;
      dragStartHeight.current = sheetHeight;
    },
    [sheetHeight]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const deltaY = dragStartY.current - e.touches[0].clientY;
      const deltaHeight = deltaY / window.innerHeight;
      const newHeight = Math.max(0, Math.min(SNAP_FULL, dragStartHeight.current + deltaHeight));
      setSheetHeight(newHeight);
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    snapTo(sheetHeight);
  }, [isDragging, sheetHeight, snapTo]);

  // Mouse handlers for desktop drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartY.current = e.clientY;
      dragStartHeight.current = sheetHeight;
      e.preventDefault();
    },
    [sheetHeight]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartY.current - e.clientY;
      const deltaHeight = deltaY / window.innerHeight;
      const newHeight = Math.max(0, Math.min(SNAP_FULL, dragStartHeight.current + deltaHeight));
      setSheetHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      snapTo(sheetHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, sheetHeight, snapTo]);

  const isExpanded = sheetHeight > 0.7;

  // --- Desktop panel (keep original right-side behavior) ---
  const desktopPanel = (
    <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-20 flex-col border-l border-gray-100 animate-slide-in">
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
            {restaurant.description && (
              <p className="text-sm text-gray-600 mt-2">
                {restaurant.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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

        {isAdmin && (
          <button
            onClick={handleDeleteRestaurant}
            disabled={deleting}
            className="w-full mt-3 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {deleting ? "삭제 중..." : "🗑️ 음식점 삭제"}
          </button>
        )}
      </div>

      {/* Reviews */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderReviews()}
      </div>
    </div>
  );

  // Border radius decreases as sheet expands toward full
  const borderRadius = isExpanded
    ? Math.max(0, Math.round((1 - (sheetHeight - 0.7) / 0.3) * 24))
    : 24;

  // --- Mobile bottom sheet ---
  const mobileSheet = (
    <div className="md:hidden fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          opacity: Math.min(sheetHeight * 0.6, 0.4),
          background: "black",
          transition: isDragging ? "none" : "opacity 0.3s",
        }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 pointer-events-auto bg-white shadow-2xl flex flex-col"
        style={{
          height: `${sheetHeight * 100}vh`,
          transition: isDragging
            ? "none"
            : "height 0.35s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "100vh",
          borderTopLeftRadius: `${borderRadius}px`,
          borderTopRightRadius: `${borderRadius}px`,
        }}
      >
        {/* Top bar: drag handle + back button when expanded */}
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{
            paddingTop: isExpanded
              ? "max(env(safe-area-inset-top, 12px), 12px)"
              : "12px",
            transition: isDragging ? "none" : "padding 0.35s",
          }}
        >
          {/* Drag handle - fades out when fully expanded */}
          <div
            className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1"
            style={{
              opacity: isExpanded ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          />

          {/* Sticky header when fully expanded */}
          {isExpanded && (
            <div className="flex items-center gap-3 px-4 pb-2">
              <button
                onClick={handleClose}
                className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-sm font-bold text-gray-900 truncate flex-1">
                {restaurant.name}
              </h2>
            </div>
          )}
        </div>

        {/* Scrollable content area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          onTouchStart={(e) => {
            // Allow drag from scrollable area when at top
            if (contentRef.current && contentRef.current.scrollTop <= 0) {
              handleTouchStart(e);
            }
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Restaurant info */}
          <div className="px-5 pb-4">
            {!isExpanded && (
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category?.emoji}</span>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {category?.label}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mt-2 truncate">
                    {restaurant.name}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {isExpanded && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{category?.emoji}</span>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {category?.label}
                </span>
              </div>
            )}

            {isExpanded && (
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                {restaurant.name}
              </h2>
            )}

            {restaurant.description && (
              <p
                className={`text-sm text-gray-500 mt-1 ${
                  isExpanded ? "" : "line-clamp-2"
                }`}
              >
                {restaurant.description}
              </p>
            )}

            {/* Rating Summary */}
            <div className="flex items-center gap-4 mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {restaurant.avgRating > 0 ? restaurant.avgRating : "-"}
                </div>
                <div className="text-[10px] text-amber-600/70 font-medium">
                  평점
                </div>
              </div>
              <div className="flex-1">
                <StarRating rating={restaurant.avgRating} readonly size="md" />
                <p className="text-xs text-gray-500 mt-1">
                  리뷰 {restaurant.reviewCount}개
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={handleDeleteRestaurant}
                disabled={deleting}
                className="w-full mt-3 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
              >
                {deleting ? "삭제 중..." : "🗑️ 음식점 삭제"}
              </button>
            )}

            {/* Expand hint */}
            {!isExpanded && (
              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400">
                <svg
                  className="w-4 h-4 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                위로 밀어서 리뷰 보기
              </div>
            )}
          </div>

          {/* Reviews section */}
          <div
            style={{
              opacity: isExpanded ? 1 : 0,
              maxHeight: isExpanded ? "none" : "0px",
              overflow: isExpanded ? "visible" : "hidden",
              transition: "opacity 0.25s ease",
            }}
          >
            <div className="border-t border-gray-100" />
            <div className="px-5 py-4">
              {renderReviews()}
            </div>
            {/* Safe area bottom padding */}
            <div className="h-[env(safe-area-inset-bottom,0px)]" />
          </div>
        </div>
      </div>
    </div>
  );

  function renderReviews() {
    return (
      <>
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
            <p className="text-gray-400 text-xs mt-1">
              첫 번째 리뷰를 남겨보세요!
            </p>
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {review.createdAt.toLocaleDateString("ko-KR")}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <StarRating rating={review.rating} readonly size="sm" />
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {desktopPanel}
      {mobileSheet}
    </>
  );
}
