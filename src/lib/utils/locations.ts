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
    placeId: "ChIJq5yh0c0adkgRCm9nHY2cX8s",
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
    placeId: "ChIJDev6pOgadkgRO6AJgRnNzeo",
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
    placeId: "ChIJb-IaobtYdkgRjHvMKAPr8KU",
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
    placeId: "ChIJhTIcx-cEdkgR9VZqBKZ-pQQ",
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
    placeId: "ChIJ_5KZBugFdkgRZjMYCxu0Fzk",
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
    placeId: "ChIJayKNE4QbdkgRs2JHqaVk_tY",
    address: "Shoreditch, London E1, UK",
    lat: 51.5255,
    lng: -0.0775,
    neighborhood: "Shoreditch",
    city: "London",
    country: "United Kingdom",
    description:
      "Industrial-chic loft in trendy Shoreditch, perfect for creative professionals",
  },
  "Elegant Flat Kensington": {
    name: "Elegant Flat Kensington",
    placeId: "ChIJ7bBJZGkFdkgRBNGxFhh9Jvg",
    address: "Kensington, London SW7, UK",
    lat: 51.4994,
    lng: -0.1746,
    neighborhood: "Kensington",
    city: "London",
    country: "United Kingdom",
    description:
      "Elegant apartment in prestigious Kensington, near Hyde Park and museums",
  },
  "Historic Townhouse Greenwich": {
    name: "Historic Townhouse Greenwich",
    placeId: "ChIJrxNRX7C32EcRBny7BjC-IBE",
    address: "Greenwich, London SE10, UK",
    lat: 51.4834,
    lng: -0.0064,
    neighborhood: "Greenwich",
    city: "London",
    country: "United Kingdom",
    description:
      "Historic townhouse in Maritime Greenwich, near the Royal Observatory",
  },
  "Modern Apartment Canary Wharf": {
    name: "Modern Apartment Canary Wharf",
    placeId: "ChIJjzus4NK02EcROzXzHUVlPRQ",
    address: "Canary Wharf, London E14, UK",
    lat: 51.5054,
    lng: -0.0235,
    neighborhood: "Canary Wharf",
    city: "London",
    country: "United Kingdom",
    description:
      "Ultra-modern apartment in London's financial district with river views",
  },
  "Charming Studio Camden": {
    name: "Charming Studio Camden",
    placeId: "ChIJ_zZBvlgbdkgRgcGUuYQSIBQ",
    address: "Camden, London NW1, UK",
    lat: 51.5392,
    lng: -0.1426,
    neighborhood: "Camden",
    city: "London",
    country: "United Kingdom",
    description:
      "Quirky studio in vibrant Camden, perfect for music and culture lovers",
  },
  "Luxury Penthouse Notting Hill": {
    name: "Luxury Penthouse Notting Hill",
    placeId: "ChIJdd7HRPQ2dkgRuxd5MJaX5BI",
    address: "Notting Hill, London W11, UK",
    lat: 51.5156,
    lng: -0.2019,
    neighborhood: "Notting Hill",
    city: "London",
    country: "United Kingdom",
    description:
      "Stunning penthouse in fashionable Notting Hill, near Portobello Market",
  },
  "Garden Flat Hampstead": {
    name: "Garden Flat Hampstead",
    placeId: "ChIJvRKrsd8bdkgReMQ2SL_x0Vw",
    address: "Hampstead, London NW3, UK",
    lat: 51.5555,
    lng: -0.1779,
    neighborhood: "Hampstead",
    city: "London",
    country: "United Kingdom",
    description:
      "Peaceful garden flat near Hampstead Heath, perfect for nature lovers",
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
