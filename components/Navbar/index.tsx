// Navbar.tsx
import { ConnectButton } from "thirdweb/react";
import Image from "next/image";
import Link from "next/link";
import client from "@/lib/client";
import { NETWORK } from "@/const/contracts";
import { FaDiscord, FaBook } from 'react-icons/fa'; // Import the Docs icon along with Discord icon

export function Navbar() {
  return (
    <div className="fixed top-0 z-50 w-full bg-transparent text-white/60 backdrop-blur-md">
      <nav className="flex items-center justify-between w-full px-4 py-3 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
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

          {/* Navigation Links */}
          <div className="flex items-center gap-6 font-medium">
            <Link
              href="/buy"
              className="transition hover:text-white/100"
            >
              Marketplace
            </Link>
            <Link
              href="/sell"
              className="transition hover:text-white/100"
            >
              Sell
            </Link>
          </div>
        </div>

        {/* Right Side Icons and Buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Docs Icon Link */}
          <Link href="https://docs.gulfstreamreal.com/" target="_blank" rel="noopener noreferrer" aria-label="Documentation">
            <div className="flex items-center space-x-2 hover:text-white transition-colors duration-200 cursor-pointer">
              <FaBook className="w-6 h-6" />
            </div>
          </Link>

          {/* Discord Icon */}
          <Link href="https://discord.gg/ggpTZkTFrA" target="_blank" rel="noopener noreferrer" aria-label="Join our Discord">
            <FaDiscord className="w-6 h-6 text-white hover:text-[#7289DA] transition-colors duration-200 cursor-pointer" />
          </Link>

          {/* Connect Button */}
          <div>
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
          {/* 2% Fee Notification */}
          <div className="flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm">
            <span>2% fee on marketplace</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
