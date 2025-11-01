"use client";
import { fetchCart, fetchCartList } from "@/sdk/program";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import { Appbar } from "../Components/Appbar";
import { IoBagCheckOutline } from "react-icons/io5";
import { BiMoney } from "react-icons/bi";
import localFont from "next/font/local";
import { Dot, MinusCircleIcon, PlusCircleIcon, Trash } from "lucide-react";

const myFont = localFont({
  src: '../../public/fonts/Palmore.otf',
});
const myFont2 = localFont({
  src: '../../public/fonts/PalmoreLight.ttf',
});

interface Cart {
  productName: string;
  amount: any;
  sellerPubkey: string;
  productImgurl: string;
  quantity: number;
}

interface SellerPublicKey{
  sellerPubkey:PublicKey;
  setSellerPubkey:(value:any)=>void;
}

export const SellerPubkeyContext = createContext<
  SellerPublicKey | undefined
>(undefined);

export const SellerPubkeyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sellerPubkey, setSellerPubkey] = useState<any>(()=>{
    if (typeof window !== "undefined"){
      const stored = localStorage.getItem("sellerPubkey");
      return stored ? JSON.parse(stored) : [];
    }return [];
  });

  useEffect(()=>{
    if (sellerPubkey.length > 0) {
      localStorage.setItem("sellerPubkey",JSON.stringify(sellerPubkey));
    }
  },[sellerPubkey])

  return (
    <SellerPubkeyContext.Provider value={{ sellerPubkey, setSellerPubkey }}>
      {children}
    </SellerPubkeyContext.Provider>
  );
};

export const useSellerPubkey = () => {
  const context = useContext(SellerPubkeyContext);
  if (context === undefined) {
    throw new Error("useCartLength must be used within a sellerPubkeyProvider");
  }
  return context;
};


export default function Cart() {
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const {sellerPubkey,setSellerPubkey} = useSellerPubkey();
  const [quantities,setQuantities] = useState<{[key:string]:number}>({});
  const router = useRouter();
  const { publicKey, signAllTransactions, signTransaction } = useWallet();


  const handleInc = (pubkey:string) => {
    setQuantities(prev => ({
      ...prev,
      [pubkey]: (prev[pubkey] || 0) + 1,
    }));
  };

  const handleDinc = (pubkey:string) => {
    setQuantities(prev =>({
      ...prev,
      [pubkey]:Math.max((prev[pubkey] ||0) -1, 1),
    }));
  };


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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (publicKey) {
      loadCartList();
    }
  }, [publicKey]);
  
  
  useEffect(()=>{
    if (cart && cart.length > 0) {
      const sellerPubkeys = cart.map((pubkey)=>pubkey.sellerPubkey);
      const uniqueSellerPubkeys = [...new Set(sellerPubkeys)];
      setSellerPubkey(uniqueSellerPubkeys);
      console.log("Seller publicKey: ",sellerPubkey);  
    }
  },[cart]);

  useEffect(() => {
    console.log("Updated Seller PubKeys:", sellerPubkey);
  }, [sellerPubkey]);

  return (
    <div>
      <Appbar/>
      <div className="flex flex-col p-16">
      <h1 className={`${myFont.className} text-6xl`}>
          Your Cart
      </h1>        
      {cart.map((product, index) => (
          <motion.div
            key={index}
            className=" my-5 p-2 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between p-2">
              <div className="max-w-[50%] w-full flex flex-col gap-4">
                <div className="text-sm font-normal text-center border-b border-zinc-700 pb-2">
                  <h1>PRODUCT</h1>
                </div>
                <div className="flex gap-10">
                {product.productImgurl ? (
                    <img
                      src={product.productImgurl || "https://example.com/iphone.jpg"}
                      alt={product.productName}
                      className="h-32 w-32  object-fill"
                    />
                  ) : (
                    <div className="text-gray-400 text-6xl">📦</div>
                  )}
                  <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {product.productName}
                      </h3>
                      <p className="text-sm font-normal text-slate-300">
                        $ {Math.floor(Number(product.amount)/100).toFixed(2)} 
                      </p>
                      <p className="text-sm font-normal text-slate-300">Color: {"Color"}</p>
                      <p className="text-sm font-normal text-slate-300" >Storage: {"256"}</p>
                  </div>
                </div>
              </div>
              <div className="max-w-[25%] w-full h-[172px] flex flex-col">
                <h1 className="text-sm font-normal text-center border-b border-l border-r border-zinc-700 pb-2">QUANTITY</h1>
                <div className="flex items-center justify-center h-screen gap-4">
                  <div className="px-4 py-2 w-28 flex items-center gap-2 border border-zinc-800 rounded-sm">
                    <button onClick={()=>handleInc(String(product.productName))}>
                      <PlusCircleIcon size={25}/>
                    </button>
                    <p>{quantities[String(product?.productName)] || 1}</p>
                    <button onClick={()=>handleDinc(String(product?.productName))}>
                      <MinusCircleIcon size={25}/>
                    </button>
                  </div>
                  <div>
                    <button><Trash size={20}/></button>
                  </div>
                </div>
              </div>
              <div className="max-w-[25%] w-full h-[172px] flex flex-col">
                <h1 className="text-sm font-normal text-center border-b border-zinc-700 pb-2">TOTAL</h1>
                <span className="flex justify-center items-center h-screen text-lg fon-normal text-slate-100">
                  $ {Math.floor(Number(product.amount)/100).toFixed(2)}
                </span>
              </div>
            </div>

          </motion.div>
        ))}
        <div className="relative h-[200px] px-10 border-t border-b border-zinc-800">
          <div className="absolute bottom-0 right-0 py-5 px-4">
            <h1 className="flex items-center gap-1 text-xl font-bold text-slate-200">
              <Dot size={30}/>Estimated total $ {totalAmount.toFixed(2)}
            </h1>
            <div className="pt-6 pb-3">
              <p className="text-sm text-gray-500">Taxes, discounts and shipping calculated at</p>
              <p className="text-sm text-gray-500 flex justify-end">checkout.</p>
            </div>
            <button
              onClick={() => {
                router.push("/checkout");
                localStorage.setItem("totalAmount", totalAmount.toString());
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-2 py-1 border bg-white rounded-lg text-black font-semibold"
            >
              Check Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
