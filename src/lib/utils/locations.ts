interface PropertyLocation {
  name: string;
  placeId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  neighborhood?: string;
  city: string;
  country: string;
  description?: string;
}

// Property location database
export const PROPERTY_LOCATIONS: Record<string, PropertyLocation> = {
  "1B Central London Modern Flat": {
    name: "1B Central London Modern Flat",
    placeId: "ChIJB9OTMDIbdkgRp0JWbQGZsS8", // British Museum (for testing)
    address: "Great Russell St, Bloomsbury, London WC1B 3DG, UK",
    lat: 51.5194,
    lng: -0.1270,
    neighborhood: "Bloomsbury",
    city: "London",
    country: "United Kingdom",
    description: "Modern apartment in the heart of Central London, near the British Museum"
  },
  "Test Property": {
    name: "Test Property",
    placeId: "ChIJB9OTMDIbdkgRp0JWbQGZsS8",
    address: "Great Russell St, Bloomsbury, London WC1B 3DG, UK",
    lat: 51.5194,
    lng: -0.1270,
    neighborhood: "Bloomsbury",
    city: "London",
    country: "United Kingdom",
    description: "Test property for development"
  },
  "Flex Living - Central London": {
    name: "Flex Living - Central London",
    address: "Central London, UK",
    lat: 51.5074,
    lng: -0.1278,
    neighborhood: "Central London",
    city: "London",
    country: "United Kingdom",
    description: "Premium serviced apartment in Central London"
  },
  "Flex Living - Canary Wharf": {
    name: "Flex Living - Canary Wharf",
    address: "Canary Wharf, London E14, UK",
    lat: 51.5045,
    lng: -0.0199,
    neighborhood: "Canary Wharf",
    city: "London",
    country: "United Kingdom",
    description: "Modern apartment in London's financial district"
  },
  "Flex Living - King's Cross": {
    name: "Flex Living - King's Cross",
    address: "King's Cross, London N1C, UK",
    lat: 51.5308,
    lng: -0.1238,
    neighborhood: "King's Cross",
    city: "London",
    country: "United Kingdom",
    description: "Contemporary living space near King's Cross Station"
  },
  "Flex Living - Shoreditch": {
    name: "Flex Living - Shoreditch",
    address: "Shoreditch, London E1, UK",
    lat: 51.5246,
    lng: -0.0780,
    neighborhood: "Shoreditch",
    city: "London",
    country: "United Kingdom",
    description: "Trendy apartment in the vibrant Shoreditch area"
  },
  "Flex Living - Borough": {
    name: "Flex Living - Borough",
    address: "Borough, London SE1, UK",
    lat: 51.5017,
    lng: -0.0877,
    neighborhood: "Borough",
    city: "London",
    country: "United Kingdom",
    description: "Stylish accommodation near Borough Market"
  },
  "Flex Living - Paddington": {
    name: "Flex Living - Paddington",
    address: "Paddington, London W2, UK",
    lat: 51.5156,
    lng: -0.1755,
    neighborhood: "Paddington",
    city: "London",
    country: "United Kingdom",
    description: "Convenient location near Paddington Station"
  }
};

/**
 * Get location data for a property by name
 */
export function getPropertyLocation(propertyName: string): PropertyLocation | null {
  return PROPERTY_LOCATIONS[propertyName] || null;
}

/**
 * Get all available property locations
 */
export function getAllPropertyLocations(): PropertyLocation[] {
  return Object.values(PROPERTY_LOCATIONS);
}

/**
 * Find properties near a given coordinate
 */
export function findNearbyProperties(
  lat: number,
  lng: number,
  radiusKm: number = 5
): PropertyLocation[] {
  const properties = getAllPropertyLocations();

  return properties.filter(property => {
    if (!property.lat || !property.lng) return false;

    const distance = calculateDistance(lat, lng, property.lat, property.lng);
    return distance <= radiusKm;
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get the center point of all properties for overview maps
 */
export function getPropertiesCenter(): { lat: number; lng: number } {
  const properties = getAllPropertyLocations().filter(p => p.lat && p.lng);

  if (properties.length === 0) {
    // Default to Central London
    return { lat: 51.5074, lng: -0.1278 };
  }

  const totalLat = properties.reduce((sum, p) => sum + (p.lat || 0), 0);
  const totalLng = properties.reduce((sum, p) => sum + (p.lng || 0), 0);

  return {
    lat: totalLat / properties.length,
    lng: totalLng / properties.length
  };
}

/**
 * Get bounds for all properties (useful for fitting map view)
 */
export function getPropertiesBounds(): {
  north: number;
  south: number;
  east: number;
  west: number;
} | null {
  const properties = getAllPropertyLocations().filter(p => p.lat && p.lng);

  if (properties.length === 0) return null;

  const lats = properties.map(p => p.lat!);
  const lngs = properties.map(p => p.lng!);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };
}

/**
 * Format address for display
 */
export function formatAddress(location: PropertyLocation): string {
  const parts = [
    location.neighborhood,
    location.city,
    location.country
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Get Google Maps URL for directions
 */
export function getDirectionsUrl(location: PropertyLocation): string {
  if (location.placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${location.placeId}`;
  }

  if (location.lat && location.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
  }

  if (location.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(location.name)}`;
}

/**
 * Add or update a property location
 */
export function addPropertyLocation(location: PropertyLocation): void {
  PROPERTY_LOCATIONS[location.name] = location;
}

/**
 * Search properties by name, neighborhood, or city
 */
export function searchProperties(query: string): PropertyLocation[] {
  const searchTerm = query.toLowerCase();

  return getAllPropertyLocations().filter(property =>
    property.name.toLowerCase().includes(searchTerm) ||
    property.neighborhood?.toLowerCase().includes(searchTerm) ||
    property.city.toLowerCase().includes(searchTerm) ||
    property.address?.toLowerCase().includes(searchTerm)
  );
}
