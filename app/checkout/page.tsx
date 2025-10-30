"use client";
import { AnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSellerPubkey } from "../cart/page";
import { Appbar } from "../Components/Appbar";
import { Escrow } from "@/sdk/mint";
import { getSolPrice } from "../utils/getSolPrice";

export default function PaymentPage() {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const [orderPda,setOrderPda] = useState<PublicKey | undefined>(undefined);
  const [paymentPda,setPaymentPda] = useState<PublicKey | undefined>(undefined);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const walletAdapter = useWallet();
  const { sellerPubkey } = useSellerPubkey();

  useEffect(() => {
    setIsClient(true);
    try {
      const amount = Number(localStorage.getItem("totalAmount"));
      setTotalAmount(amount);
      console.log("Seller PublicKey:", sellerPubkey);
      console.log("Total Amount ($):", amount, "$");

      (async () => {
        const lamports = await getSolPrice(amount);
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
        await escrow.initOrder(walletAdapter as AnchorWallet).then((res)=>{
          if (res.success) {
            toast.success("Order Placed Successfully..");
            if(res.payment) setPaymentPda(new PublicKey(res.payment));
            if(res.order)setOrderPda(new PublicKey(res.order));
          }else{
            toast.error(`Order failed ${res.error}`)
          }
        })
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
        <h1>Total Amount: {totalAmount}$</h1>

        <button
          className={`py-2 px-4 border rounded-lg font-normal ${
            isClient && sellerPubkey && totalAmount > 0
              ? "cursor-pointer bg-white text-black hover:bg-gray-100"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          onClick={handlePayment}
          disabled={!isClient || !sellerPubkey || totalAmount <= 0}
        >
          {!isClient
            ? "Loading..."
            : !walletAdapter.publicKey
            ? "Connect Wallet First"
            : !sellerPubkey
            ? "Seller Info Missing"
            : totalAmount <= 0
            ? "Invalid Amount"
            : "Proceed to Payment"}
        </button>

        {showConfirmation && (
          <button
            className="py-2 px-4 border rounded-lg font-normal bg-white text-black hover:bg-gray-100"
            onClick={() => setWithdraw(true)}
          >
            Confirm Payment
          </button>
        )}
      </div>
    </div>
  );
}
