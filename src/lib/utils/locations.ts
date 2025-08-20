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
  "Art Deco Apartment Marylebone": {
    name: "Art Deco Apartment Marylebone",
    placeId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
    address: "Marylebone, London W1U, UK",
    lat: 51.5206,
    lng: -0.1517,
    neighborhood: "Marylebone",
    city: "London",
    country: "United Kingdom",
    description:
      "Elegant Art Deco apartment in prestigious Marylebone, close to Baker Street and Regent's Park",
  },
  "1B Central London Modern Flat": {
    name: "1B Central London Modern Flat",
    placeId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
    address: "Great Russell St, Bloomsbury, London WC1B 3DG, UK",
    lat: 51.5194,
    lng: -0.127,
    neighborhood: "Bloomsbury",
    city: "London",
    country: "United Kingdom",
    description:
      "Modern apartment in the heart of Central London, near the British Museum",
  },
  "Modern Studio Covent Garden": {
    name: "Modern Studio Covent Garden",
    address: "Covent Garden, London WC2E, UK",
    lat: 51.5117,
    lng: -0.1239,
    neighborhood: "Covent Garden",
    city: "London",
    country: "United Kingdom",
    description: "Stylish studio in the heart of London's theatre district",
  },
  "Luxury Penthouse South Bank": {
    name: "Luxury Penthouse South Bank",
    address: "South Bank, London SE1, UK",
    lat: 51.5074,
    lng: -0.1041,
    neighborhood: "South Bank",
    city: "London",
    country: "United Kingdom",
    description:
      "Spectacular penthouse with panoramic views of the Thames and London Eye",
  },
  "Victorian Townhouse Chelsea": {
    name: "Victorian Townhouse Chelsea",
    address: "Chelsea, London SW3, UK",
    lat: 51.4867,
    lng: -0.1669,
    neighborhood: "Chelsea",
    city: "London",
    country: "United Kingdom",
    description:
      "Beautifully restored Victorian townhouse in exclusive Chelsea",
  },
  "Contemporary Loft Shoreditch": {
    name: "Contemporary Loft Shoreditch",
    address: "Shoreditch, London E1, UK",
    lat: 51.5255,
    lng: -0.0775,
    neighborhood: "Shoreditch",
    city: "London",
    country: "United Kingdom",
    description:
      "Industrial-chic loft in trendy Shoreditch, perfect for creative professionals",
  },
};

/**
 * Get location data for a property by name
 */
export function getPropertyLocation(
  propertyName: string,
): PropertyLocation | null {
  return PROPERTY_LOCATIONS[propertyName] || null;
}

/**
 * Get all available property locations
 */
export function getAllPropertyLocations(): PropertyLocation[] {
  return Object.values(PROPERTY_LOCATIONS);
}
