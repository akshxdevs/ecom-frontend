"use client";

import { PublicKey } from "@solana/web3.js";
import { createContext, useContext, useEffect, useState } from "react";

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