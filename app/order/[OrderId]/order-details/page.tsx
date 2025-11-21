"use client"; 

import { Appbar } from "@/app/Components/Appbar";
import { ArrowLeftIcon, RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { MdDone } from "react-icons/md";
import { AnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Escrow, fetchCart, fetchCartList } from "ecom-sdk";
import toast from "react-hot-toast";
import bytesToUuid from "ecom-sdk/utils/uuidConverter";
import { useWithdrawStore } from "@/app/store/useWithdrawStore";

interface CartItem {
  productName: string;
  amount: any;
  sellerPubkey: string;
  productImgurl: string;
  quantity: number;
}

export default function(){
    const [error, setError] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const router = useRouter();
    const { publicKey, signAllTransactions, signTransaction } = useWallet();
    const orderId = useParams();
    const ID = orderId.OrderId;
    const date = new Date();
    const month = date.toLocaleString("en-US",{month:"short"});
    const day = date.getDate()
    const [loading,setLoading] = useState<string>("");
    const walletAdapter = useWallet();
    const [orderStatus,setOrderStatus] = useState<string | undefined>(undefined);
    const [trackingId,setTrackingId] = useState<number[] | undefined>(undefined);
    const [paymentId,setPaymentId] = useState<string | undefined>(undefined);
    const [orderTrackingStatus,setOrderTrackingStatus] = useState<string | undefined>(undefined);
    const setWithdrawTrue = useWithdrawStore((s) => s.setWithdrawTrue);

    const loadCartList = async () => {
        const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions,
        };

        if (!publicKey) {
        setError("Please connect your wallet first");
        return;
        }
        setError(null);

        try {
            const result = await fetchCartList(walletAdapter);
            if (!result.success || !result.cart) {
                setCart([]);
                setTotalAmount(0);
                return;
            }
            const cartList = result.cart.cartList || [];
            const totalAmount = Math.floor(Number(result.cart.totalAmount || 0) / 100);

            const rawItemsPromises = cartList.map(async (cartKeyObj: string) => {
            if (!cartKeyObj) return null;
            try {
                const cartKey = new PublicKey(cartKeyObj);
                const cartPubkeyString = cartKey.toBase58();
                const cartDetails = await fetchCart(cartPubkeyString, walletAdapter);
                if (!cartDetails?.success || !cartDetails?.data) return null;

                const data = cartDetails.data as any;

                return {
                productName: data.productName ?? "",
                amount: data.price ?? data.amount ?? 0,
                sellerPubkey:
                    typeof data.sellerPubkey === "string"
                    ? data.sellerPubkey
                    : new PublicKey(data.sellerPubkey).toBase58(),
                productImgurl: data.productImgurl ?? "",
                quantity: Number(data.quantity ?? 1),
                cartPubkey: cartPubkeyString,
                } as CartItem;
            } catch (err) {
                console.error("Error fetching cart item:", err);
                return null;
            }
            });

            const rawItems = (await Promise.all(rawItemsPromises)).filter(Boolean) as CartItem[];

            const groupedMap = new Map<string, CartItem>();

            rawItems.forEach(item => {
            const key = `${item.sellerPubkey}-${item.productName}`;
            if (groupedMap.has(key)) {
                const existing = groupedMap.get(key)!;
                existing.quantity += item.quantity;
            } else {
                groupedMap.set(key, { ...item });
            }
            });

            const groupedItems = Array.from(groupedMap.values());

            setCart(groupedItems);
            setTotalAmount(totalAmount);

        } catch (err: any) {
            console.error("Error loading cart:", err);
            setCart([]);
            setTotalAmount(0);
            setError(err.message || "Failed to load cart");
        }
    };

    useEffect(() => {
        if (publicKey) {
            loadCartList();
            fetchOrderStatus();
        }
    }, [publicKey]);
    
    const SmallLoader = () => {
        return (
            <div className="loader"></div>
        );
    };

    useEffect(()=>{
        if (orderTrackingStatus === "delivered") {
            setWithdrawTrue(true);
        }
    },[orderTrackingStatus])

    const fetchOrderStatus = async() =>{
        const escrow = new Escrow(walletAdapter as AnchorWallet);
        try {
            const result = await escrow.fetchOrderStatus(walletAdapter as AnchorWallet);
            toast.success("Order status fetched!");
            const getAnchorEnum = (e: any): string => {
                if (!e || typeof e !== "object") return "";
                return Object.keys(e)[0];
              };
              setOrderStatus(getAnchorEnum(result.orderStatus));
              setOrderTrackingStatus(getAnchorEnum(result.orderTracking).toLowerCase());
              setPaymentId(result.orderDetails?.paymentId);
              setTrackingId(result.orderDetails?.trackingId);
              setLoading("");
              
        } catch (error) {
            console.log("Failed: ",(error as Error).message);
            console.error(error);
        }
    };

    return(
        <div>
            <Appbar/>
            <div className="max-w-5xl mx-auto my-10">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button onClick={()=>router.push("/products")}><ArrowLeftIcon className="text-slate-500"/></button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold">Order <span>#{ID}</span></h1>
                            <p className="text-sm text-gray-400">Confirmed {day} {month}</p>
                        </div>
                    </div>
                    <div>
                        <button className="px-4 py-2 bg-white/90 text-black text-md font-normal rounded-xl">Buy again</button>
                    </div>
                </div>
                <div  className="flex justify-between items-center my-5 gap-4 ">
                    <div className="max-w-[60%] w-full self-start">
                        <div className="flex gap-2 bg-white/95 rounded-xl px-4 py-5">
                            <MdDone size={25} className="text-green-700"/>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-bold text-black">Confirmed</h1>
                                <p className="text-sm text-gray-600">{day} {month}</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center bg-white rounded-xl px-4 py-5 my-2">
                            <img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQsRWPSKAOyE_NxBnffZjoAUcpwylqhWJWweBaIKwYhdSLcuVxA" alt="" className="h-32 w-32"/>
                            <div className="flex flex-col items-center justify-center ">
                                <button className="pb-2" onClick={()=>{
                                        setLoading("order")
                                        fetchOrderStatus()
                                    }}>{
                                        loading === "order" ? 
                                        <SmallLoader/> : 
                                        <RefreshCcw size={25} className="text-black"/>
                                        }
                                </button>
                                <h1 className="text-xl font-bold text-black">Order Status</h1>
                                <p className="text-md text-gray-800">{orderStatus === "placed" ? "package is on the way" : ""}</p>  
                            </div>
                            <div className="px-8 pt-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-bold text-black">Payment ID: </p>
                                    <p className="text-sm text-gray-800">{paymentId}</p>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <p className="text-lg font-bold text-black">Tracking ID: </p>
                                    <p className="text-sm text-gray-800">  
                                        {Array.isArray(trackingId) && trackingId.length >= 16 
                                        ? bytesToUuid(trackingId) 
                                        : "No tracking ID"}</p>    
                                </div>
                            </div>
                            <div className="flex flex-col gap- items-center justify-center pt-1">
                                <button className="px-4 py-2 my-2 bg-zinc-800 rounded-xl text-white">Track Order</button>
                                <p className="text-sm text-green-600">{orderTrackingStatus === "booked" ? "Your order is booked and confirmed" : ""}</p>
                                <p className="text-sm text-green-600">{orderTrackingStatus === "intransit" ? "Your order is confirmed and in transit" : ""}</p>
                                <p  className="text-sm text-green-600">{orderTrackingStatus === "shipped" ? "Your order is confirmed and shipped" : ""}</p>
                                <p  className="text-sm text-green-600">{orderTrackingStatus === "outfordelivery" ? "Your order is out for delivery" : ""}</p>
                                <p  className="text-sm text-green-600">{orderTrackingStatus === "delivered" ? "Your order is delivered" : ""}</p>
                            </div>                         
                        </div>
                    </div>
                    <div className="max-w-[40%] w-full bg-white/95 rounded-xl self-start">
                        {cart.map((product, index) => (
                            <div key={index} className="flex justify-between items-center gap-4 p-8">
                                <div>
                                    {product.productImgurl ? (
                                        <img
                                        src={product.productImgurl || "https://example.com/iphone.jpg"}
                                        alt={product.productName}
                                        className="h-28 w-28  object-fill"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-6xl">📦</div>
                                    )}
                                    <h1 className="w-1/4 relative bottom-32 bg-zinc-700 text-slate-200 rounded-md flex justify-center items-center">{product.quantity}</h1>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {product.productName}
                                    </h3>
                                    <p className="text-sm font-normal text-slate-700">{"Color"}</p>
                                    <p className="text-sm font-normal text-slate-600" >{"256"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        $ {Math.floor(Number(product.amount)/100).toFixed(2)} 
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="p-8">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-bold text-black">Subtotal</p>
                                <p className="text-sm text-gray-800">${"100.00"}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-bold text-black">Shipping</p>
                                <p className="text-sm text-gray-800">Free</p>    
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <p className="text-lg font-bold text-black">Total</p>
                                <p className="flex gap-2 text-md font-bold text-slate-900">
                                    <span className="text-gray-400">{"USD"}</span>
                                    {"100.00"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}