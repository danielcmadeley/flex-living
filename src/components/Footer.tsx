"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+44",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // Form submission logic would go here
  };

  return (
    <footer className="bg-[#284E4C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Join The Flex */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Join The Flex</h3>
            <p className="text-gray-300 mb-6 text-sm">
              Sign up now and stay up to date on our latest news and exclusive
              deals including 5% off your first stay!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#3F5F5D] border border-slate-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                  <span className="absolute right-3 top-2 text-green-400">
                    ✓
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#3F5F5D] border border-slate-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                  <span className="absolute right-3 top-2 text-green-400">
                    ✓
                  </span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#3F5F5D] border border-slate-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
                <span className="absolute right-3 top-2 text-green-400">✓</span>
              </div>

              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="px-3 py-2 bg-[#3F5F5D] border border-slate-500 rounded-md text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+213">🇩🇿 +213</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#3F5F5D] border border-slate-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                  <span className="absolute right-3 top-2 text-green-400">
                    ✓
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-slate-700 py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <span>✈</span>
                Subscribe
              </button>
            </form>
          </div>

          {/* The Flex */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">The Flex</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Professional property management services for landlords, flexible
              corporate lets for businesses and quality accommodations for
              short-term and long-term guests.
            </p>

            <div className="flex gap-4 mt-6">
              <Link href="#" className="text-gray-300 hover:text-white">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-300 hover:text-white"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">Locations</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/locations/london"
                  className="text-gray-300 hover:text-white"
                >
                  London
                </Link>
              </li>
              <li>
                <Link
                  href="/locations/paris"
                  className="text-gray-300 hover:text-white"
                >
                  Paris
                </Link>
              </li>
              <li>
                <Link
                  href="/locations/algiers"
                  className="text-gray-300 hover:text-white"
                >
                  Algiers
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>

            <div className="space-y-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span>📞</span>
                  <span className="font-medium">Support Numbers</span>
                </div>
                <div className="ml-6">
                  <div className="flex items-center gap-2">
                    <span>🇬🇧</span>
                    <span>United Kingdom</span>
                  </div>
                  <div className="text-gray-300">+44 77 2374 5646</div>
                </div>
              </div>

              <div className="ml-6">
                <div className="flex items-center gap-2">
                  <span>🇩🇿</span>
                  <span>Algeria</span>
                </div>
                <div className="text-gray-300">+33 7 57 59 22 41</div>
              </div>

              <div className="ml-6">
                <div className="flex items-center gap-2">
                  <span>🇫🇷</span>
                  <span>France</span>
                </div>
                <div className="text-gray-300">+33 6 44 64 57 17</div>
              </div>

              <div className="flex items-center gap-2">
                <span>✉️</span>
                <Link
                  href="mailto:info@theflex.global"
                  className="text-gray-300 hover:text-white"
                >
                  info@theflex.global
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center text-sm text-gray-300">
            © 2025 The Flex. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
