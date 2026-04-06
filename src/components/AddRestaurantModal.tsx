"use client";

import { useState } from "react";
import { CATEGORIES, OPERATING_HOURS_PRESETS } from "@/types";
import { addRestaurant } from "@/lib/firestore";

interface Props {
  lat: number;
  lng: number;
  onClose: () => void;
  onAdded: () => void;
  defaultCategory?: string;
}

export default function AddRestaurantModal({ lat, lng, onClose, onAdded, defaultCategory }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(defaultCategory || "korean");
  const [description, setDescription] = useState("");
  const [operatingHours, setOperatingHours] = useState("모름");
  const [customHours, setCustomHours] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    await addRestaurant({
      name: name.trim(),
      category,
      lat,
      lng,
      address: "",
      description: description.trim(),
      operatingHours: operatingHours === "직접 입력" ? customHours.trim() || "모름" : operatingHours,
    });
    setSubmitting(false);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              🏪 음식점 등록
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            지도에서 클릭한 위치에 등록됩니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              가게 이름 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 순대국밥집"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              카테고리
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    category === cat.value
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              운영시간
            </label>
            <select
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            >
              {OPERATING_HOURS_PRESETS.map((preset) => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
            {operatingHours === "직접 입력" && (
              <input
                type="text"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                placeholder="예: 평일 11:00-21:00, 주말 휴무"
                className="w-full mt-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 가게만의 특별한 점을 알려주세요"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
          >
            {submitting ? "등록 중..." : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
