import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/types";

// Fix default icon paths for Leaflet in bundlers
const blueIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = L.divIcon({
  html: `<div style="background:#16a34a;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const redIcon = L.divIcon({
  html: `<div style="background:#dc2626;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const orangeIcon = L.divIcon({
  html: `<div style="background:#f97316;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface MapViewProps {
  center?: GeoPoint;
  zoom?: number;
  customerLocation?: GeoPoint;
  mechanicLocation?: GeoPoint;
  route?: GeoPoint[];
  markers?: Array<{ pos: GeoPoint; label?: string; color?: "blue" | "green" | "red" | "orange" }>;
  height?: string;
  interactive?: boolean;
  onMapClick?: (point: GeoPoint) => void;
}

export default function MapView({
  center,
  zoom = 13,
  customerLocation,
  mechanicLocation,
  route,
  markers,
  height = "400px",
  interactive = true,
  onMapClick,
}: MapViewProps) {
  const mapId = "map-" + Math.random().toString(36).slice(2, 8);

  useEffect(() => {
    const fallback = { lat: 23.0225, lng: 72.5714 };
    const c = center || customerLocation || fallback;
    const map = L.map(mapId, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
    }).setView([c.lat, c.lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    const routeLine: L.Polyline | undefined = undefined;

    if (route && route.length > 1) {
      L.polyline(
        route.map((p) => [p.lat, p.lng] as [number, number]),
        { color: "#2563eb", weight: 4, opacity: 0.7, dashArray: "8 8" }
      ).addTo(map);
    } else if (mechanicLocation && customerLocation) {
      L.polyline(
        [
          [mechanicLocation.lat, mechanicLocation.lng],
          [customerLocation.lat, customerLocation.lng],
        ],
        { color: "#2563eb", weight: 4, opacity: 0.7, dashArray: "8 8" }
      ).addTo(map);
    }

    if (customerLocation) {
      L.marker([customerLocation.lat, customerLocation.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup("Your Location");
    }

    if (mechanicLocation) {
      L.marker([mechanicLocation.lat, mechanicLocation.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup("Mechanic");
    }

    if (markers) {
      markers.forEach((m) => {
        const icon =
          m.color === "green"
            ? greenIcon
            : m.color === "red"
            ? redIcon
            : m.color === "orange"
            ? orangeIcon
            : blueIcon;
        const marker = L.marker([m.pos.lat, m.pos.lng], { icon }).addTo(map);
        if (m.label) marker.bindPopup(m.label);
      });
    }

    // Fit bounds if multiple points
    const allPoints: [number, number][] = [];
    if (customerLocation) allPoints.push([customerLocation.lat, customerLocation.lng]);
    if (mechanicLocation) allPoints.push([mechanicLocation.lat, mechanicLocation.lng]);
    if (route) route.forEach((p) => allPoints.push([p.lat, p.lng]));
    if (markers) markers.forEach((m) => allPoints.push([m.pos.lat, m.pos.lng]));
    if (allPoints.length > 1) {
      map.fitBounds(L.latLngBounds(allPoints).pad(0.15));
    }

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    center?.lat,
    center?.lng,
    customerLocation?.lat,
    customerLocation?.lng,
    mechanicLocation?.lat,
    mechanicLocation?.lng,
    JSON.stringify(route),
    JSON.stringify(markers?.map((m) => m.pos)),
    zoom,
  ]);

  return (
    <div className="roadresq-map-shell" style={{ height, width: "100%" }}>
      <div id={mapId} className="roadresq-map" />
    </div>
  );
}
