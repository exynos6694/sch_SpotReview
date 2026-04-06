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

    const isMobile = window.innerWidth < 768;

    // 겹치는 좌표(동일 건물) 분산 알고리즘 (Spiderifier)
    const groups: Record<string, Restaurant[]> = {};
    restaurants.forEach((r) => {
      // 소수점 4자리까지 절사 (약 10m 반경을 같은 위치로 인식)
      const gridX = Math.floor(r.lat * 10000);
      const gridY = Math.floor(r.lng * 10000);
      const key = `${gridX},${gridY}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    const displayCoords = new Map<string, { lat: number; lng: number }>();
    Object.values(groups).forEach((group) => {
      if (group.length === 1) {
        displayCoords.set(group[0].id, { lat: group[0].lat, lng: group[0].lng });
      } else {
        const radius = isMobile ? 0.00028 : 0.00018; // 모바일에서는 지문 터치를 고려해 약 28m로 더 넓게 퍼트림
        group.forEach((r, idx) => {
          const angle = (idx / group.length) * Math.PI * 2;
          displayCoords.set(r.id, {
            lat: r.lat + Math.cos(angle) * radius,
            lng: r.lng + Math.sin(angle) * (radius / 0.8), // 경도 보정
          });
        });
      }
    });

    restaurants.forEach((r) => {
      const coords = displayCoords.get(r.id)!;
      const category = CATEGORIES.find((c) => c.value === r.category);
      const emoji = category?.emoji || "📍";
      const isSelected = r.id === selectedId;

      const content = document.createElement("div");
      content.innerHTML = `
        <div class="${isSelected ? 'map-marker-selected' : ''}" style="
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:${isMobile ? "3px" : "5px"};
          background:${isSelected ? "#4F46E5" : "rgba(255, 255, 255, 0.95)"};
          backdrop-filter: blur(4px);
          color:${isSelected ? "white" : "#1f2937"};
          padding:${isMobile ? "5px 8px" : "7px 12px"};
          border-radius:${isMobile ? "14px" : "20px"};
          box-shadow:0 4px 12px rgba(0,0,0,0.12);
          font-size:${isMobile ? "11px" : "13.5px"};
          font-weight:700;
          white-space:nowrap;
          border:${isMobile ? "1.5px" : "2px"} solid ${isSelected ? "#4F46E5" : "white"};
          transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        ">
          <!-- 마커 꼬리 (역삼각형 모양) -->
          <div style="
            position: absolute;
            bottom: ${isMobile ? "-5px" : "-6px"};
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid ${isSelected ? "#4F46E5" : "rgba(255,255,255,0.95)"};
          "></div>
          <span style="font-size:${isMobile ? "13px" : "16px"}; ${isSelected ? 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));' : ''}">${emoji}</span>
          <span>${r.name}</span>
          ${r.avgRating > 0 ? `<span style="color:${isSelected ? "#fde68a" : "#f59e0b"};font-size:${isMobile ? "10px" : "12px"};">★${r.avgRating}</span>` : ""}
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(coords.lat, coords.lng),
        content,
        yAnchor: 1.3,
        map,
      });

      // 마우스를 올리면 zIndex를 강제로 최상단으로 올려서 겹친 마커도 쉽게 누를 수 있게 함
      content.onmouseenter = () => overlay.setZIndex(50);
      content.onmouseleave = () => overlay.setZIndex(isSelected ? 10 : 0);
      if (isSelected) overlay.setZIndex(10);

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
