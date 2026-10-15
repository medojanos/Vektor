import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Map({coordinates, stops}) {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!coordinates?.length) return;

    const map = L.map(mapContainer.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const route = L.polyline(coordinates, {
      color: "#4285F4",
      weight: 5,
      opacity: 0.9,
    }).addTo(map);

    
    stops.forEach((stop, index) => {
      const { lat, lon } = stop.location.coordinates;

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`${index + 1}. ${stop.location.city}`);
    });
    

    map.fitBounds(route.getBounds(), {
      padding: [30, 30],
    });

    return () => {
      map.remove();
    };
  }, [coordinates, stops]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "600px",
      }}
    />
  );
}