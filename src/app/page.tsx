"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import KakaoMap from "@/components/KakaoMap";
import Sidebar from "@/components/Sidebar";
import RestaurantPanel from "@/components/RestaurantPanel";
import AddRestaurantModal from "@/components/AddRestaurantModal";
import AdminToggle from "@/components/AdminToggle";
import { getRestaurants } from "@/lib/firestore";
import type { Restaurant } from "@/types";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [mode, setMode] = useState<"food" | "pub">("food");
  const [addModal, setAddModal] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("spot-review-mode");
    if (saved === "food" || saved === "pub") setMode(saved);
  }, []);

  const handleModeChange = useCallback((newMode: "food" | "pub") => {
    setMode(newMode);
    setFilterCategory("all");
    localStorage.setItem("spot-review-mode", newMode);
  }, []);

  async function loadRestaurants() {
    const data = await getRestaurants();
    setRestaurants(data);
    setLoading(false);

    // Auto-select restaurant from query param (e.g. from random page)
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get("selected");
    if (selectedId) {
      const found = data.find((r) => r.id === selectedId);
      if (found) setSelectedRestaurant(found);
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (isAdmin) {
        setAddModal({ lat, lng });
      }
    },
    [isAdmin]
  );

  const handleSelect = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSidebarOpen(false);
  }, []);

  const modeFilteredRestaurants = restaurants.filter((r) =>
    mode === "pub" ? r.category === "pub" : r.category !== "pub"
  );

  const filteredRestaurants = modeFilteredRestaurants.filter(
    (r) => filterCategory === "all" || r.category === filterCategory
  );

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Header - floating pills */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 px-3 pt-[env(safe-area-inset-top,8px)] pb-2 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="pointer-events-auto p-2.5 bg-white/90 backdrop-blur-lg rounded-full shadow-lg shadow-black/8 active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        <div className="pointer-events-auto flex items-center gap-1 px-1 py-1 bg-white/90 backdrop-blur-lg rounded-full shadow-lg shadow-black/8">
          <button
            onClick={() => handleModeChange("food")}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              mode === "food" ? "bg-indigo-600 text-white" : "text-gray-500"
            }`}
          >
            🍽️ 식당
          </button>
          <button
            onClick={() => handleModeChange("pub")}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              mode === "pub" ? "bg-amber-500 text-white" : "text-gray-500"
            }`}
          >
            🍻 술집
          </button>
        </div>
        <div className="pointer-events-auto bg-white/90 backdrop-blur-lg rounded-full shadow-lg shadow-black/8">
          <AdminToggle isAdmin={isAdmin} onToggle={setIsAdmin} />
        </div>
      </div>

      {/* Sidebar - desktop always visible, mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`
          fixed md:relative z-40 md:z-10 h-full mt-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          restaurants={modeFilteredRestaurants}
          selectedId={selectedRestaurant?.id ?? null}
          onSelect={handleSelect}
          filterCategory={filterCategory}
          onFilterChange={setFilterCategory}
          isAdmin={isAdmin}
          onAdminToggle={setIsAdmin}
          mode={mode}
          onModeChange={handleModeChange}
        />
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full mx-auto" />
              <p className="text-sm text-gray-400 mt-4">지도를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <KakaoMap
            restaurants={filteredRestaurants}
            selectedId={selectedRestaurant?.id ?? null}
            onSelect={handleSelect}
            onMapClick={handleMapClick}
          />
        )}

        {/* Restaurant Detail Panel */}
        {selectedRestaurant && (
          <RestaurantPanel
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
            onUpdate={loadRestaurants}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Add Restaurant Modal (admin only) */}
      {addModal && isAdmin && (
        <AddRestaurantModal
          lat={addModal.lat}
          lng={addModal.lng}
          onClose={() => setAddModal(null)}
          onAdded={loadRestaurants}
          defaultCategory={mode === "pub" ? "pub" : "korean"}
        />
      )}
    </div>
  );
}
