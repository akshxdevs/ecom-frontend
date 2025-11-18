"use client"; 

import { Appbar } from "@/app/Components/Appbar";
import { ArrowLeftIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { MdDone } from "react-icons/md";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { fetchCart, fetchCartList } from "ecom-sdk";

interface Cart {
  productName: string;
  amount: any;
  sellerPubkey: string;
  productImgurl: string;
  quantity: number;
}



export default function(){
    const [error, setError] = useState<string | null>(null);
    const [cart, setCart] = useState<Cart[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const router = useRouter();
    const { publicKey, signAllTransactions, signTransaction } = useWallet();
    const orderId = useParams();
    const ID = orderId.OrderId;
    const date = new Date();
    const month = date.toLocaleString("en-US",{month:"short"});
    const day = date.getDate()
    console.log({date});
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
        if (result.success && result.cart) {
            const cartList = result.cart.cartList || [];
            const totalAmount = Number(result.cart.totalAmount || 0);
            setTotalAmount(Math.floor(totalAmount/100));

            const items = await Promise.all(
            cartList.map(async (cartKeyObj: string) => {
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
                } as Cart;
                } catch (err) {
                console.error("Error converting or fetching cart/product:", err);
                return null;
                }
            })
            );

            const validItems = items.filter(Boolean) as Cart[];
            setCart(validItems);
        } else {
            console.log("No products found or error occurred:", result.error);
            setTotalAmount(0);
        }
        } catch (err: any) {
        console.error("Error loading products:", err);
        setCart([]);
        setTotalAmount(0);
        setError(err.message || "Failed to load products");
        console.log(error);
        }
    };

    useEffect(() => {
        if (publicKey) {
        loadCartList();
        }
    }, [publicKey]);
    return(
        <div>
            <Appbar/>
            <div className="max-w-5xl mx-auto my-20">
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
                        <div className="flex flex-col bg-white/95 rounded-xl px-4 py-5 my-10">
                            <h1 className="text-lg font-bold text-black">Order Status</h1>
                            <p className="text-sm text-gray-800">{"Placed"}</p> 
                            <h1 className="text-lg font-bold text-black pt-4">OrderTracking Status</h1>
                            <p className="text-sm text-gray-800">{"Booked"}</p>
                        </div>
                    </div>
                    <div className="max-w-[40%] w-full bg-white/95 rounded-xl self-start">
                        {cart.map((product, index) => (
                            <div className="flex justify-between items-center gap-4 p-8">
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