// src/app/layout.tsx

import { ThirdwebProvider } from 'thirdweb/react';
// import { WagmiProvider } from 'wagmi';
import wagmiClient from '@/lib/wagmiclient';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import Image from 'next/image';
import '@/globals.css';
import { Metadata } from 'next';
import UserDataProvider from '@/components/UserDataProvider/UserDataProvider';
import MarketplaceDataProvider from '@/components/MarketplaceProvider/MarketplaceProvider';

export const metadata: Metadata = {
  title: 'Gulf Stream | NFT Marketplace',
  description: 'A decentralized open source place to exchange Financial NFTs for RWAs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative overflow-x-hidden max-w-screen">
        <div className="absolute top-0 left-0 right-0 w-screen h-screen -z-10">
          <Image
            src="/hero-asset2.png"
            width={1390}
            height={1390}
            alt="Background gradient from red to blue"
            quality={100}
            className="w-full h-full opacity-50"
          />
        </div>

        <Toaster />
          <ThirdwebProvider>
          {/* <WagmiProvider config={wagmiClient}> */}
            <UserDataProvider>
              <MarketplaceDataProvider>
                <Navbar />
                <div className="w-screen min-h-screen">
                {/* Full Width Content */}
                  <div className="px-8 mt-32 w-full">{children}</div>
                </div>
              </MarketplaceDataProvider>
            </UserDataProvider>
            {/* </WagmiProvider> */}
          </ThirdwebProvider>
      </body>
    </html>
  );
}
