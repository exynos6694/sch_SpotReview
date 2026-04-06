"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Restaurant } from "@/types";
import { CATEGORIES } from "@/types";

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (restaurant: Restaurant) => void;
  onMapClick: (lat: number, lng: number) => void;
}

// 순천향대학교 좌표
const SCH_CENTER = { lat: 36.7726, lng: 126.9336 };

export default function KakaoMap({
  restaurants,
  selectedId,
  onSelect,
  onMapClick,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const onMapClickRef = useRef(onMapClick);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Keep ref in sync with latest callback
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Load Kakao Maps SDK
  useEffect(() => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => setMapLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.onerror = () => {
      console.error("카카오맵 SDK 로드 실패. API 키와 도메인 설정을 확인하세요.");
    };
    script.onload = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => setMapLoaded(true));
      }
    };
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(SCH_CENTER.lat, SCH_CENTER.lng),
      level: 4,
    });

    mapInstanceRef.current = map;

    // Click to get coordinates - use ref to always get latest callback
    window.kakao.maps.event.addListener(map, "click", (mouseEvent: any) => {
      const latlng = mouseEvent.latLng;
      onMapClickRef.current(latlng.getLat(), latlng.getLng());
    });
  }, [mapLoaded]);

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    const map = mapInstanceRef.current;

    // Remove existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    restaurants.forEach((r) => {
      const category = CATEGORIES.find((c) => c.value === r.category);
      const emoji = category?.emoji || "📍";
      const isSelected = r.id === selectedId;

      const isMobile = window.innerWidth < 768;
      const content = document.createElement("div");
      content.innerHTML = `
        <div style="
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:${isMobile ? "2px" : "4px"};
          background:${isSelected ? "#4F46E5" : "white"};
          color:${isSelected ? "white" : "#1f2937"};
          padding:${isMobile ? "3px 6px" : "6px 10px"};
          border-radius:${isMobile ? "12px" : "20px"};
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
          font-size:${isMobile ? "10px" : "13px"};
          font-weight:600;
          white-space:nowrap;
          border:${isMobile ? "1.5px" : "2px"} solid ${isSelected ? "#4F46E5" : "#e5e7eb"};
          transition:all 0.2s;
        ">
          <span style="font-size:${isMobile ? "12px" : "16px"};">${emoji}</span>
          <span>${r.name}</span>
          ${r.avgRating > 0 ? `<span style="color:${isSelected ? "#fde68a" : "#f59e0b"};font-size:${isMobile ? "9px" : "11px"};">★${r.avgRating}</span>` : ""}
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(r.lat, r.lng),
        content,
        yAnchor: 1.3,
        map,
      });

      content.onclick = () => onSelect(r);
      markersRef.current.push(overlay);
    });
  }, [restaurants, selectedId, mapLoaded, onSelect]);

  // Pan to selected restaurant
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedId) return;
    const r = restaurants.find((r) => r.id === selectedId);
    if (r) {
      mapInstanceRef.current.panTo(
        new window.kakao.maps.LatLng(r.lat, r.lng)
      );
    }
  }, [selectedId, restaurants]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
  );
}
