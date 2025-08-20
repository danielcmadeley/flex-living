import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flex Living - Premium London Accommodations",
  description:
    "Discover exceptional stays across London's finest locations. Browse verified guest reviews and find your perfect accommodation with Flex Living.",
  keywords:
    "London accommodation, premium stays, guest reviews, Flex Living, London properties",
  authors: [{ name: "Flex Living" }],
  creator: "Flex Living",
  publisher: "Flex Living",
  openGraph: {
    title: "Flex Living - Premium London Accommodations",
    description: "Discover exceptional stays across London's finest locations",
    type: "website",
    locale: "en_GB",
    siteName: "Flex Living",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flex Living - Premium London Accommodations",
    description: "Discover exceptional stays across London's finest locations",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
