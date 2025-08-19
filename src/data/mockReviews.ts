// Comprehensive mock data with 100 reviews - both host-to-guest and guest-to-host have ratings
const properties = [
  "2B N1 A - 29 Shoreditch Heights",
  "1B Central London - Modern Flat",
  "Studio Flat - City Center",
  "Luxury Penthouse - Thames View",
  "Cozy Apartment - Notting Hill",
  "Modern Loft - Canary Wharf",
  "Victorian House - Hampstead",
  "Family Townhouse - Greenwich",
  "Minimalist Studio - Shoreditch",
  "Art Deco Apartment - Marylebone",
  "Garden Flat - Kensington",
  "Riverside Apartment - Bermondsey",
  "Historic Flat - Covent Garden",
  "Boutique Hotel Room - Fitzrovia",
  "Converted Warehouse - Hackney",
  "Designer Loft - Islington",
  "Quiet Retreat - Richmond",
  "Bohemian Flat - Camden",
  "Executive Suite - Canary Wharf",
  "Terrace House - Primrose Hill",
];

const guestNames = [
  "Shane Finkelstein",
  "Maria Rodriguez",
  "John Smith",
  "Emma Thompson",
  "David Wilson",
  "Sarah Johnson",
  "Michael Brown",
  "Lisa Chen",
  "Robert Davis",
  "Amanda White",
  "James Miller",
  "Sophie Taylor",
  "Kevin Anderson",
  "Rachel Green",
  "The Garcia Family",
  "Tom Wilson",
  "Mark Stevens",
  "Helen Clark",
  "Paul Martinez",
  "Isabella Rodriguez",
  "Daniel Lee",
  "Oliver Thompson",
  "Charlotte Davis",
  "George Wilson",
  "Nancy Taylor",
  "William Brown",
  "Grace Johnson",
  "Henry Wilson",
  "Victoria Smith",
  "Alexander Brown",
  "Sophia Garcia",
  "Benjamin Lee",
  "Lucas Martinez",
  "Emma Rodriguez",
  "Mason Anderson",
  "Ava Thompson",
  "Noah Davis",
  "Mia Wilson",
  "Ethan Garcia",
  "Olivia Martinez",
  "Liam Johnson",
  "Isabella Clark",
  "Jacob Rodriguez",
  "Madison White",
  "Logan Martinez",
  "Chloe Anderson",
  "Ryan Thompson",
  "Grace Wilson",
  "Caleb Davis",
  "Zoe Garcia",
];

const hostToGuestComments = [
  "Wonderful guests! Would definitely host again :)",
  "Excellent guests! Left the place spotless and were very respectful.",
  "Perfect guests! Communicated well and followed all house rules. Highly recommended.",
  "Great guests, very clean and respectful. Minor issues with check-out timing.",
  "Guests were okay but left some mess in the kitchen. Communication could be improved.",
  "Fantastic guests! Left everything perfect and were lovely to communicate with.",
  "Good guests overall, minor issues with noise levels in the evening.",
  "Wonderful family! Very respectful and left the place in great condition.",
  "Guests had some issues following house rules. Left some damage to furniture.",
  "Pleasant guests who respected all house rules. Would welcome back anytime.",
  "Guests were late for check-in but otherwise respectful during their stay.",
  "Absolutely wonderful guests! Professional, clean, and excellent communication.",
  "Good guests but had some confusion about check-out procedures.",
  "Excellent guests! Very considerate and left everything in perfect order.",
  "Nice guests who were respectful of the space and neighbors.",
  "Wonderful guests who appreciated the unique character of the space.",
  "Guests were okay but didn't follow the quiet hours policy completely.",
  "Great guests! Very friendly and left positive energy in the space.",
  "Perfect guests in every way! Professional, clean, and communicative.",
  "Good guests overall, though check-in was delayed due to traffic.",
  "Lovely guests who truly appreciated the vintage charm of the apartment.",
  "Respectful guests who took good care of the garden flat.",
  "Delightful guests! Left thoughtful notes and small gifts.",
  "Professional guests who were easy to communicate with.",
  "Considerate guests who respected quiet hours and neighbors.",
];

