"use client";
import { AnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSellerPubkey } from "../cart/page";
import { Appbar } from "../Components/Appbar";
import { getSolPrice } from "../utils/getSolPrice";
import { Dot, ShoppingBagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { BiSolidCube } from "react-icons/bi";
import SolanaPayQR from "../Components/SolanaPayQR";
import { MdDone } from "react-icons/md";
import { motion } from "framer-motion";
import { Escrow } from "@/ecom-sdk/escrow";


export default function PaymentPage() {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const [orderPda, setOrderPda] = useState<PublicKey | undefined>(undefined);
  const [paymentPda, setPaymentPda] = useState<string | undefined>(undefined);
  const [escrowPda, setEscrowPda] = useState<PublicKey | undefined>(undefined);
  const [vaultStatePda, setVaultStatePda] = useState<PublicKey | undefined>(undefined);
  const [vaultPda, setVaultPda] = useState<PublicKey | undefined>(undefined);

  const [sol, setSol] = useState<string | undefined>(undefined);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelBtn,setShowCancelBtn] = useState(false);
  const walletAdapter = useWallet();
  const { sellerPubkey } = useSellerPubkey();
  const router = useRouter();

  const normalizedSellerPubkey = useCallback(() => {
    if (!sellerPubkey) return undefined;
    if (Array.isArray(sellerPubkey)) {
      return sellerPubkey.length > 0 ? sellerPubkey[0] : undefined;
    }
    return sellerPubkey;
  }, [sellerPubkey]);

  const sellerPubkeyString = normalizedSellerPubkey()?.toString();

  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;

    try {
      const amount = Number(localStorage.getItem("totalAmount"));
      if (amount && amount > 0) {
        setTotalAmount(amount);
        (async () => {
          const lamports = await getSolPrice(amount);
          setSol((lamports / LAMPORTS_PER_SOL).toFixed(2));
        })();
      }
    } catch (error) {
      console.warn("No total amount found");
      setTotalAmount(0);
    }
  }, []);

  const handlePayment = (async () => {
    const sellerKey = sellerPubkeyString;
    if (!sellerKey) return toast.error("Seller information not available");
    if (!totalAmount || totalAmount <= 0) return toast.error("Invalid total amount");
    if (!walletAdapter?.publicKey) return toast.error("Wallet not connected");

    const escrow = new Escrow(walletAdapter);
    try {
      const payment = await escrow.initPayment(
        walletAdapter as AnchorWallet,
        totalAmount
      );
      if (payment.success){
      toast.success("Payment Initialized Successfully")
      }else{ 
        throw new Error(payment.error)
      }
    } catch (error) {
      toast.error(`Transaction failed: ${(error as Error).message}`);
      console.error(error);
    }
    try {
      const initEscrow = await escrow.initEscrow(
        walletAdapter as AnchorWallet,
        new PublicKey(sellerKey),
        totalAmount,
      );
      if (initEscrow.success){
        toast.success("Escrow Initialized Successfully")
        }else{ 
          throw new Error(initEscrow.error)
        }
    } catch (error) {
      toast.error(`Transaction failed: ${(error as Error).message}`);
      console.error(error);
    }
    try {
      const deposit = await escrow.initEscrowDeposite(walletAdapter as AnchorWallet);
      if (deposit.success){
        toast.success("Payment Done Successfully");
        if (deposit.payment) setPaymentPda(deposit.payment);
        if (deposit.escrow) setEscrowPda(new PublicKey(deposit.escrow));
        if (deposit.vaultState) setVaultStatePda(new PublicKey(deposit.vaultState));
        if (deposit.vault) setVaultPda(new PublicKey(deposit.vault));
        await escrow.initOrder(walletAdapter as AnchorWallet).then((order)=>{
          if (order.success) toast.success("Order Placed Successfully..")
            const OrderId = order.orderId
            router.push(`/order/${OrderId}`)
           setTimeout(() => {
            closeAccount();
           }, 10000);
        }).catch((err)=>{
          console.log("Order Failed",(err as Error).message);
          toast.error("Failed to place order..")
        }); 
      }else{ 
          throw new Error(deposit.error)
        }
    } catch (error) {
      toast.error(`Transaction failed: ${(error as Error).message}`);
      console.error(error);
    }
  });

  const closeAccount = async() => {
    const escrow = new Escrow(walletAdapter);
    console.log(paymentPda?.toString());
    console.log(escrowPda?.toString());
    console.log(vaultStatePda?.toString());
    console.log(vaultPda?.toString());
    if (!paymentPda || !escrowPda || !vaultPda || !vaultStatePda) throw new Error("PDA messing...")
    const result = await escrow.closeAccounts(
      walletAdapter as AnchorWallet,
      new PublicKey(paymentPda),
      new PublicKey(escrowPda),
      new PublicKey(vaultStatePda),
      new PublicKey(vaultPda),
    );
    if (result.success) {
      toast.success("PDA's closed successfully..")
    }else{
      console.log(result.error);
      toast.error("Failed to closed Account");
    }
  }


  if (!isClient || !sellerPubkeyString) {
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
                    <p className="text-2xl font-bold text-zinc-800">Loading...</p>
                  </div>
                  <p className="inline-flex items-center text-zinc-800 font-bold text-md">
                    Network<Dot className="-mx-1"/>SOL<span className="text-zinc-400">(SPL)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
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
                  <p className="text-2xl font-bold text-zinc-800">{sol || "0.00"} SOL</p>
                </div>
                <p className="inline-flex items-center text-zinc-800 font-bold text-md">
                  Network<Dot className="-mx-1"/>SOL<span className="text-zinc-400">(SPL)</span>
                </p>
              </div>
            </div>
          </div>
          <div>
            <SolanaPayQR 
              recipient={sellerPubkeyString} 
              amount={sol ? Number(sol) : undefined} 
              label="BlockBazzar"
            />
          </div>
          <div className="flex items-center justify-center bg-zinc-900 rounded-xl py-2 gap-1 font-bold">
            <BiSolidCube/>
            <button className="cursor-pointer" onClick={()=>{
              handlePayment()
              setShowCancelBtn(true)}}>Pay</button>
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
