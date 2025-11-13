"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom icons for different asset types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const vehicleIcon = createCustomIcon("#3B82F6"); // Blue for vehicles
const weaponIcon = createCustomIcon("#EF4444"); // Red for weapons
const otherIcon = createCustomIcon("#6B7280"); // Gray for other assets

const getIconByAssetType = (assetType: string) => {
  if (
    assetType.toLowerCase().includes("vehicle") ||
    assetType.toLowerCase().includes("car")
  ) {
    return vehicleIcon;
  } else if (
    assetType.toLowerCase().includes("rifle") ||
    assetType.toLowerCase().includes("weapon")
  ) {
    return weaponIcon;
  } else {
    return otherIcon;
  }
};

const getColorByAssetType = (
  assetType: string,
): "blue" | "destructive" | "secondary" => {
  if (
    assetType.toLowerCase().includes("vehicle") ||
    assetType.toLowerCase().includes("car")
  ) {
    return "blue";
  } else if (
    assetType.toLowerCase().includes("rifle") ||
    assetType.toLowerCase().includes("weapon")
  ) {
    return "destructive";
  } else {
    return "secondary";
  }
};

interface AssetMapProps {}

export default function MapClient({}: AssetMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const { data: assets, isLoading, error } = api.asset.getAll.useQuery();

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading map...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading assets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">
          Error loading assets: {error.message}
        </div>
      </div>
    );
  }

  // Filter assets that have location data
  const assetsWithLocation =
    assets?.filter((asset) => asset.location && asset.location.length === 2) ??
    [];

  // Default center - Riyadh, Saudi Arabia
  const defaultCenter: [number, number] = [24.7136, 46.6753]; // Riyadh city center
  const defaultZoom = 11;

  return (
    <div className="relative h-full w-full">
      {/* Legend */}
      <Card className="absolute top-4 left-4 z-[1000] w-64">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Asset Map Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow"></div>
            <span className="text-sm">Vehicles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow"></div>
            <span className="text-sm">Weapons</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-white bg-gray-500 shadow"></div>
            <span className="text-sm">Other Assets</span>
          </div>
          <div className="text-muted-foreground pt-2 text-xs">
            Total assets with location: {assetsWithLocation.length}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {assetsWithLocation.map((asset) => {
          const [lat, lng] = asset.location as [number, number];
          return (
            <Marker
              key={asset.id}
              position={[lat, lng]}
              icon={getIconByAssetType(asset.assetType)}
            >
              <Popup>
                <div className="space-y-2 p-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Asset #{asset.id}</h3>
                    <Badge variant={getColorByAssetType(asset.assetType)}>
                      {asset.assetType}
                    </Badge>
                  </div>

                  {asset.model && (
                    <div className="text-sm">
                      <span className="font-medium">Model:</span> {asset.model}
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <Badge
                      variant={
                        asset.status === "Operational"
                          ? "default"
                          : asset.status === "In Maintenance"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {asset.status}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Sector:</span> {asset.sector}
                  </div>

                  {asset.currentKm && (
                    <div className="text-sm">
                      <span className="font-medium">Current KM:</span>{" "}
                      {asset.currentKm.toLocaleString()}
                    </div>
                  )}

                  {asset.lastServiceAt && (
                    <div className="text-sm">
                      <span className="font-medium">Last Service:</span>{" "}
                      {new Date(asset.lastServiceAt).toLocaleDateString()}
                    </div>
                  )}

                  <div className="text-muted-foreground pt-1 text-xs">
                    Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
