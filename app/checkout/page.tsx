"use client";
import { AnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL,PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSellerPubkey } from "../cart/page";
import { Appbar } from "../Components/Appbar";
import { Escrow } from "@/sdk/mint";

export default function(){
    const [totalAmount,setTotalAmount] = useState<number>(0);
    const [isClient, setIsClient] = useState(false);
    let walletAdapter = useWallet();
    const {sellerPubkey} = useSellerPubkey();
    
    async function getSolPrice(): Promise<number> {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
        const data = (await res.json()) as { solana: { usd: number } };
        return data.solana.usd; 
    }

    async function convertUsdToLamports(usdAmount: number): Promise<number> {
        const solPrice = await getSolPrice();   
        const solAmount = usdAmount / solPrice;
        const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);
        return lamports;
    }


    useEffect(()=>{
        setIsClient(true);
        try {
            setTotalAmount(Number(localStorage.getItem("totalAmount")));
            console.log("Seller PublicKey: ",sellerPubkey);
            const amount = Number(localStorage.getItem("totalAmount"))
            console.log("total Amount ($): ",amount + "$");
            const fetchAmountInSol = async() => {
                const totalAmount = await convertUsdToLamports(amount);
                console.log("Total Amount (SOL):", (totalAmount / LAMPORTS_PER_SOL).toFixed(2));
            }
            fetchAmountInSol();
        } catch (error) {
            console.log("No total amount found");
            setTotalAmount(0);
        };
    },[]);

    const handlePayment = async() => {
        const escrow = new Escrow(walletAdapter);
        if (!sellerPubkey) {
            toast.error("Seller information not available");
            return;
        }
        if (!totalAmount || totalAmount <= 0) {
            toast.error("Invalid total amount");
            return;
        }
        if (!walletAdapter || !walletAdapter.publicKey) {
            toast.error("Wallet not properly connected");
            return;
        }
        try {
            const result = await escrow.initMint(walletAdapter as AnchorWallet,walletAdapter.publicKey,new PublicKey(sellerPubkey));
            if (result.success) {
                console.log("Mint Details: ",result);
            } else {
                toast.error(`Payment creation failed: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(`Transaction failed: ${errorMessage}`);
        }
    }
    return(
        <div>
            <Appbar/>
            <div className="flex flex-col justify-center items-center h-screen gap-5">
                <h1>Total Amount: {totalAmount}$</h1>
                <button 
                    className={`py-2 px-4 border rounded-lg font-normal ${
                        isClient  && sellerPubkey && totalAmount > 0 
                            ? 'cursor-pointer bg-white text-black hover:bg-gray-100' 
                            : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    }`} 
                    onClick={handlePayment}
                    disabled={!isClient || !sellerPubkey || totalAmount <= 0}
                >
                    {!isClient ? 'Loading...' :
                     !walletAdapter.publicKey ? 'Connect Wallet First' : 
                     !sellerPubkey ? 'Seller Info Missing' : 
                     totalAmount <= 0 ? 'Invalid Amount' : 
                     'Proceed to Payment'}
                </button>
            </div>
        </div>
    );
}