"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getRestaurants } from "@/lib/firestore";
import { CATEGORIES } from "@/types";
import type { Restaurant } from "@/types";

export default function RandomPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Restaurant | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [mode, setMode] = useState<"food" | "pub">("food");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("spot-review-mode") : null;
    const currentMode: "food" | "pub" = saved === "pub" ? "pub" : "food";
    setMode(currentMode);
    getRestaurants().then((data) => {
      const filtered = data.filter((r) =>
        currentMode === "pub" ? r.category === "pub" : r.category !== "pub"
      );
      setRestaurants(filtered);
      setLoading(false);
    });
  }, []);

  const spin = useCallback(() => {
    if (restaurants.length === 0 || spinning) return;

    setSpinning(true);
    setResult(null);

    const target = Math.floor(Math.random() * restaurants.length);
    let speed = 50;
    let elapsed = 0;
    const totalDuration = 3000;
    let currentIndex = 0;

    function tick() {
      currentIndex = (currentIndex + 1) % restaurants.length;
      setDisplayIndex(currentIndex);
      elapsed += speed;

      if (elapsed >= totalDuration) {
        // Final result
        setDisplayIndex(target);
        setResult(restaurants[target]);
        setSpinning(false);
        return;
      }

      // Gradually slow down
      const progress = elapsed / totalDuration;
      if (progress > 0.6) {
        speed = 50 + (progress - 0.6) * 600;
      }

      intervalRef.current = setTimeout(tick, speed);
    }

    tick();
  }, [restaurants, spinning]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  const displayRestaurant = restaurants[displayIndex];
  const displayCategory = displayRestaurant
    ? CATEGORIES.find((c) => c.value === displayRestaurant.category)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        지도로 돌아가기
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        🎲 랜덤 {mode === "pub" ? "술집" : "식당"} 뽑기
      </h1>
      <p className="text-sm text-gray-400 mb-10">
        {mode === "pub" ? "오늘 어디서 한잔? 고민될 땐 돌려!" : "오늘 뭐 먹지? 고민될 땐 돌려!"}
      </p>

      {loading ? (
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full mx-auto" />
          <p className="text-sm text-gray-400 mt-4">식당 목록 불러오는 중...</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-gray-400">등록된 식당이 없어요</p>
        </div>
      ) : (
        <>
          {/* Slot Machine */}
          <div className="w-full max-w-sm">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Top decoration */}
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              {/* Slot window */}
              <div className="p-6">
                <div
                  className={`relative bg-gray-50 rounded-2xl border-2 ${
                    result ? "border-amber-300" : spinning ? "border-indigo-300" : "border-gray-200"
                  } overflow-hidden transition-colors`}
                >
                  {/* Slot content */}
                  <div
                    className={`flex flex-col items-center justify-center py-10 px-4 min-h-[200px] transition-all ${
                      spinning ? "animate-slot-blur" : ""
                    } ${result ? "animate-slot-reveal" : ""}`}
                  >
                    {displayRestaurant ? (
                      <>
                        <span className={`text-5xl mb-4 ${spinning ? "animate-bounce" : ""}`}>
                          {displayCategory?.emoji || "🍴"}
                        </span>
                        <h2
                          className={`text-xl font-bold text-gray-900 text-center ${
                            spinning ? "" : "mb-1"
                          }`}
                        >
                          {displayRestaurant.name}
                        </h2>
                        {!spinning && (
                          <>
                            <span className="text-xs text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full mt-2">
                              {displayCategory?.label}
                            </span>
                            {result && result.avgRating > 0 && (
                              <div className="flex items-center gap-1 mt-3">
                                <span className="text-amber-400 text-sm">★</span>
                                <span className="text-sm font-semibold text-gray-700">
                                  {result.avgRating}
                                </span>
                                <span className="text-xs text-gray-400 ml-1">
                                  (리뷰 {result.reviewCount})
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-300 text-lg">?</p>
                    )}
                  </div>

                  {/* Shine effect on result */}
                  {result && (
                    <div className="absolute inset-0 pointer-events-none animate-slot-shine">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12" />
                    </div>
                  )}
                </div>

                {/* Description when result shown */}
                {result && result.description && (
                  <p className="text-sm text-gray-500 text-center mt-4 px-2 animate-fade-in">
                    {result.description}
                  </p>
                )}
              </div>

              {/* Spin button */}
              <div className="px-6 pb-6">
                <button
                  onClick={spin}
                  disabled={spinning}
                  className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
                    spinning
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 active:scale-[0.98] shadow-lg shadow-indigo-200"
                  }`}
                >
                  {spinning ? "돌리는 중..." : result ? "🎲 다시 돌리기" : "🎰 돌리기!"}
                </button>
              </div>
            </div>
          </div>

          {/* Result action */}
          {result && (
            <Link
              href={`/?selected=${result.id}`}
              className="mt-6 text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors animate-fade-in"
            >
              지도에서 보기 →
            </Link>
          )}
        </>
      )}
    </div>
  );
}
