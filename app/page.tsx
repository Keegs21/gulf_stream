import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";

/**
 * Landing page with a simple gradient background and a hero asset.
 * Free to customize as you see fit.
 */
const Home: NextPage = () => {
  return (
    <div className="">
      <div className="flex justify-center p-2">
        <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-104 lg:h-104 xl:w-128 xl:h-128">
          <Image
            src="/hero-asset.png"
            width={512} // Ensure width and height are equal
            height={512}
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
