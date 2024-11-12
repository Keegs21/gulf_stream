// src/components/Navbar.tsx
'use client';

import { ConnectButton } from "thirdweb/react";
import Image from "next/image";
import Link from "next/link";
import client from "@/lib/client";
import { NETWORK } from "@/const/contracts";
import { useState } from "react";

export function Navbar() {
  // State to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Function to close mobile menu (useful when a link is clicked)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-0 z-50 w-full bg-transparent text-white/60 backdrop-blur-md">
      <nav className="flex items-center justify-between w-full px-4 py-3 mx-auto max-w-7xl">
        {/* Logo and Navigation Links */}
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="NFT marketplace logo"
              className="object-contain"
            />
            <span className="text-transparent bg-clip-text gradient-orange-blue">Gulf Stream</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link
              href="/buy"
              className="transition-colors duration-200 hover:text-white"
            >
              Marketplace
            </Link>
            <Link
              href="/sell"
              className="transition-colors duration-200 hover:text-white"
            >
              Sell
            </Link>
          </div>

          {/* Desktop Connect Button */}
          <div className="hidden md:flex items-center">
            <ConnectButton
              theme="dark"
              client={client}
              chain={NETWORK}
              connectModal={{
                title: "Sign in to MyApp",
                size: "compact",
              }}
            />
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            className="flex items-center p-2 text-gray-500 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {/* Hamburger Icon */}
            {!isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            ) : (
              // Close Icon
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-black bg-opacity-90 text-white flex flex-col items-center py-4 space-y-4 md:hidden transition-all duration-300 ease-in-out">
            <Link
              href="/buy"
              className="w-full text-center py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200"
              onClick={closeMobileMenu}
            >
              Marketplace
            </Link>
            <Link
              href="/sell"
              className="w-full text-center py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200"
              onClick={closeMobileMenu}
            >
              Sell
            </Link>
            <div className="w-full flex justify-center">
              <ConnectButton
                theme="dark"
                client={client}
                chain={NETWORK}
                connectModal={{
                  title: "Sign in to MyApp",
                  size: "compact",
                }}
              />
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
