"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="relative min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1754999961467-0d6e4c2551e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <div className="absolute inset-0 bg-neutral-900/40"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/listings"
                className="inline-block bg-[#284E4C] hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                Explore Listings
              </Link>
              <Link
                href="/dashboard"
                className="inline-block bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg border border-gray-200"
              >
                Manager Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
