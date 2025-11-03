"use client";
import { AnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSellerPubkey } from "../cart/page";
import { Appbar } from "../Components/Appbar";
import { Escrow } from "@/sdk/mint";
import { getSolPrice } from "../utils/getSolPrice";
import { Dot, ShoppingBagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { BiSolidCube } from "react-icons/bi";
import SolanaPayQR from "../Components/SolanaPayQR";
import { MdDone } from "react-icons/md";
import { motion } from "framer-motion";


export default function PaymentPage() {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const [orderPda,setOrderPda] = useState<PublicKey | undefined>(undefined);
  const [paymentPda,setPaymentPda] = useState<PublicKey | undefined>(undefined);
  const [sol,setSol] = useState<String | undefined>(undefined);
  const [paymentSuccess,setPaymentSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const walletAdapter = useWallet();
  const { sellerPubkey } = useSellerPubkey();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    try {
      const amount = Number(localStorage.getItem("totalAmount"));
      setTotalAmount(amount);
      console.log("Seller PublicKey:", sellerPubkey);
      console.log("Total Amount ($):", amount, "$");

      (async () => {
        const lamports = await getSolPrice(amount);
        setSol((lamports / LAMPORTS_PER_SOL).toFixed(2));
        console.log("Total Amount (SOL):", (lamports / LAMPORTS_PER_SOL).toFixed(2));
      })();
    } catch (error) {
      console.warn("No total amount found");
      setTotalAmount(0);
    }
  }, [sellerPubkey]);

  const handlePayment = useCallback(async () => {
    if (!sellerPubkey) return toast.error("Seller information not available");
    if (!totalAmount || totalAmount <= 0) return toast.error("Invalid total amount");
    if (!walletAdapter?.publicKey) return toast.error("Wallet not connected");

    const escrow = new Escrow(walletAdapter);

    try {
      const result = await escrow.initMint(
        walletAdapter as AnchorWallet,
        walletAdapter.publicKey,
        new PublicKey(sellerPubkey)
      );
      if (!result.success) throw new Error(result.error);

      ;(window as any).__last_mint = result.mint
      toast.success("Minted Successfully");
      console.log("Mint Details:", result);

      const payment = await escrow.initPayment(
        walletAdapter as AnchorWallet,
        totalAmount
      );
      if (!payment.success) throw new Error(payment.error);

      toast.success("Payment Initialized Successfully");
      console.log("Payment Details:", payment.payment);

      const initEscrow = await escrow.initEscrow(
        walletAdapter as AnchorWallet,
        new PublicKey(sellerPubkey),
        walletAdapter.publicKey,
        totalAmount,
        new PublicKey(result.mint)
      );
      if (!initEscrow.success) throw new Error(initEscrow.error);

      toast.success("Escrow Initialized Successfully");
      console.log("Escrow Details:", initEscrow.escrowPda);

      const deposit = await escrow.initEscrowDeposite(1, walletAdapter as AnchorWallet, new PublicKey(result.mint));
      if (!deposit.success) throw new Error(deposit.error);
      setWithdraw(true);
      toast.success("Funds Deposited Successfully");
      console.log("Deposit Details:", deposit.data);

      setShowConfirmation(true);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : JSON.stringify(error, null, 2);
      toast.error(`Transaction failed: ${msg}`);
      console.error(error);
    }
  }, [sellerPubkey, totalAmount, walletAdapter]);

  const handleWithdraw = useCallback(async () => {
    if (!walletAdapter?.publicKey || !sellerPubkey) return;
    const escrow = new Escrow(walletAdapter);
    try {
      const mintStr = (window as any).__last_mint as string | undefined;
      if (!mintStr) throw new Error("Mint not found. Please run payment again.");
      const res = await escrow.initEscrowWithdraw(
        1,
        walletAdapter as AnchorWallet,
        new PublicKey(sellerPubkey),
        new PublicKey(mintStr)
      );

      if (res.success) {
        toast.success("Withdrawal Successful...");
        setWithdraw(false);
        setShowConfirmation(false);
        try {
          const res = await escrow.initOrder(walletAdapter as AnchorWallet);
        
          if (res.success) {
            toast.success("Order Placed Successfully.");
        
            if (res.payment) setPaymentPda(new PublicKey(res.payment));
            if (res.order) setOrderPda(new PublicKey(res.order));
            setPaymentSuccess(true);
            try {
              const closeRes = await escrow.closePayment(walletAdapter as AnchorWallet);
              if (closeRes.success) {
                toast.success("Payment Closed");
                router.push(`/order/${res.order?.toString()}`)
              } else {
                toast.error("Failed to close payment.");
              }
            } catch (err: any) {
              toast.error(`Failed to close payment: ${err.message}`);
            }
        
          } else {
            toast.error(`Order failed: ${res.error}`);
          }
        
        } catch (err: any) {
          console.error(err);
          toast.error(`Order failed: ${err.message}`);
        }
        
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Withdrawal failed, please retry");
    }
  }, [walletAdapter, sellerPubkey]);


  useEffect(() => {
    if (withdraw) handleWithdraw();
  }, [withdraw, handleWithdraw]);

  return (
    <div>
      <Appbar />
      <div className="flex flex-col justify-center items-center h-screen gap-5">
        <div className="w-96 flex flex-col justify-between px-6 py-3 bg-slate-50 rounded-xl">
          <div className="flex justify-start">
            <div className="flex flex-col items-center gap-1">
              <div className="w-full flex items-center justify-start gap-1">
                <ShoppingBagIcon size={20} className="text-zinc-800" />
                <h1 className="font-bold text-xl text-zinc-800">blockBazzar</h1>
              </div>
              <div className="w-full flex flex-col justify-start py-3">
                <div>
                  <p className="text-2xl font-bold text-zinc-800">{sol} SOL</p>
                </div>
                <p className="inline-flex items-center text-zinc-800 font-bold text-md">
                  Network<Dot className="-mx-1"/>SOL<span className="text-zinc-400">(SPL)</span>
                </p>
              </div>
            </div>

          </div>
          <div>
            <SolanaPayQR recipient={sellerPubkey.toString()} amount={sol ? Number(sol) : undefined} label="BlockBazzar"/>
          </div>
          <div className="flex items-center justify-center bg-zinc-900 rounded-xl py-2 gap-1 font-bold">
            <BiSolidCube/>
            <button className="cursor-pointer" onClick={handlePayment}>Pay</button>
          </div>
          {paymentSuccess && (
            <div className="flex items-center justify-center bg-zinc-900 rounded-xl py-2 gap-1 font-bold text-green-700 ">
              <motion.div
              initial={{opacity:0, y:20}}
              animate={{opacity:1, y:0}} 
              transition={{duration:0.2}}
              className="flex items-center gap-1"
              >
                <MdDone/>
                <button onClick={handlePayment}>Paid</button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
