"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GoogleMap,
  PropertyMap,
  MultiPropertyMap,
} from "@/components/ui/google-map";
import {
  getAllPropertyLocations,
  getPropertyLocation,
} from "@/lib/utils/locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Building,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function TestMapsPage() {
  const [selectedProperty, setSelectedProperty] = useState(
    "1B Central London Modern Flat",
  );
  const [customAddress, setCustomAddress] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");

  const properties = getAllPropertyLocations();
  const selectedLocation = getPropertyLocation(selectedProperty);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Google Maps Integration Test
              </h1>
              <p className="text-gray-600">
                Test and verify Google Maps functionality across all components
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/listings"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
              >
                ← Back to Listings
              </Link>
              <Link
                href="/test-integration"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Integration Tests
              </Link>
            </div>
          </div>
        </div>

        {/* API Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Google Maps API Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <h3 className="font-medium">API Key</h3>
                  <p className="text-sm text-gray-600">
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                      ? "Configured"
                      : "Missing"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Components</h3>
                  <p className="text-sm text-gray-600">Loaded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Properties</h3>
                  <p className="text-sm text-gray-600">
                    {properties.length} Configured
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Property Overview Map */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Multi-Property Overview Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <MultiPropertyMap
                  properties={properties.map((location) => ({
                    name: location.name,
                    lat: location.lat,
                    lng: location.lng,
                    placeId: location.placeId,
                    address: location.address,
                  }))}
                  height="400px"
                  className="rounded-lg border"
                  onPropertyClick={(propertyName) => {
                    setSelectedProperty(propertyName);
                  }}
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Available Properties</h3>
                  <div className="space-y-2">
                    {properties.map((property, index) => (
                      <button
                        key={property.name}
                        onClick={() => setSelectedProperty(property.name)}
                        className={`w-full text-left p-2 rounded text-sm transition-colors ${
                          selectedProperty === property.name
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "bg-white hover:bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{property.name}</div>
                            <div className="text-xs text-gray-500">
                              {property.neighborhood}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Property Map */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Individual Property Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Property:
              </label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {properties.map((property) => (
                  <option key={property.name} value={property.name}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PropertyMap
                  propertyName={selectedProperty}
                  height="400px"
                  className="rounded-lg border"
                  showDirectionsLink={true}
                />
              </div>
              <div className="space-y-4">
                {selectedLocation && (
                  <div className="bg-white p-4 rounded border">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Property Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Name:</strong> {selectedLocation.name}
                      </div>
                      <div>
                        <strong>City:</strong> {selectedLocation.city}
                      </div>
                      {selectedLocation.neighborhood && (
                        <div>
                          <strong>Area:</strong> {selectedLocation.neighborhood}
                        </div>
                      )}
                      {selectedLocation.placeId && (
                        <div>
                          <strong>Place ID:</strong>{" "}
                          <code className="text-xs bg-gray-100 px-1 rounded">
                            {selectedLocation.placeId}
                          </code>
                        </div>
                      )}
                      {selectedLocation.lat && selectedLocation.lng && (
                        <div>
                          <strong>Coordinates:</strong>{" "}
                          {selectedLocation.lat.toFixed(4)},{" "}
                          {selectedLocation.lng.toFixed(4)}
                        </div>
                      )}
                      {selectedLocation.description && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          {selectedLocation.description}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Location Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Custom Location Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address:
                </label>
                <Input
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g., London Eye, London, UK"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude:
                </label>
                <Input
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="e.g., 51.5033"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude:
                </label>
                <Input
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="e.g., -0.1195"
                />
              </div>
            </div>

            {(customAddress || (customLat && customLng)) && (
              <div className="mt-4">
                <GoogleMap
                  address={customAddress || undefined}
                  lat={customLat ? parseFloat(customLat) : undefined}
                  lng={customLng ? parseFloat(customLng) : undefined}
                  height="300px"
                  className="rounded-lg border"
                  propertyName="Custom Location"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">1. API Configuration</h3>
                <p className="text-gray-600 mb-2">
                  Ensure your Google Maps API key is properly configured in your
                  environment variables:
                </p>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
                </pre>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Required APIs</h3>
                <div className="text-gray-600 space-y-1">
                  <div>• Maps JavaScript API</div>
                  <div>• Places API</div>
                  <div>• Geocoding API</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Test Scenarios</h3>
                <div className="text-gray-600 space-y-1">
                  <div>• Multi-property map shows all locations</div>
                  <div>• Individual property maps load correctly</div>
                  <div>• Clicking map markers shows info windows</div>
                  <div>• Directions links work properly</div>
                  <div>• Custom locations can be geocoded</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">4. Integration Points</h3>
                <div className="text-gray-600 space-y-1">
                  <div>• Listings page shows property overview map</div>
                  <div>• Individual listing pages show property location</div>
                  <div>• Maps integrate with existing review system</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
