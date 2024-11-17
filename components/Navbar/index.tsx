// Navbar.tsx

'use client';
import { useState } from "react";
import { ConnectButton } from "thirdweb/react";
import Image from "next/image";
import Link from "next/link";
import client from "@/lib/client";
import { NETWORK } from "@/const/contracts";
import { FaDiscord, FaBook, FaBars, FaTimes } from 'react-icons/fa';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 z-50 w-full bg-transparent text-white/60 backdrop-blur-md">
      <nav className="flex items-center justify-between w-full px-4 py-3 mx-auto max-w-7xl">
        {/* Logo and Brand Name */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Image
            src="/logo.png"
            width={48}
            height={48}
            alt="NFT marketplace sample logo"
          />
          <span className="text-transparent bg-clip-text gradient-orange-blue">Gulf Stream</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link href="/buy" className="transition hover:text-white/100">Marketplace</Link>
            <Link href="/sell" className="transition hover:text-white/100">Sell</Link>
          </div>

          {/* Desktop Icons and Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Docs Icon Link */}
            <Link href="https://docs.gulfstreamreal.com/" target="_blank" rel="noopener noreferrer" aria-label="Documentation">
              <FaBook className="w-6 h-6 hover:text-white transition-colors duration-200 cursor-pointer" />
            </Link>

            {/* Discord Icon */}
            <Link href="https://discord.gg/ggpTZkTFrA" target="_blank" rel="noopener noreferrer" aria-label="Join our Discord">
              <FaDiscord className="w-6 h-6 text-white hover:text-[#7289DA] transition-colors duration-200 cursor-pointer" />
            </Link>

            {/* Connect Button */}
            <ConnectButton
              theme="dark"
              client={client}
              chain={NETWORK}
              connectModal={{
                title: "Sign in to Gulf Stream",
                size: "compact",
              }}
            />

            {/* 2% Fee Notification */}
            <div className="flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm">
              <span>2% fee on marketplace</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 text-white">
          <div className="px-4 py-2">
            {/* Mobile Navigation Links */}
            <Link href="/buy">
              <a className="block py-2" onClick={() => setIsMenuOpen(false)}>Marketplace</a>
            </Link>
            <Link href="/sell">
              <a className="block py-2" onClick={() => setIsMenuOpen(false)}>Sell</a>
            </Link>

            {/* Mobile Icons */}
            <div className="flex items-center gap-4 py-2">
              <Link href="https://docs.gulfstreamreal.com/" target="_blank" rel="noopener noreferrer" aria-label="Documentation">
                <FaBook className="w-6 h-6 hover:text-white transition-colors duration-200 cursor-pointer" />
              </Link>

              <Link href="https://discord.gg/ggpTZkTFrA" target="_blank" rel="noopener noreferrer" aria-label="Join our Discord">
                <FaDiscord className="w-6 h-6 text-white hover:text-[#7289DA] transition-colors duration-200 cursor-pointer" />
              </Link>
            </div>

            {/* Connect Button */}
            <div className="py-2">
              <ConnectButton
                theme="dark"
                client={client}
                chain={NETWORK}
                connectModal={{
                  title: "Sign in to Gulf Stream",
                  size: "compact",
                }}
              />
            </div>

            {/* 2% Fee Notification */}
            <div className="flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm mt-2">
              <span>2% fee on marketplace</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
