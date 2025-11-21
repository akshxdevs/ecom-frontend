import { create } from "zustand";

interface WithdrawState {
  withdrawTrue: boolean;
  setWithdrawTrue: (value: boolean) => void;
}

export const useWithdrawStore = create<WithdrawState>((set) => ({
  withdrawTrue: false,

  setWithdrawTrue: (value) => set({ withdrawTrue: value }),


}));
