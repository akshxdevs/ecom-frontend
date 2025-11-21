"use client";

import { createContext, useContext, useState } from "react";

interface CreateProdContextType {
  showCreateModal: boolean;
  setShowCreateModal: (value: boolean) => void;
}

export const CreateProdContext = createContext<CreateProdContextType | undefined>(undefined);

export function CreateProdProvider({ children }: { children: React.ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <CreateProdContext.Provider value={{ showCreateModal, setShowCreateModal }}>
      {children}
    </CreateProdContext.Provider>
  );
}
export const useShowCreateModal = () => {
  const context = useContext(CreateProdContext);
  if (context === undefined) {
    throw new Error('useShowCreateModal must be used within a CreateProdProvider');
  }
  return context;
};