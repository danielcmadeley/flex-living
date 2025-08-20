import { Metadata } from "next";
import { notFound } from "next/navigation";
import { slugToListingName, isValidSlug } from "@/lib/utils/slugs";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

interface ListingData {
  reviewCount: number;
  averageRating: number;
  googleReviewCount: number;
  googleAverageRating: number;
  listingName: string;
}

async function fetchListingData(listingName: string): Promise<ListingData> {
  let reviewCount = 0;
  let averageRating = 0;
  let googleReviewCount = 0;
  let googleAverageRating = 0;
  let hostawayData: {
    reviews: unknown[];
    stats: { averageRating: number; reviewCount: number };
    total?: number;
    statistics?: { overall: number };
  } | null = null;

  try {
    // Fetch Hostaway reviews
    const hostawayResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/reviews/hostaway?status=published&listingName=${encodeURIComponent(listingName)}&includeStats=true`,
      { cache: "no-store" },
    );

    if (hostawayResponse.ok) {
      hostawayData = await hostawayResponse.json();
      reviewCount =
        hostawayData?.total || hostawayData?.stats?.reviewCount || 0;
      averageRating =
        hostawayData?.statistics?.overall ||
        hostawayData?.stats?.averageRating ||
        0;
    }

    // Fetch Google reviews
    try {
      const googleResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/reviews/google?propertyName=${encodeURIComponent(listingName)}`,
        { cache: "no-store" },
      );

      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        googleReviewCount = googleData.reviews?.length || 0;
        googleAverageRating = googleData.averageRating || 0;

        // Combine totals
        reviewCount += googleReviewCount;

        // Calculate combined average rating (convert Google 1-5 to 1-10 scale)
        if (averageRating > 0 && googleAverageRating > 0) {
          const hostawayTotal =
            (hostawayData?.total || hostawayData?.stats?.reviewCount || 0) *
            averageRating;
          const googleTotal = googleReviewCount * (googleAverageRating * 2); // Convert to 1-10 scale
          const combinedTotal = hostawayTotal + googleTotal;
          averageRating = combinedTotal / reviewCount;
        } else if (googleAverageRating > 0 && averageRating === 0) {
          averageRating = googleAverageRating * 2; // Convert to 1-10 scale
        }
      }
    } catch (googleError) {
      console.error("Error fetching Google reviews for metadata:", googleError);
      // Continue without Google reviews
    }
  } catch (error) {
    console.error("Error fetching listing data for metadata:", error);
  }

  return {
    reviewCount,
    averageRating,
    googleReviewCount,
    googleAverageRating,
    listingName,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listingName = slugToListingName(slug);

  const data = await fetchListingData(listingName);

  const title = `${listingName} - Guest Reviews | Flex Living`;
  const combinedReviewText =
    data.googleReviewCount > 0
      ? `${data.reviewCount} reviews (${data.googleReviewCount} Google reviews included)`
      : `${data.reviewCount} verified guest reviews`;
  const description = `Read ${combinedReviewText} for ${listingName}, a premium London property by Flex Living. Average rating: ${(data.averageRating / 2).toFixed(1)}/5. Book with confidence.`;

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
      "rating:value": (data.averageRating / 2).toFixed(1),
      "rating:scale": "5",
      "review:count": data.reviewCount.toString(),
      "google:review:count": data.googleReviewCount.toString(),
      "verified:review:count": (
        data.reviewCount - data.googleReviewCount
      ).toString(),
    },
  };
}

export default async function ListingLayout({ children, params }: Props) {
  // Validate slug format
  const { slug } = await params;
  if (!slug || slug.length === 0 || !isValidSlug(slug)) {
    notFound();
  }

  const listingName = slugToListingName(slug);
  const data = await fetchListingData(listingName);

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: listingName,
            description: `Premium London accommodation - ${listingName}`,
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
              ratingValue: (data.averageRating / 2).toFixed(1),
              bestRating: "5",
              worstRating: "1",
              ratingCount: data.reviewCount.toString(),
            },
          }),
        }}
      />
      {children}
    </>
  );
}
