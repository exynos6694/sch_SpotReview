"use client";

import type { Restaurant } from "@/types";
import { CATEGORIES } from "@/types";
import { useState } from "react";
import Link from "next/link";
import AdminToggle from "./AdminToggle";

interface Props {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (restaurant: Restaurant) => void;
  filterCategory: string;
  onFilterChange: (category: string) => void;
  isAdmin: boolean;
  onAdminToggle: (isAdmin: boolean) => void;
  mode: "food" | "pub";
  onModeChange: (mode: "food" | "pub") => void;
}

export default function Sidebar({
  restaurants,
  selectedId,
  onSelect,
  filterCategory,
  onFilterChange,
  isAdmin,
  onAdminToggle,
  mode,
  onModeChange,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = restaurants
    .filter((r) => filterCategory === "all" || r.category === filterCategory)
    .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.avgRating - a.avgRating);

  return (
    <div className="w-80 bg-white/95 backdrop-blur-xl flex flex-col border-r border-gray-100 z-10 h-full">
      {/* Header - hidden on mobile (mobile has its own header) */}
      <div className="hidden md:block p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mode === "pub" ? "🍻" : "🗺️"}</span>
            <h1 className="text-lg font-bold text-gray-900">
              {mode === "pub" ? "SCH 술집 지도" : "SCH 맛집 지도"}
            </h1>
          </div>
          <AdminToggle isAdmin={isAdmin} onToggle={onAdminToggle} />
        </div>
        <p className="text-xs text-gray-400 ml-9">순천향대 근처 {mode === "pub" ? "술집" : "맛집"} 리뷰</p>
      </div>

      {/* Mode Toggle */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => onModeChange("food")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "food"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🍽️ 식당
          </button>
          <button
            onClick={() => onModeChange("pub")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "pub"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🍻 술집
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="음식점 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Category Filter - only for food mode */}
      {mode === "food" && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onFilterChange("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCategory === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              전체
            </button>
            {CATEGORIES.filter((c) => c.value !== "pub").map((cat) => (
              <button
                key={cat.value}
                onClick={() => onFilterChange(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterCategory === cat.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Restaurant List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-sm text-gray-400">등록된 음식점이 없어요</p>
            {isAdmin && (
              <p className="text-xs text-gray-300 mt-1">
                지도를 클릭해서 등록해보세요!
              </p>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filtered.map((r) => {
              const cat = CATEGORIES.find((c) => c.value === r.category);
              const isSelected = r.id === selectedId;

              return (
                <button
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className={`w-full text-left p-4 rounded-xl mb-1.5 transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-2 border-indigo-200 shadow-sm"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{cat?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {r.name}
                        </h3>
                        {r.avgRating > 0 && (
                          <span className="text-xs font-bold text-amber-500 ml-2 shrink-0">
                            ★ {r.avgRating}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {cat?.label}
                        </span>
                        <span className="text-xs text-gray-300">
                          리뷰 {r.reviewCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Random Pick & Footer */}
      <div className="p-4 border-t border-gray-100">
        <Link
          href="/random"
          className="block w-full mb-3 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all active:scale-95 text-center"
        >
          🎲 랜덤 식당 뽑기
        </Link>
        <p className="text-xs text-gray-300 text-center">
          {isAdmin
            ? "💡 지도를 클릭하면 음식점을 등록할 수 있어요"
            : "💡 음식점을 선택하면 리뷰를 볼 수 있어요"}
        </p>
        <Link
          href="/legal"
          className="block text-[10px] text-gray-300 text-center mt-2 hover:text-gray-500 transition-colors"
        >
          이용약관 및 개인정보처리방침
        </Link>
      </div>
    </div>
  );
}
