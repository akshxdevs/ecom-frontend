"use client";
import { createContext, useContext, useState } from "react";

interface CartLengthContextType {
    cartLength: number;
    setCartLength: (value: number) => void;
  }
  
  export const CartLengthContext = createContext<
    CartLengthContextType | undefined
  >(undefined);
  
  export const CartLengthProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const [cartLength, setCartLength] = useState(0);
    return (
      <CartLengthContext.Provider value={{ cartLength, setCartLength }}>
        {children}
      </CartLengthContext.Provider>
    );
  };
  
  export const useCartLength = () => {
    const context = useContext(CartLengthContext);
    if (context === undefined) {
      throw new Error("useCartLength must be used within a CartLengthProvider");
    }
    return context;
  };