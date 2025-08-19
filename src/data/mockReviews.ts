export const mockReviews = [
  {
    id: 7453,
    type: "host-to-guest" as const,
    status: "published" as const,
    rating: null,
    publicReview: "Shane and family are wonderful! Would definitely host again :)",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 10 }
    ],
    submittedAt: new Date("2020-08-21T22:45:14.000Z"),
    guestName: "Shane Finkelstein",
    listingName: "2B N1 A - 29 Shoreditch Heights"
  },
  {
    id: 7454,
    type: "guest-to-host" as const,
    status: "published" as const,
    rating: 9,
    publicReview: "Great location and very clean apartment. Host was responsive and helpful.",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 10 },
      { category: "location", rating: 10 },
      { category: "value", rating: 8 }
    ],
    submittedAt: new Date("2020-08-20T15:30:00.000Z"),
    guestName: "Maria Rodriguez",
    listingName: "2B N1 A - 29 Shoreditch Heights"
  },
  {
    id: 7455,
    type: "host-to-guest" as const,
    status: "published" as const,
    rating: null,
    publicReview: "Excellent guests! Left the place spotless and were very respectful.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 9 },
      { category: "respect_house_rules", rating: 10 }
    ],
    submittedAt: new Date("2020-08-19T09:15:22.000Z"),
    guestName: "John Smith",
    listingName: "1B Central London - Modern Flat"
  },
  {
    id: 7456,
    type: "guest-to-host" as const,
    status: "published" as const,
    rating: 8,
    publicReview: "Nice apartment in a great area. Check-in was smooth and the host provided excellent recommendations.",
    reviewCategory: [
      { category: "cleanliness", rating: 8 },
      { category: "communication", rating: 9 },
      { category: "location", rating: 10 },
      { category: "check_in", rating: 9 },
      { category: "value", rating: 7 }
    ],
    submittedAt: new Date("2020-08-18T14:20:30.000Z"),
    guestName: "Emma Thompson",
    listingName: "1B Central London - Modern Flat"
  },
  {
    id: 7457,
    type: "host-to-guest" as const,
    status: "published" as const,
    rating: null,
    publicReview: "Perfect guests! Communicated well and followed all house rules. Highly recommended.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 10 }
    ],
    submittedAt: new Date("2020-08-17T18:45:15.000Z"),
    guestName: "David Wilson",
    listingName: "Studio Flat - City Center"
  }
];

// Export for Hostaway API response format
export const mockHostawayResponse = {
  status: "success",
  result: mockReviews.map(review => ({
    ...review,
    submittedAt: review.submittedAt.toISOString().replace('T', ' ').substring(0, 19)
  }))
};

// Export types for consistency
export type MockReview = typeof mockReviews[0];
export type MockHostawayResponse = typeof mockHostawayResponse;
