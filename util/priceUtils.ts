// src/util/priceUtils.ts

export const convertReEthToUsd = (
    reEthAmount: string | number,
    reEthPrice: number | null
  ): string => {
    const amount = typeof reEthAmount === "string" ? parseFloat(reEthAmount) : reEthAmount;
    if (reEthPrice && !isNaN(amount)) {
      const usd = amount * reEthPrice;
      return `$${usd.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return "Loading...";
  };
  
  /**
   * Converts ReEth amount to USD as a number.
   * @param reEthAmount - The amount in ReEth.
   * @param reEthPrice - The current price of ReEth in USD.
   * @returns The equivalent USD value or null if conversion isn't possible.
   */
  export const convertReEthToUsdNumber = (
    reEthAmount: string | number,
    reEthPrice: number | null
  ): number | null => {
    const amount = typeof reEthAmount === "string" ? parseFloat(reEthAmount) : reEthAmount;
    if (reEthPrice && !isNaN(amount)) {
      const usd = amount * reEthPrice;
      return usd;
    }
    return null;
  };
  
  /**
   * Calculates the Sale Ratio based on NFT Value and Price.
   * @param nftValue - The assigned value of the NFT.
   * @param usdPrice - The price of the NFT in USD.
   * @returns The Sale Ratio as a number.
   */
  export const calculateSaleRatio = (usdPrice: number, nftValue: number): string => {
    if (nftValue === 0) return "N/A"; // Prevent division by zero
    const ratio = usdPrice / nftValue;
    return `${ratio.toFixed(2)}:1`;
  };


/**
 * Calculates the Sale Percentage Difference based on USD Price and NFT Value.
 * @param usdPrice - The price of the NFT in USD.
 * @param nftValue - The assigned value of the NFT.
 * @returns The Sale Percentage Difference as a formatted string, e.g., "-25%" or "+320%".
 */
export const calculateSalePercentageDifference = (
  usdPrice: number,
  nftValue: number
): string => {
  if (nftValue === 0) return "N/A"; // Prevent division by zero

  const ratio = usdPrice / nftValue;
  let difference = (ratio - 1) * 100;

  // Add a small tolerance for floating point errors
  const epsilon = 0.0001; 
  if (Math.abs(difference) < epsilon) {
    difference = 0;
  }

  // Determine the sign
  let sign = "";
  if (difference > 0) sign = "+";
  if (difference < 0) sign = "-";

  // Use absolute value for display since sign is determined separately
  return `${sign}${Math.abs(difference).toFixed(0)}%`;
};


  

  /**
 * Converts Pearl amount to USD as a formatted string.
 * @param pearlAmount - The amount in Pearl.
 * @param lockedTokenPrice - The current price of Pearl in USD.
 * @returns The equivalent USD value as a formatted string or "Loading..." if conversion isn't possible.
 */
export const convertPearlToUsd = (
    pearlAmount: string | number,
    lockedTokenPrice: number | null
  ): string => {
    const amount = typeof pearlAmount === "string" ? parseFloat(pearlAmount) : pearlAmount;
    if (lockedTokenPrice && !isNaN(amount)) {
      const usd = amount * lockedTokenPrice;
      return `$${usd.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return "Loading...";
  };
  
  /**
   * Converts Pearl amount to USD as a number.
   * @param pearlAmount - The amount in Pearl.
   * @param lockedTokenPrice - The current price of Pearl in USD.
   * @returns The equivalent USD value as a number or null if conversion isn't possible.
   */
  export const convertPearlToUsdNumber = (
    pearlAmount: string | number,
    lockedTokenPrice: number | null
  ): number | null => {
    const amount = typeof pearlAmount === "string" ? parseFloat(pearlAmount) : pearlAmount;
    if (lockedTokenPrice && !isNaN(amount)) {
      const usd = amount * lockedTokenPrice;
      return usd;
    }
    return null;
  };
  