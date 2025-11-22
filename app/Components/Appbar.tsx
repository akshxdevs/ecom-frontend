"use client";
import WalletConnect from "./WalletConnect";
import {  BellIcon, Dot, Menu,  PlusSquareIcon, RedoDot, SearchIcon, ShoppingBagIcon, Wallet2Icon } from "lucide-react";
import { AnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import localFont from "next/font/local"; 
import { Escrow } from "ecom-sdk";
import {PublicKey} from "@solana/web3.js"
import { useWithdrawStore } from "../store/useWithdrawStore";
import toast from "react-hot-toast";
import { useVaultState } from "../store/vaultStore";
import { useSellerState } from "../store/sellerPubkeyStore";

const myFont = localFont({
    src: '/../../public/fonts/Palmore.otf',
});

export const Appbar = () => {
    const { publicKey } = useWallet();
    const connection = new Connection(clusterApiUrl("devnet"));
    const [balance,setBalance] = useState<number>(0.0013);
    const router = useRouter();
    const withdrawTrue = useWithdrawStore((s) => s.withdrawTrue);
    const setWithdrawTrue = useWithdrawStore((s) => s.setWithdrawTrue);
    const walletAdapter = useWallet();
    const [notificationModel, setShowNotificationModel] = useState(false);
    const sellerPubkey = useSellerState((s)=>s.sellerPubkey);
    const params = useParams();
    const orderId = params.OrderId as string; 
    const shortId = (id: string) => id.slice(0, 8) + "...";
    const displayId = orderId ? shortId(orderId) : "";
    const vaultPda = useVaultState((s)=>s.vault);
    const vaultStatePda = useVaultState((s)=>s.stateVault);
    const [paymentPda, setPaymentPda] = useState<string | undefined>(undefined);
    const [escrowPda, setEscrowPda] = useState<PublicKey | undefined>(undefined);
    const [closeAccounts,setCloseAccounts] = useState(false);

    useEffect(()=>{
        fetchBalance();
    },[publicKey]);

    const fetchBalance = async() => {
        try {
            if(!publicKey) throw new Error("Wallet not connected..")
            const lamports = (await connection.getBalance(publicKey));
            setBalance(lamports/1_000_000_000);
        } catch (error) {
            
        }
    };
    const withdrawlEscrow = async() => {
        if (!sellerPubkey) return toast.error("Seller information not available");
        console.log({sellerPubkey});
        
        const escrow = new Escrow(walletAdapter);
        try {
            if (!vaultStatePda) return;
            if (!vaultPda) return;
            console.log({vaultPda});
            console.log({vaultStatePda});
            console.log({escrowPda});
            console.log({paymentPda});
            const result = await escrow.initEscrowWithdraw(
                1,
                walletAdapter as AnchorWallet,
                new PublicKey(sellerPubkey),
                new PublicKey(vaultStatePda),
                new PublicKey(vaultPda),
            );
            if (result.success) {
                toast.success("Withdrwal success!");
                if (result.paymentPda) setPaymentPda(result.paymentPda);
                if (result.escrowPda) setEscrowPda(new PublicKey(result.escrowPda));
                setWithdrawTrue(false);
                setCloseAccounts(true);
            };
        } catch (error) {
            toast.error((error as Error).message);
            closeAccount();
            console.error(error);
        }
    }
    console.log({vaultPda});
    console.log({vaultStatePda});
    console.log({escrowPda});
    console.log({paymentPda});
    const closeAccount = async() => {
        const escrow = new Escrow(walletAdapter);
        console.log({vaultPda});
        console.log({vaultStatePda});
        console.log({escrowPda});
        console.log({paymentPda});
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
      const closeOrder = async() => {
        const escrow = new Escrow(walletAdapter);
        if (!paymentPda || !escrowPda || !vaultPda || !vaultStatePda) throw new Error("PDA messing...")
        const result = await escrow.closeOrder(
          walletAdapter as AnchorWallet,
        );
        if (result.success) {
          toast.success("PDA's closed successfully..")
        }else{
          console.log(result.error);
          toast.error("Failed to closed Account");
        }
      }

      useEffect(() => {
        if (!closeAccounts) return console.log("Not ready yet!"); 
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 500;
          if (paymentPda && escrowPda && vaultPda && vaultStatePda) {
            closeAccount();
            closeOrder();
            clearInterval(interval);
          }
          if (elapsed >= 30000) {
            console.log("Timeout: PDAs not found in 30s");
            clearInterval(interval);
          }
        }, 500);
        return () => clearInterval(interval); // cleanup
      }, [paymentPda, escrowPda, vaultPda, vaultStatePda]);
      

    return (
            <div className="max-w-6xl w-full mx-auto p-2">
                <div className="flex justify-between items-center gap-16">
                    <div onClick={()=>router.push("/")} className="flex items-center gap-1">
                        <ShoppingBagIcon size={20}/>
                        <h1 className={`${myFont.className} hidden md:block font-bold text-3xl cursor-pointer text-blue-300`}>blockBazzar</h1>
                    </div>
                    <div className="w-full flex items-center gap-2 md:gap-4">
                        <div className="px-2 md:flex items-center gap-1 w-[35%] outline-none focus:outline-none focus:border-blue-600 md:bg-[#223351] rounded-md">
                            <SearchIcon size={19} className="text-gray-300"/>
                            <input
                                type="text"
                                placeholder="Search"
                                className="hidden md:block w-full text-md py-1 outline-none border-none"
                            />
                        </div>
                        <button onClick={()=>router.push("/createproduct")} className="hidden md:flex items-center text-slate-400 gap-2 p-2 text-sm font-semibold border-2 border-blue-900 rounded-lg hover:text-slate-100">
                            <PlusSquareIcon size={18} />
                            List a product
                        </button>
                        <button className="hidden md:flex items-center gap-2 p-2 text-sm font-medium border border-zinc-800 rounded-lg hover:border-blue-900 ">
                            <Wallet2Icon size={18} />
                                $ {balance.toFixed(4)}
                        </button>
                        <button className="hidden md:flex items-center gap-2 p-2 text-sm font-medium border border-zinc-800 rounded-lg hover:border-blue-900 ">
                            🪙 
                            <p className="px-1">{"0"}</p>
                        </button>
                        <div>
                            <WalletConnect/>
                        </div>
                        <div onClick={()=> setShowNotificationModel((prev)=>!prev)} className="flex border pl-2 pr-3 py-2 rounded-md border-zinc-800 hover:border-blue-900">
                            <div className="absolute top-0">
                                {withdrawTrue ? (
                                    <Dot size={40} className="text-red-500"/>
                                ): ""}
                            </div>
                            {notificationModel && (
                                <div className="absolute right-32 top-12 bg-zinc-900 py-5 border border-zinc-600 rounded-xl px-4">
                                    <div className="flex justify-between gap-4">
                                        <div>
                                            <h1 className="text-sm">Order ID</h1>
                                            <p className="text-xs">{displayId}</p>
                                        </div>
                                        <div>
                                            <button className="w-20 cursor-pointer px-2 py-1 bg-white rounded-xl text-black text-xs" onClick={withdrawlEscrow}>Withdraw Funds</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <BellIcon size={18}/>
                        </div>
                        <div className="border p-2 rounded-md border-zinc-800 hover:border-blue-900">
                            <Menu size={18}/>
                        </div>
                    </div>
                </div>
            </div>
        );
}