const guestToHostComments = [
  "Great location and very clean apartment. Host was responsive and helpful.",
  "Nice apartment in a great area. Check-in was smooth and the host provided excellent recommendations.",
  "Good stay overall. The apartment was clean but the WiFi could be better.",
  "Amazing penthouse with stunning views! Host was incredibly helpful and responsive.",
  "Lovely apartment in Notting Hill. Perfect location and beautifully decorated.",
  "Great modern loft with excellent amenities. Close to transport links.",
  "Beautiful Victorian house with character. Host provided excellent local recommendations.",
  "Perfect for families! Spacious and well-equipped. Kids loved the garden.",
  "Nice studio but had some maintenance issues. Host was responsive to concerns.",
  "Stunning Art Deco apartment with fantastic attention to detail. Highly recommended!",
  "Lovely garden flat in a prime location. Perfect for a romantic getaway.",
  "Amazing riverside views and modern amenities. Host was incredibly welcoming.",
  "Fantastic location in the heart of Covent Garden. Rich in history and character.",
  "Boutique hotel experience with personal touch. Exceeded expectations!",
  "Unique converted warehouse with industrial charm. Great for creative types.",
  "Absolutely stunning designer loft! Every detail was perfect. 5 stars!",
  "Peaceful retreat away from the city bustle. Perfect for relaxation.",
  "Love the bohemian vibe! Perfect location for exploring Camden's music scene.",
  "Executive suite with all business amenities. Perfect for corporate stays.",
  "Beautiful terrace house with amazing views of Primrose Hill park.",
  "Charming vintage apartment in literary Bloomsbury. Loved the character!",
  "Wonderful garden flat near the heath. Perfect for morning jogs!",
  "Cozy and comfortable space with thoughtful touches throughout.",
  "Excellent value for money in a prime London location.",
  "Host went above and beyond to make our stay comfortable.",
];

const categories = [
  "cleanliness",
  "communication",
  "respect_house_rules",
  "accuracy",
  "location",
  "check_in",
  "value",
];

function getRandomRating(min: number = 1, max: number = 10): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomCategories(
  isHostToGuest: boolean,
): Array<{ category: string; rating: number }> {
  const relevantCategories = isHostToGuest
    ? ["cleanliness", "communication", "respect_house_rules"]
    : categories;

  const numCategories = Math.floor(Math.random() * 3) + 2; // 2-4 categories
  const selectedCategories = relevantCategories
    .sort(() => 0.5 - Math.random())
    .slice(0, numCategories);

  return selectedCategories.map((category) => ({
    category,
    rating: getRandomRating(6, 10), // Mostly positive ratings
  }));
}

function getRandomDate(): Date {
  const start = new Date("2023-01-01");
  const end = new Date("2024-02-15");
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

export const mockReviews = Array.from({ length: 100 }, (_, index) => {
  const id = 1001 + index;
  const isHostToGuest = Math.random() < 0.5;
  const type = isHostToGuest
    ? ("host-to-guest" as const)
    : ("guest-to-host" as const);

  // Both types should have ratings
  const rating = getRandomRating(5, 10);

  const status =
    Math.random() < 0.85
      ? ("published" as const)
      : Math.random() < 0.7
        ? ("pending" as const)
        : ("draft" as const);

  const publicReview = isHostToGuest
    ? getRandomElement(hostToGuestComments)
    : getRandomElement(guestToHostComments);

  return {
    id,
    type,
    status,
    rating,
    publicReview,
    reviewCategory: getRandomCategories(isHostToGuest),
    submittedAt: getRandomDate(),
    guestName: getRandomElement(guestNames),
    listingName: getRandomElement(properties),
  };
}).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()); // Sort by date descending

// Export for Hostaway API response format
export const mockHostawayResponse = {
  status: "success",
  result: mockReviews.map((review) => ({
    ...review,
    submittedAt: review.submittedAt
      .toISOString()
      .replace("T", " ")
      .substring(0, 19),
  })),
};

// Export types for consistency
export type MockReview = (typeof mockReviews)[0];
export type MockHostawayResponse = typeof mockHostawayResponse;
