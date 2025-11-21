import {PublicKey} from "@solana/web3.js"
import { create } from "zustand";
interface VaultState {
    stateVault: PublicKey | null;
    setStateVault: (value:PublicKey) => void;
    vault:PublicKey | null;
    setVault: (value: PublicKey) => void;
}


export const useVaultState = create<VaultState>((set)=>({
    vault : null,
    stateVault: null,

    setStateVault: (value) => set({ stateVault: value }),
    setVault:(value) => set({vault:value}) 

})) 

