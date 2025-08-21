"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, AlertCircle } from "lucide-react";
import { getPropertyLocation } from "@/lib/utils/locations";

interface GoogleMapProps {
  placeId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  height?: string;
  className?: string;
  showDirectionsLink?: boolean;
  propertyName?: string;
}

declare global {
  interface Window {
    google: any; // Google Maps API has complex typing
    initGoogleMaps?: () => void;
  }
}

export function GoogleMap({
  placeId,
  address,
  lat,
  lng,
  zoom = 15,
  height = "400px",
  className = "",
  showDirectionsLink = true,
  propertyName,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps API
  useEffect(() => {
    if (!apiKey) {
      console.warn(
        "Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.",
      );
      setError("Google Maps API key is not configured");
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );

    if (window.google && window.google.maps && window.google.maps.Map) {
      setIsLoaded(true);
      return;
    }

    if (existingScript) {
      // Script exists but maps not loaded yet, wait for it
      existingScript.addEventListener("load", () => {
        setIsLoaded(true);
      });
      return;
    }

    // Create callback function with unique name
    const callbackName = `initGoogleMaps_${Date.now()}`;
    (window as any)[callbackName] = () => {
      setIsLoaded(true);
      delete (window as any)[callbackName];
    };

    // Load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError(
        "Failed to load Google Maps. Please check your API key and ensure Maps JavaScript API is enabled.",
      );
      delete (window as any)[callbackName];
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on cleanup as other components might be using it
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
    };
  }, [apiKey]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    const initializeMap = async () => {
      try {
        let coordinates: { lat: number; lng: number } | null = null;
        let resolvedAddress = address;

        // If we have direct coordinates, use them
        if (lat && lng) {
          coordinates = { lat, lng };
        }
        // If we have a place ID, use Places service to get details
        else if (placeId) {
          const service = new window.google.maps.places.PlacesService(
            document.createElement("div"),
          );

          const request = {
            placeId: placeId,
            fields: ["geometry", "formatted_address", "name"],
          };

          service.getDetails(request, (place: any, status: string) => {
            // Google Maps callback
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              place
            ) {
              coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              resolvedAddress = place.formatted_address || place.name;
              setLocationData({
                lat: coordinates.lat,
                lng: coordinates.lng,
                address: resolvedAddress,
              });
              createMap(coordinates, resolvedAddress);
            } else {
              setError("Could not load location from Place ID");
            }
          });
          return;
        }
        // If we have an address, geocode it
        else if (address) {
          const geocoder = new window.google.maps.Geocoder();

          geocoder.geocode({ address }, (results: any[], status: string) => {
            // Google Maps callback
            if (status === "OK" && results[0]) {
              coordinates = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              };
              resolvedAddress = results[0].formatted_address;
              setLocationData({
                lat: coordinates.lat,
                lng: coordinates.lng,
                address: resolvedAddress,
              });
              createMap(coordinates, resolvedAddress);
            } else {
              setError("Could not find location from address");
            }
          });
          return;
        }

        if (coordinates) {
          setLocationData({
            lat: coordinates.lat,
            lng: coordinates.lng,
            address: resolvedAddress,
          });
          createMap(coordinates, resolvedAddress);
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize map",
        );
      }
    };

    const createMap = (coords: { lat: number; lng: number }, addr?: string) => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add marker
      const marker = new window.google.maps.Marker({
        position: coords,
        map: map,
        title: propertyName || addr || "Property Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3B82F6",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });

      // Add info window
      if (propertyName || addr) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">
                ${propertyName || "Property Location"}
              </h3>
              ${addr ? `<p style="margin: 0; font-size: 12px; color: #666;">${addr}</p>` : ""}
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }
    };

    initializeMap();
  }, [isLoaded, placeId, address, lat, lng, zoom, propertyName]);

  const getDirectionsUrl = () => {
    if (!locationData) return "#";

    if (placeId) {
      return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
  };

  if (!apiKey) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6 max-w-md">
          <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Map Configuration Required
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Google Maps API key is missing. Please configure
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
          </p>
          {(address || propertyName) && (
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <MapPin className="h-4 w-4 text-gray-500 inline-block mr-2" />
              <span className="text-sm text-gray-700">
                {propertyName || address}
              </span>
            </div>
          )}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-amber-50 rounded-md">
              <p className="text-xs text-amber-800">
                Developer: Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Map
          </h3>
          <p className="text-sm text-gray-600 mb-2">{error}</p>
          {(address || propertyName) && (
            <div className="mt-4 bg-white p-3 rounded-md border border-gray-200">
              <MapPin className="h-4 w-4 text-gray-500 inline-block mr-2" />
              <span className="text-sm text-gray-700">
                {propertyName || address}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-50 rounded-lg animate-pulse ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Loading map...</p>
          {(address || propertyName) && (
            <p className="text-xs text-gray-500 mt-2">
              {propertyName || address}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="rounded-lg"
      />

      {showDirectionsLink && locationData && (
        <div className="absolute bottom-4 right-4">
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Directions
          </a>
        </div>
      )}

      {locationData?.address && (
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-700 max-w-[200px] truncate">
              {locationData.address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Higher-order component for property-specific maps
export function PropertyMap({
  propertyName,
  ...props
}: Omit<GoogleMapProps, "placeId"> & { propertyName: string }) {
  // Import this at the top of the file: import { getPropertyLocation } from "@/lib/utils/locations";
  const location = getPropertyLocation(propertyName);

  // Fallback Place ID for demo/testing purposes (London, UK)
  const FALLBACK_PLACE_ID = "ChIJdd4hrwug2EcRmSrV3Vo6llI";

  // If we have a location from the database, use it
  if (location) {
    // Use coordinates if available, otherwise use placeId, otherwise use address
    if (location.lat && location.lng) {
      return (
        <GoogleMap
          lat={location.lat}
          lng={location.lng}
          address={location.address}
          propertyName={propertyName}
          {...props}
        />
      );
    }

    if (location.placeId) {
      return (
        <GoogleMap
          placeId={location.placeId}
          address={location.address}
          propertyName={propertyName}
          {...props}
        />
      );
    }

    if (location.address) {
      return (
        <GoogleMap
          address={location.address}
          propertyName={propertyName}
          {...props}
        />
      );
    }
  }

  // Fallback: Use the fixed Place ID for any property not in the database
  return (
    <GoogleMap
      placeId={FALLBACK_PLACE_ID}
      address="London, UK"
      propertyName={propertyName}
      {...props}
    />
  );
}

// Multi-property overview map
interface MultiPropertyMapProps {
  properties: Array<{
    name: string;
    lat?: number;
    lng?: number;
    placeId?: string;
    address?: string;
    isSelected?: boolean;
    isVisible?: boolean;
  }>;
  height?: string;
  className?: string;
  onPropertyClick?: (propertyName: string) => void;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  selectedProperty?: string | null;
  mapInstanceRef?: React.MutableRefObject<any>;
}

export function MultiPropertyMap({
  properties,
  height = "500px",
  className = "",
  onPropertyClick,
  onBoundsChange,
  selectedProperty,
  mapInstanceRef,
}: MultiPropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const localMapRef = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps API
  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key is not configured");
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );

    if (window.google && window.google.maps && window.google.maps.Map) {
      setIsLoaded(true);
      return;
    }

    if (existingScript) {
      // Script exists but maps not loaded yet, wait for it
      existingScript.addEventListener("load", () => {
        setIsLoaded(true);
      });
      return;
    }

    // Create callback function with unique name
    const callbackName = `initMultiMap_${Date.now()}`;
    (window as any)[callbackName] = () => {
      setIsLoaded(true);
      delete (window as any)[callbackName];
    };

    // Load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError("Failed to load Google Maps. Please check your API key.");
      delete (window as any)[callbackName];
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on cleanup as other components might be using it
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
      }
    };
  }, [apiKey]);

  // Initialize map only once when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google || mapInitialized)
      return;

    const initializeMap = async () => {
      // Ensure DOM element is ready
      if (!mapRef.current) {
        console.warn("Map container not found");
        return;
      }

      try {
        // Calculate bounds for all properties
        const bounds = new window.google.maps.LatLngBounds();
        const validProperties = properties.filter((p) => p.lat && p.lng);

        // Default center (London) - always show map even with no properties
        const center = { lat: 51.5074, lng: -0.1278 };

        // Add small delay to ensure DOM is fully ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!mapRef.current) {
          console.warn("Map container removed during initialization");
          return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Store map instance reference
        localMapRef.current = map;
        if (mapInstanceRef) {
          mapInstanceRef.current = map;
        }

        // Add bounds change listener with throttling (only once during initialization)
        if (onBoundsChange) {
          let boundsTimeout: NodeJS.Timeout;
          map.addListener("bounds_changed", () => {
            clearTimeout(boundsTimeout);
            boundsTimeout = setTimeout(() => {
              const bounds = map.getBounds();
              if (bounds) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                onBoundsChange({
                  north: ne.lat(),
                  south: sw.lat(),
                  east: ne.lng(),
                  west: sw.lng(),
                });
              }
            }, 500); // Throttle bounds changes
          });
        }

        // Fit map to show all properties if we have valid ones
        if (validProperties.length > 1) {
          validProperties.forEach((property) => {
            const position = { lat: property.lat!, lng: property.lng! };
            bounds.extend(position);
          });
          map.fitBounds(bounds);

          // Set a maximum zoom level
          const listener = window.google.maps.event.addListener(
            map,
            "idle",
            () => {
              if (map.getZoom() > 15) map.setZoom(15);
              window.google.maps.event.removeListener(listener);
            },
          );
        } else if (validProperties.length === 1) {
          map.setCenter({
            lat: validProperties[0].lat!,
            lng: validProperties[0].lng!,
          });
          map.setZoom(15);
        }

        setMapInitialized(true);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map. Please refresh the page.");
      }
    };

    // Initialize if we have a DOM element (regardless of properties count)
    if (mapRef.current) {
      initializeMap();
    }
  }, [isLoaded]);

  // Update markers when properties change
  useEffect(() => {
    if (
      !mapInitialized ||
      !localMapRef.current ||
      !window.google ||
      properties.length === 0
    ) {
      return;
    }

    // Clear existing markers and info windows
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // Set up window callback for property selection (navigate to property page)
    (window as any).selectProperty = (propertyName: string) => {
      if (onPropertyClick) {
        onPropertyClick(propertyName);
      }
    };

    const validProperties = properties.filter((p) => p.lat && p.lng);

    // Add new markers
    validProperties.forEach((property, index) => {
      const position = { lat: property.lat!, lng: property.lng! };
      const isSelected = selectedProperty === property.name;
      const isVisible = property.isVisible !== false;

      const marker = new window.google.maps.Marker({
        position: position,
        map: localMapRef.current,
        title: property.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 10,
          fillColor: isSelected ? "#EF4444" : isVisible ? "#3B82F6" : "#9CA3AF",
          fillOpacity: isVisible ? 1 : 0.5,
          strokeColor: "#FFFFFF",
          strokeWeight: isSelected ? 4 : 3,
        },
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontSize: isSelected ? "13px" : "12px",
          fontWeight: "bold",
        },
      });

      // Store marker reference
      markersRef.current.push(marker);

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px; color: #1f2937;">
              ${property.name}
            </h3>
            ${property.address ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">${property.address}</p>` : ""}
            <button
              onclick="window.selectProperty('${property.name}')"
              style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; width: 100%;"
            >
              View Reviews
            </button>
          </div>
        `,
      });

      // Store info window reference
      infoWindowsRef.current.push(infoWindow);

      // Marker click shows popup
      marker.addListener("click", () => {
        // Close all other info windows
        infoWindowsRef.current.forEach((iw) => {
          if (iw !== infoWindow) {
            iw.close();
          }
        });

        // Open this info window
        infoWindow.open(localMapRef.current, marker);
      });
    });

    // Cleanup function
    return () => {
      if ((window as any).selectProperty) {
        delete (window as any).selectProperty;
      }
    };
  }, [mapInitialized, properties, selectedProperty, onPropertyClick]);

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Google Maps API key not configured
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg animate-pulse ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="rounded-lg"
      />

      <div className="absolute top-4 left-4">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-700">
            {properties.length} Properties
          </p>
        </div>
      </div>
    </div>
  );
}

// Declare global functions for TypeScript
declare global {
  interface Window {
    selectProperty?: (propertyName: string) => void;
  }
}
