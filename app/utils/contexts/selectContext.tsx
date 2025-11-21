"use client";
import { createContext, useContext, useState } from "react";

interface Select{
  selected:string ;
  setSelected:(value:string) => void;
}


export const selectContext = createContext<Select | undefined>(undefined);

export function SelectProvider({children}: {children:React.ReactNode}) {
    const [selected,setSelected] = useState("overview");

    return( 
        <selectContext.Provider value={{selected,setSelected}}>{children}</selectContext.Provider>
    );
}

export const useSelector = () => {
    const context = useContext(selectContext);
    if (context === undefined) {
      throw new Error('useSelector must be used within a SelectProvider');
    }
    return context;
}