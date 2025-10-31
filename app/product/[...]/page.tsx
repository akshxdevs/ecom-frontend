"use client";
import { Appbar } from "@/app/Components/Appbar";
import {
  AddToCart,
  fetchCartList,
  fetchProduct,
  fetchCart,
} from "@/sdk/program";
import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { ProductsAppBar } from "@/app/Components/HomePage/ProductsAppBar";
import localFont from "next/font/local";
import { BiDownArrow } from "react-icons/bi";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";

interface Product {
  pubkey: string;
  productId: number[];
  productName: string;
  productShortDescription: string;
  price: number;
  category: any;
  division: any;
  sellerName: string;
  sellerPubkey: string;
  productImgurl: string;
  quantity: number;
  rating: number;
  stockStatus: any;
}





export default function () {
  const params = useParams();
  const productPubkey = Array.isArray(params[""])
    ? decodeURIComponent(params[""][0] || "")
    : "Invalid URL..";

  const { publicKey, signAllTransactions, signTransaction } = useWallet();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<{[key:string]:number}>({});


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
      // console.log("Fetch result from cart:", result);
      if (result.success && result.cart) {
        // console.log("Cart Fetched Successfully: ",result.cart);
        let cartList = result.cart.cartList;
        console.log("Product PublicKey: ", cartList);

        for (let i = 0; i < cartList.length; i++) {
          const cartKeyObj = cartList[i];
          if (!cartKeyObj) continue;

          try {
            const cartKey = new PublicKey(cartKeyObj);
            const cartPubkeyString = cartKey.toBase58();

            console.log("Cart Key (Pubkey):", cartPubkeyString);

            const cartDetails = await fetchCart(
              cartPubkeyString,
              walletAdapter
            );
            console.log("Cart details:", cartDetails.data);

            if (cartDetails.success && cartDetails.data) {
              const sellerPubkey = cartDetails.data.sellerPubkey;
              const productName = cartDetails.data.productName;

              const productPda = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("product"),
                  sellerPubkey.toBuffer(),
                  Buffer.from(productName),
                ],
                new PublicKey("FYo4gi69vTJZJMnNxj2mZz2Q9CbUu12rQDVtHNUFQ2o7")
              )[0];

              console.log("Derived Product PDA:", productPda.toString());

              const productDetails = await fetchProduct(
                productPda.toString(),
                walletAdapter
              );
              console.log("Product details from cart:", productDetails.data);
            }
          } catch (err) {
            console.error("Error converting or fetching cart/product:", err);
          }
        }
        console.log("Total Amount: ", Number(result.cart.totalAmount));
      } else {
        console.log("No products found or error occurred:", result.error);
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load products");
      console.log(error);
    }
  };

  const loadProduct = async () => {
    if (!publicKey) {
      setError("Please connect your wallet first");
      return;
    }
    setLoading(true);
    setError(null);

    const walletAdapter = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };
    try {
      const result = await fetchProduct(productPubkey, walletAdapter);

      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        console.log("No products found or error occurred:", result.error);
        setProduct(null);
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load products");
      console.log(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey && productPubkey) {
      loadProduct();
      loadCartList();
    }
  }, [publicKey, productPubkey]);

  const handleAddToCart = async () => {
    if (!publicKey) return;

    try {
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };

      const cart = await AddToCart(
        walletAdapter,
        product?.sellerPubkey.toString(),
        product?.productName,
        1,
        product?.price,
        product?.productImgurl
      );
      if (cart.success && cart.cartListPda) {
        console.log("Added To Cart Successfully..");
      } else {
        console.log("No products found or error occurred:", cart.error);
        setProduct(null);
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load products");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  // const myFont = localFont({
  //   src: '../public/fonts/Palmore.otf',
  // });
  // const myFont2 = localFont({
  //   src: '../public/fonts/PalmoreLight.ttf',
  // });
  return (
    <div>
      <Appbar />
      <div className="p-16">
        <ProductsAppBar/>
        <div className="flex flex-col items-center justify-center">
          <div className="w-full h-screen p-10 flex justify-between gap-10"> 
            <div>
              <img src={product?.productImgurl} alt=""/>
            </div>
            <div className="max-w-1/2 w-full flex flex-col">
              <h1 className="text-3xl font-bold">{product?.productName}</h1>
              <p className="text-lg text-gray-300">{Math.floor(Number(product?.price)/100)} $</p>
              <div className="w-full flex flex-col mt-2">
                <h1 className="py-1">Color</h1>
                <button className="flex items-center text-lg font-semibold justify-between border rounded-lg px-4 py-2 mb-5">
                  Black
                  <span className="mt-1"><BiDownArrow size={20}/></span>
                </button>
              </div>
              <div className="w-full flex flex-col mb-2">
                <h1 className="py-1">Storage</h1>
                <button className="flex items-center text-lg font-semibold justify-between border rounded-lg px-4 py-2 mb-5">
                  256 Gb
                  <span className="mt-1"><BiDownArrow size={20}/></span>
                </button>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <h1>Quantity</h1>
                <div className="px-4 py-2 w-28 flex items-center gap-2 border rounded-lg">
                  <button onClick={()=>handleInc(String(product?.pubkey))}>
                    <PlusCircleIcon />
                  </button>
                  <p>{quantities[String(product?.pubkey) || 1]}</p>
                  <button onClick={()=>handleDinc(String(product?.pubkey))}>
                    <MinusCircleIcon />
                  </button>
                </div>
              </div>
              <div className="w-full py-10">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-2 rounded-lg bg-zinc-800 font-semibold text-slate-100"
                  >
                    Add To Cart
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
