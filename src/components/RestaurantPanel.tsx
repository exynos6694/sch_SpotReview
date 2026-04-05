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

// Snap points in px from viewport bottom (computed at runtime)
const SNAP_RATIO_HALF = 0.45;
const SNAP_RATIO_FULL = 1.0;

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

  // --- Bottom sheet state (refs for 60fps) ---
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragHandleBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  // Current translateY value (0 = full screen, vh - snapHalf = half)
  const currentY = useRef(0);
  const snapHalf = useRef(0);
  const snapFull = useRef(0); // always 0 (top of screen)
  const vh = useRef(0);

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTranslate = useRef(0);
  const lastMoveTime = useRef(0);
  const lastMoveY = useRef(0);
  const velocity = useRef(0);

  // For React re-renders (only used for expanded state UI toggles)
  const [isExpanded, setIsExpanded] = useState(false);

  const category = CATEGORIES.find((c) => c.value === restaurant.category);

  // Compute snap points
  useEffect(() => {
    vh.current = window.innerHeight;
    snapHalf.current = vh.current * (1 - SNAP_RATIO_HALF);
    snapFull.current = 0;
  }, []);

  // Apply transform directly to DOM (no React re-render)
  const applyTransform = useCallback((y: number, animate: boolean) => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet || !backdrop) return;

    if (animate) {
      sheet.style.transition = "transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1)";
      backdrop.style.transition = "opacity 0.4s cubic-bezier(0.2, 0.9, 0.3, 1)";
    } else {
      sheet.style.transition = "none";
      backdrop.style.transition = "none";
    }

    sheet.style.transform = `translateY(${y}px)`;

    // Backdrop opacity: 0 at bottom, 0.4 at top
    const progress = 1 - y / vh.current;
    backdrop.style.opacity = `${Math.min(progress * 0.5, 0.4)}`;

    // Border radius: 24px at half, 0 at full
    const expanded = y < snapHalf.current * 0.5;
    const radius = expanded
      ? Math.max(0, Math.round((y / (snapHalf.current * 0.5)) * 24))
      : 24;
    sheet.style.borderTopLeftRadius = `${radius}px`;
    sheet.style.borderTopRightRadius = `${radius}px`;

    // Toggle expanded UI elements
    const bar = dragHandleBarRef.current;
    const header = headerRef.current;
    const hint = hintRef.current;
    const reviewSection = reviewSectionRef.current;

    if (bar) bar.style.opacity = expanded ? "0" : "1";
    if (header) header.style.opacity = expanded ? "1" : "0";
    if (header) header.style.pointerEvents = expanded ? "auto" : "none";
    if (hint) hint.style.display = expanded ? "none" : "";
    if (reviewSection) {
      reviewSection.style.opacity = expanded ? "1" : "0";
      reviewSection.style.pointerEvents = expanded ? "auto" : "none";
    }

    currentY.current = y;
  }, []);

  // Snap to a position
  const snapTo = useCallback(
    (targetY: number, shouldClose?: boolean) => {
      applyTransform(targetY, true);

      const expanded = targetY < snapHalf.current * 0.5;
      setIsExpanded(expanded);

      if (shouldClose) {
        setTimeout(onClose, 400);
      }
    },
    [applyTransform, onClose]
  );

  // Initial animate-in
  useEffect(() => {
    vh.current = window.innerHeight;
    snapHalf.current = vh.current * (1 - SNAP_RATIO_HALF);

    // Start off-screen
    applyTransform(vh.current, false);

    // Animate to half
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        snapTo(snapHalf.current);
      });
    });
  }, [restaurant.id, applyTransform, snapTo]);

  // Load reviews
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
    snapTo(vh.current, true);
  }

  // --- Touch / Mouse drag handlers ---
  const onDragStart = useCallback((clientY: number) => {
    // If content is scrolled down and we're expanded, don't drag
    const el = contentRef.current;
    const expanded = currentY.current < snapHalf.current * 0.5;
    if (el && el.scrollTop > 0 && expanded) return;

    isDragging.current = true;
    dragStartY.current = clientY;
    dragStartTranslate.current = currentY.current;
    velocity.current = 0;
    lastMoveTime.current = Date.now();
    lastMoveY.current = clientY;
  }, []);

  const onDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging.current) return;

      const delta = clientY - dragStartY.current;
      const newY = Math.max(0, Math.min(vh.current, dragStartTranslate.current + delta));

      applyTransform(newY, false);

      // Track velocity
      const now = Date.now();
      const dt = now - lastMoveTime.current;
      if (dt > 0) {
        velocity.current = (clientY - lastMoveY.current) / dt;
      }
      lastMoveTime.current = now;
      lastMoveY.current = clientY;
    },
    [applyTransform]
  );

  const onDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const y = currentY.current;
    const v = velocity.current; // px/ms, positive = downward

    // Fling detection
    if (Math.abs(v) > 0.5) {
      if (v > 0) {
        // Fling down
        if (y > snapHalf.current * 0.7) {
          snapTo(vh.current, true); // close
        } else {
          snapTo(snapHalf.current);
        }
      } else {
        // Fling up
        if (y < snapHalf.current) {
          snapTo(snapFull.current);
        } else {
          snapTo(snapHalf.current);
        }
      }
      return;
    }

    // Position-based snap
    const midClose = (snapHalf.current + vh.current) / 2;
    const midExpand = snapHalf.current / 2;

    if (y > midClose) {
      snapTo(vh.current, true);
    } else if (y > midExpand) {
      snapTo(snapHalf.current);
    } else {
      snapTo(snapFull.current);
    }
  }, [snapTo]);

  // Global mouse events for desktop drag
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onDragMove(e.clientY);
    const onMouseUp = () => onDragEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onDragMove, onDragEnd]);

  // Block touch events from reaching the map behind the sheet.
  // Must be non-passive to allow preventDefault (React onTouchMove is passive).
  // Allow scrolling inside contentRef when expanded and content is scrollable.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const block = (e: TouchEvent) => {
      // If we're actively dragging the sheet, always block
      if (isDragging.current) {
        e.preventDefault();
        return;
      }

      // Allow scroll inside the content area when expanded
      const content = contentRef.current;
      if (content && content.contains(e.target as Node)) {
        const expanded = currentY.current < snapHalf.current * 0.5;
        if (expanded && content.scrollHeight > content.clientHeight) {
          // Allow native scroll
          return;
        }
      }

      // Block everything else (prevents map from moving)
      e.preventDefault();
    };

    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  // --- Desktop panel ---
  const desktopPanel = (
    <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl z-20 flex-col border-l border-gray-100 animate-slide-in">
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
              <p className="text-sm text-gray-600 mt-2">{restaurant.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4 mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">
              {restaurant.avgRating > 0 ? restaurant.avgRating : "-"}
            </div>
            <div className="text-xs text-amber-600/70 font-medium">평점</div>
          </div>
          <div className="flex-1">
            <StarRating rating={restaurant.avgRating} readonly size="lg" />
            <p className="text-xs text-gray-500 mt-1">리뷰 {restaurant.reviewCount}개</p>
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
      <div className="flex-1 overflow-y-auto p-6">{renderReviews()}</div>
    </div>
  );

  // --- Mobile bottom sheet ---
  const mobileSheet = (
    <div
      ref={rootRef}
      className="md:hidden fixed inset-0 z-50"
      style={{ touchAction: "none" }}
    >
      {/* Backdrop - blocks all map interaction */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black"
        style={{ opacity: 0 }}
        onClick={handleClose}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => { e.stopPropagation(); e.preventDefault(); }}
      />

      {/* Sheet - full height, positioned via translateY */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-white shadow-2xl flex flex-col will-change-transform"
        style={{
          height: "100vh",
          transform: `translateY(${vh.current || window.innerHeight}px)`,
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
      >
        {/* Drag handle zone */}
        <div
          ref={handleRef}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
          style={{ paddingTop: "12px" }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onDragStart(e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDragMove(e.touches[0].clientY);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onDragEnd();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onDragStart(e.clientY);
          }}
        >
          {/* Drag bar */}
          <div
            ref={dragHandleBarRef}
            className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1"
            style={{ transition: "opacity 0.2s" }}
          />

          {/* Expanded sticky header */}
          <div
            ref={headerRef}
            className="flex items-center gap-3 px-4 pb-2"
            style={{ opacity: 0, pointerEvents: "none", transition: "opacity 0.2s" }}
          >
            <button
              onClick={handleClose}
              className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-sm font-bold text-gray-900 truncate flex-1">
              {restaurant.name}
            </h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          onTouchStart={(e) => {
            e.stopPropagation();
            const el = contentRef.current;
            const expanded = currentY.current < snapHalf.current * 0.5;
            if (!el || !expanded || el.scrollTop <= 0) {
              onDragStart(e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            if (isDragging.current) {
              e.preventDefault();
              onDragMove(e.touches[0].clientY);
            }
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onDragEnd();
          }}
        >
          {/* Restaurant info */}
          <div className="px-5 pb-4">
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
              {!isExpanded && (
                <button
                  onClick={handleClose}
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {restaurant.description && (
              <p className="text-sm text-gray-500 mt-1">{restaurant.description}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-4 mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {restaurant.avgRating > 0 ? restaurant.avgRating : "-"}
                </div>
                <div className="text-[10px] text-amber-600/70 font-medium">평점</div>
              </div>
              <div className="flex-1">
                <StarRating rating={restaurant.avgRating} readonly size="md" />
                <p className="text-xs text-gray-500 mt-1">리뷰 {restaurant.reviewCount}개</p>
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
            <div
              ref={hintRef}
              className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400"
            >
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              위로 밀어서 리뷰 보기
            </div>
          </div>

          {/* Reviews section */}
          <div
            ref={reviewSectionRef}
            style={{ opacity: 0, pointerEvents: "none", transition: "opacity 0.25s" }}
          >
            <div className="border-t border-gray-100" />
            <div className="px-5 py-4">{renderReviews()}</div>
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

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
            <input
              type="text"
              placeholder="닉네임"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">평점</label>
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
              <div key={review.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">{review.author}</span>
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
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.content}</p>
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
