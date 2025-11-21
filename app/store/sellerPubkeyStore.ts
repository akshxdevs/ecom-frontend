import {PublicKey} from "@solana/web3.js"
import { create } from "zustand"
interface SellerState {
    sellerPubkey: string[] | null;
    setSellerPubkey: (value:string[]) => void;
}
export const useSellerState = create<SellerState>((set)=>({
    sellerPubkey: null,
    setSellerPubkey: (value) =>(set({sellerPubkey:value}))
}))