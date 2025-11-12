"use client";
import { fetchAllProducts, fetchCartList } from "@/ecom-sdk/program";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCartLength } from "@/app/utils/contexts/CartLenContext";

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

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const { setCartLength } = useCartLength();
  const router = useRouter();
  const { publicKey, signAllTransactions, signTransaction } = useWallet();

  const loadAllProducts = async () => {
    if (!publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    setLoadingProducts(true);
    setError(null);

    const walletAdapter = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };
    try {
      const result = await fetchAllProducts(walletAdapter);
      if (result.success && result.products) {
        setProducts(result.products);
      } else {
        console.log("No products found or error occurred:", result.error);
        setProducts([]);
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load products");
      console.log(error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
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
        console.log("CartList Length: ", cartList.length);
        setCartLength(cartList.length);
      } else {
        console.log("No products found or error occurred:", result.error);
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load products");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadCartList();
    loadAllProducts();
  }, [publicKey]);

  const ProductSkeleton = () => (
    <div className="border p-2 border-zinc-900 rounded-xl shadow-lg overflow-hidden bg-zinc-900/50">
      <div className="h-48 bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      <div className="py-4 space-y-3 px-1">
        <div className="h-4 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-md w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
        <div className="h-6 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-md w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );

  if (loadingProducts) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-300">Failed to load products</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-300">No products found</h3>
          <p className="text-gray-500">Be the first to create a product!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.pubkey}
              onClick={() => router.push(`/product/${product.pubkey}`)}
              className="border p-2 border-zinc-900 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className="h-48 flex items-center justify-center"
              >
                {product.productImgurl ? (
                  <img
                    src={
                      product.productImgurl || "https://example.com/iphone.jpg"
                    }
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-xl hover:scale-110 transition-all duration-300 ease-in-out"
                  />
                ) : (
                  <div className="text-6xl">📦</div>
                )}
              </div>
              <div className="py-4">
                <div className="flex flex-col px-1">
                  <h3 className="text-md font-normal">
                    {product.productName}
                  </h3>
                  <span className="text-lg font-bold">
                    $ {Math.round(product.price / 100)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
