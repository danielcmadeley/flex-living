"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[#FFFDF6] sticky top-0 z-[99999] py-3">
      <div className="max-w-[90rem] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/image.webp"
                alt="The Flex Logo"
                width={120}
                height={120}
              />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-[#284E4C] ${
                  pathname === "/" ? "text-[#284E4C]" : "text-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                href="/listings"
                className={`text-sm font-medium transition-colors hover:text-[#284E4C] ${
                  pathname?.startsWith("/listings")
                    ? "text-[#284E4C]"
                    : "text-gray-700"
                }`}
              >
                Properties
              </Link>
            </nav>
            <Link
              href="/dashboard"
              className="hidden bg-[#284E4C] sm:inline-flex text-sm font-medium text-neutral-100 px-4 py-2 rounded-md hover:text-blue-600 transition-colors"
            >
              Manager Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/" ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              href="/listings"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname?.startsWith("/listings")
                  ? "text-blue-600"
                  : "text-gray-700"
              }`}
            >
              Properties
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Manager Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
