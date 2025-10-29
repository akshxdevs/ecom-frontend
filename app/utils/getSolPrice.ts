import { LAMPORTS_PER_SOL } from "@solana/web3.js";
 
 export const getSolPrice = async (usdAmount: number): Promise<number> => {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    const data = (await res.json()) as { solana: { usd: number } };
    
    const solPrice = data.solana.usd;
    const solAmount = usdAmount / solPrice;
    return Math.round(solAmount * LAMPORTS_PER_SOL);
  };