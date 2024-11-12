// src/lib/fetchTokenPrices.ts

import axios from 'axios';

const TOKEN_API_URLS = {
  reETH: 'https://api.geckoterminal.com/api/v2/simple/networks/re-al/token_price/0x90c6e93849e06ec7478ba24522329d14a5954df4',
  lockedToken: 'https://api.geckoterminal.com/api/v2/simple/networks/re-al/token_price/0xce1581d7b4ba40176f0e219b2cac30088ad50c7a',
};

/**
 * Fetches the current prices of multiple tokens in USD from GeckoTerminal.
 * @returns An object containing the prices of reETH and the locked token in USD.
 */
export const fetchTokenPrices = async (): Promise<{ reETH: number | null; lockedToken: number | null }> => {
  try {
    const [reEthResponse, lockedTokenResponse] = await Promise.all([
      axios.get(TOKEN_API_URLS.reETH),
      axios.get(TOKEN_API_URLS.lockedToken),
    ]);

    /**
     * Extracts the price from the API response.
     * @param responseData - The data object from the API response.
     * @param tokenAddress - The contract address of the token.
     * @returns The price in USD or null if not found/invalid.
     */
    const extractPrice = (responseData: any, tokenAddress: string): number | null => {
      const tokenPrices = responseData.data.attributes.token_prices;
      const address = tokenAddress.toLowerCase();

      if (tokenPrices && typeof tokenPrices === 'object') {
        const priceString = tokenPrices[address];
        if (priceString) {
          const priceUsd = parseFloat(priceString);
          if (!isNaN(priceUsd)) {
            return priceUsd;
          } else {
            console.error('Price is not a valid number:', priceString);
            return null;
          }
        } else {
          console.error(`Price for token address ${address} not found.`);
          return null;
        }
      } else {
        console.error('Unexpected token_prices structure:', tokenPrices);
        return null;
      }
    };

    const reEthAddress = '0x90c6e93849e06ec7478ba24522329d14a5954df4';
    const lockedTokenAddress = '0xce1581d7b4ba40176f0e219b2cac30088ad50c7a';

    const reEthPrice = extractPrice(reEthResponse.data, reEthAddress);
    const lockedTokenPrice = extractPrice(lockedTokenResponse.data, lockedTokenAddress);

    return { reETH: reEthPrice, lockedToken: lockedTokenPrice };
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return { reETH: null, lockedToken: null };
  }
};
