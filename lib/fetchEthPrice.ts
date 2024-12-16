// src/lib/fetchTokenPrices.ts

import axios from 'axios';

const TOKEN_API_URLS = {
  // Using Coingecko's API for multiple tokens at once:
  // wrapped-real-ether = reETH
  // pearl = lockedToken
  // uk-real-estate = UKRE
  // usd-coin = USDC
  // (Note: RWA price will be fetched separately from GeckoTerminal)
  uni: 'https://api.coingecko.com/api/v3/simple/price?ids=wrapped-real-ether,pearl,uk-real-estate,usd-coin&vs_currencies=usd',
  rwa: 'https://api.geckoterminal.com/api/v2/simple/networks/re-al/token_price/0x4644066f535ead0cde82d209df78d94572fcbf14' // RWA URL
};

/**
 * Fetches the current prices of multiple tokens in USD.
 * This function:
 *  - Uses Coingecko for REETH, lockedToken (PEARL), UKRE, USDC
 *  - Uses GeckoTerminal for RWA price
 *
 * @returns An object containing the prices of reETH, lockedToken, and RWA in USD.
 */
export const fetchTokenPrices = async (): Promise<{
  reETH: number | null;
  lockedToken: number | null;
  rwa: number | null;
}> => {
  try {
    // Make requests: one to Coingecko (uni) and one to GeckoTerminal (rwa)
    const [uniResponse, rwaResponse] = await Promise.all([
      axios.get(TOKEN_API_URLS.uni),
      axios.get(TOKEN_API_URLS.rwa)
    ]);

    const data = uniResponse.data;

    // Extract prices from the Coingecko response
    const reEthPrice = data['wrapped-real-ether']?.usd ?? null;
    const lockedTokenPrice = data['pearl']?.usd ?? null;
    // We do not rely on Coingecko for RWA, so we won't use data['real-world-assets'] anymore

    // Extract RWA price from the GeckoTerminal response
    const extractRwaPrice = (responseData: any, tokenAddress: string): number | null => {
      const tokenPrices = responseData?.data?.attributes?.token_prices;
      const address = tokenAddress.toLowerCase();

      if (tokenPrices && typeof tokenPrices === 'object') {
        const priceString = tokenPrices[address];
        if (priceString) {
          const priceUsd = parseFloat(priceString);
          return isNaN(priceUsd) ? null : priceUsd;
        } else {
          console.error(`RWA: Price for token address ${address} not found.`);
          return null;
        }
      } else {
        console.error('RWA: Unexpected token_prices structure:', tokenPrices);
        return null;
      }
    };

    const rwaAddress = '0x4644066f535ead0cde82d209df78d94572fcbf14';
    const rwaPrice = extractRwaPrice(rwaResponse.data, rwaAddress);

    return { reETH: reEthPrice, lockedToken: lockedTokenPrice, rwa: rwaPrice };
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return { reETH: null, lockedToken: null, rwa: null };
  }
};
