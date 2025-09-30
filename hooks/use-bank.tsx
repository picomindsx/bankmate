"use client";

import { getBanks } from "@/services/bank-service";
import { IBank } from "@/types/common";
import { createContext, useContext, useEffect, useState } from "react";

interface UseBankProps {
  banks?: IBank[];
  setBanks?: (banks: IBank[]) => void;
  fetchBanks?: () => void;
}

export const BankContext = createContext<UseBankProps>({});

export const BankProvider = ({ children }: { children: React.ReactNode }) => {
  const [banks, setBanks] = useState<IBank[]>([]);

  const fetchBanks = async () => {
    await getBanks().then((banks) => setBanks(banks));
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  return (
    <BankContext.Provider value={{ fetchBanks, banks, setBanks }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => useContext(BankContext);
