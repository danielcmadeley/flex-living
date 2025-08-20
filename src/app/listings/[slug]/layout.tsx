import { Metadata } from "next";
import { notFound } from "next/navigation";
import { slugToListingName, isValidSlug } from "@/lib/utils/slugs";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listingName = slugToListingName(slug);

  // Fetch listing data for more accurate metadata
  let reviewCount = 0;
  let averageRating = 0;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/reviews/hostaway?status=published&listingName=${encodeURIComponent(listingName)}&includeStats=true`,
      { cache: "no-store" },
    );

    if (response.ok) {
      const data = await response.json();
      reviewCount = data.total || 0;
      averageRating = data.statistics?.overall || 0;
    }
  } catch (error) {
    console.error("Error fetching listing data for metadata:", error);
  }

  const title = `${listingName} - Guest Reviews | Flex Living`;
  const description = `Read ${reviewCount} verified guest reviews for ${listingName}, a premium London property by Flex Living. Average rating: ${averageRating}/10. Book with confidence.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_GB",
      siteName: "Flex Living",
      images: [
        {
          url: "/og-image.jpg", // You can add a default OG image
          width: 1200,
          height: 630,
          alt: `${listingName} - Flex Living Property`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `/listings/${slug}`,
    },
    keywords: [
      "London accommodation",
      "premium rental",
      "guest reviews",
      "verified property",
      "Flex Living",
      listingName,
      "short term rental",
      "serviced apartment",
    ],
    authors: [{ name: "Flex Living" }],
    category: "Travel & Accommodation",
    other: {
      "property:type": "rental",
      "property:location": "London, UK",
      "rating:value": averageRating.toString(),
      "rating:scale": "10",
      "review:count": reviewCount.toString(),
    },
  };
}

export default async function ListingLayout({ children, params }: Props) {
  // Validate slug format
  const { slug } = await params;
  if (!slug || slug.length === 0 || !isValidSlug(slug)) {
    notFound();
  }

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: slugToListingName(slug),
            description: `Premium London accommodation - ${slugToListingName(slug)}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: "London",
              addressCountry: "GB",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "51.5074",
              longitude: "-0.1278",
            },
            url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://flex-living.com"}/listings/${slug}`,
            telephone: "+44-XXX-XXX-XXXX", // Replace with actual phone
            priceRange: "£££",
            amenityFeature: [
              {
                "@type": "LocationFeatureSpecification",
                name: "WiFi",
                value: true,
              },
              {
                "@type": "LocationFeatureSpecification",
                name: "Kitchen",
                value: true,
              },
            ],
            hasMap: `https://maps.google.com/?q=London,UK`,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "9.0", // You can make this dynamic
              bestRating: "10",
              worstRating: "1",
              ratingCount: "50", // You can make this dynamic
            },
          }),
        }}
      />
      {children}
    </>
  );
}
