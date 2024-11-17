import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";

/**
 * Landing page with a simple gradient background and a hero asset.
 * Free to customize as you see fit.
 */
const Home: NextPage = () => {
  return (
    <div className="pt-20"> {/* Added top padding to push content below navbar */}
      <div className="flex justify-center p-4"> {/* Increased padding for better spacing */}
        <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-112 md:h-112 lg:w-128 lg:h-128 xl:w-160 xl:h-160"> {/* Increased image size */}
          <Image
            src="/hero-asset.png"
            width={640} // Increased width
            height={640} // Increased height
            alt="Hero asset, NFT marketplace"
            quality={100}
            className="rounded-full object-cover"
          />
        </div>
      </div>
      <div className="px-8 mx-auto text-center">
        <h1 className="mb-5 text-white font-bold text-6xl">
          <span className="text-transparent bg-clip-text gradient-orange-blue">
            Welcome to Gulf Stream
          </span> 
          <br />
          Exchange your Investment NFTs for Crypto.
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Use our decentralized marketplace with audited open source contracts
          to buy and sell NFTs with the confidence of a secure and transparent transaction on the re.al blockchain.
        </p>
        <div className="flex justify-center text-lg font-medium items-center mt-12 gap-4">
          <Link
            className="w-56 p-3 rounded-lg transition-all hover:shadow-lg gradient-lightblue text-black border border-white/10"
            href="/buy"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
