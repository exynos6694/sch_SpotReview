"use client";

import { useState, useEffect, useCallback } from "react";
import KakaoMap from "@/components/KakaoMap";
import Sidebar from "@/components/Sidebar";
import RestaurantPanel from "@/components/RestaurantPanel";
import AddRestaurantModal from "@/components/AddRestaurantModal";
import { getRestaurants } from "@/lib/firestore";
import type { Restaurant } from "@/types";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [addModal, setAddModal] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadRestaurants() {
    const data = await getRestaurants();
    setRestaurants(data);
    setLoading(false);
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
  }, []);

  const filteredRestaurants = restaurants.filter(
    (r) => filterCategory === "all" || r.category === filterCategory
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        restaurants={restaurants}
        selectedId={selectedRestaurant?.id ?? null}
        onSelect={handleSelect}
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
        isAdmin={isAdmin}
        onAdminToggle={setIsAdmin}
      />

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
        />
      )}
    </div>
  );
}
