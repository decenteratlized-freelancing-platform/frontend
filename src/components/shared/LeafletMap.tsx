"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon not showing
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface LeafletMapProps {
    lat: number;
    lon: number;
    zoom?: number;
    popupText?: string;
}

function MapUpdater({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lon], zoom);
    }, [lat, lon, zoom, map]);
    return null;
}

export default function LeafletMap({ lat, lon, zoom = 13, popupText }: LeafletMapProps) {
    // Ensure valid coordinates
    if (!lat || !lon) return null;

    return (
        <div className="h-full w-full rounded-lg overflow-hidden z-0">
            <MapContainer
                center={[lat, lon]}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lon]} icon={icon}>
                    {popupText && <Popup>{popupText}</Popup>}
                </Marker>
                <MapUpdater lat={lat} lon={lon} zoom={zoom} />
            </MapContainer>
        </div>
    );
}
