export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  isMain?: boolean;
}

interface PropertyImageSet {
  main: PropertyImage;
  gallery: PropertyImage[];
}

// Image categories for different property types
const IMAGE_CATEGORIES = {
  apartment: [
    "apartment",
    "modern-interior",
    "living-room",
    "bedroom",
    "kitchen",
  ],
  penthouse: [
    "penthouse",
    "luxury-interior",
    "city-view",
    "rooftop",
    "modern-living",
  ],
  townhouse: [
    "townhouse",
    "traditional-interior",
    "garden",
    "facade",
    "cozy-interior",
  ],
  studio: [
    "studio-apartment",
    "compact-living",
    "modern-design",
    "minimalist",
    "urban-living",
  ],
  loft: [
    "loft",
    "industrial-interior",
    "exposed-brick",
    "high-ceilings",
    "modern-loft",
  ],
  flat: [
    "flat",
    "contemporary-interior",
    "comfortable-living",
    "urban-apartment",
    "stylish-interior",
  ],
};

/**
 * Determines property type from property name
 */
function getPropertyType(propertyName: string): keyof typeof IMAGE_CATEGORIES {
  const name = propertyName.toLowerCase();

  if (name.includes("penthouse")) return "penthouse";
  if (name.includes("townhouse")) return "townhouse";
  if (name.includes("studio")) return "studio";
  if (name.includes("loft")) return "loft";
  if (name.includes("flat")) return "flat";

  return "apartment"; // default
}

/**
 * Gets neighborhood from property name
 */

/**
 * Generates a consistent seed for a property to ensure same images every time
 */
function generateSeed(propertyName: string, imageIndex: number): number {
  let hash = 0;
  const str = `${propertyName}-${imageIndex}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates dummy images using Unsplash API for a property
 */
export function generatePropertyImages(propertyName: string): PropertyImageSet {
  const propertyType = getPropertyType(propertyName);

  const categories = IMAGE_CATEGORIES[propertyType];

  // Generate main image
  const mainSeed = generateSeed(propertyName, 0);

  const main: PropertyImage = {
    id: `${propertyName}-main`,
    url: `https://picsum.photos/seed/${mainSeed}/800/600`,
    alt: `Main view of ${propertyName}`,
    width: 800,
    height: 600,
    isMain: true,
  };

  // Generate gallery images (9 additional images)
  const gallery: PropertyImage[] = [];

  for (let i = 1; i <= 9; i++) {
    const seed = generateSeed(propertyName, i);
    const category = categories[(i - 1) % categories.length];

    // Vary image dimensions for visual interest
    let width = 800;
    let height = 600;

    // Some images are landscape, some portrait, some square
    if (i % 3 === 1) {
      width = 600;
      height = 800; // portrait
    } else if (i % 3 === 2) {
      width = 600;
      height = 600; // square
    }

    gallery.push({
      id: `${propertyName}-${i}`,
      url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
      alt: `${propertyName} - ${category.replace("-", " ")} view`,
      width,
      height,
    });
  }

  return { main, gallery };
}

/**
 * Gets all images for a property (main + gallery)
 */
export function getAllPropertyImages(propertyName: string): PropertyImage[] {
  const { main, gallery } = generatePropertyImages(propertyName);
  return [main, ...gallery];
}

/**
 * Gets just the main image for a property
 */
export function getMainPropertyImage(propertyName: string): PropertyImage {
  const { main } = generatePropertyImages(propertyName);
  return main;
}

/**
 * Gets gallery images only (excluding main)
 */
export function getPropertyGallery(propertyName: string): PropertyImage[] {
  const { gallery } = generatePropertyImages(propertyName);
  return gallery;
}

/**
 * Image component props for easier integration
 */
export interface ImageComponentProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}

/**
 * Converts PropertyImage to props for Next.js Image component
 */
export function imageToProps(
  image: PropertyImage,
  options: {
    className?: string;
    priority?: boolean;
    loading?: "lazy" | "eager";
  } = {},
): ImageComponentProps {
  return {
    src: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height,
    className: options.className,
    priority: options.priority,
    loading: options.loading,
  };
}

// Cache for generated images to ensure consistency
const imageCache = new Map<string, PropertyImageSet>();

/**
 * Gets cached property images or generates new ones
 */
export function getCachedPropertyImages(
  propertyName: string,
): PropertyImageSet {
  if (imageCache.has(propertyName)) {
    return imageCache.get(propertyName)!;
  }

  const images = generatePropertyImages(propertyName);
  imageCache.set(propertyName, images);
  return images;
}
