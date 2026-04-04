"use client";

import type { Restaurant } from "@/types";
import { CATEGORIES } from "@/types";
import { useState } from "react";
import StarRating from "./StarRating";

interface Props {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (restaurant: Restaurant) => void;
  filterCategory: string;
  onFilterChange: (category: string) => void;
}

export default function Sidebar({
  restaurants,
  selectedId,
  onSelect,
  filterCategory,
  onFilterChange,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = restaurants
    .filter((r) => filterCategory === "all" || r.category === filterCategory)
    .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.avgRating - a.avgRating);

  return (
    <div className="w-80 bg-white/95 backdrop-blur-xl flex flex-col border-r border-gray-100 z-10">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🗺️</span>
          <h1 className="text-lg font-bold text-gray-900">SCH 맛집 지도</h1>
        </div>
        <p className="text-xs text-gray-400 ml-9">순천향대 근처 맛집 리뷰</p>
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

      {/* Category Filter */}
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
          {CATEGORIES.map((cat) => (
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

      {/* Restaurant List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🍽️</p>
            <p className="text-sm text-gray-400">등록된 음식점이 없어요</p>
            <p className="text-xs text-gray-300 mt-1">
              지도를 클릭해서 등록해보세요!
            </p>
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
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {r.address}
                      </p>
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

      {/* Footer hint */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-300 text-center">
          💡 지도를 클릭하면 음식점을 등록할 수 있어요
        </p>
      </div>
    </div>
  );
}
