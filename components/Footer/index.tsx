// Footer.tsx

'use client';
import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaBook, FaTwitter, FaMedium } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="w-full bg-transparent text-white/60 backdrop-blur-md mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-6 mx-auto max-w-7xl">

        {/* Marketplace Fee */}
        <div className="flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm mb-4 md:mb-0">
          <span>2% fee on marketplace</span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <Link href="https://docs.gulfstreamreal.com/" target="_blank" rel="noopener noreferrer" aria-label="Documentation">
            <FaBook className="w-6 h-6 hover:text-white transition-colors duration-200 cursor-pointer" />
          </Link>

          <Link href="https://discord.gg/ggpTZkTFrA" target="_blank" rel="noopener noreferrer" aria-label="Join our Discord">
            <FaDiscord className="w-6 h-6 text-white hover:text-[#7289DA] transition-colors duration-200 cursor-pointer" />
          </Link>

          <Link href="https://x.com/gulfstreamreal" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter">
            <FaTwitter className="w-6 h-6 hover:text-white transition-colors duration-200 cursor-pointer" />
          </Link>

          <Link href="https://medium.com/@gulfstreamreal" target="_blank" rel="noopener noreferrer" aria-label="Read our blog on Medium">
            <FaMedium className="w-6 h-6 hover:text-white transition-colors duration-200 cursor-pointer" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
