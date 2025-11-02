"use client";
import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("http://localhost:5000/wallet/balance", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(Number(data.wallet_balance ?? 0));
        }
      } catch (err) {
        console.error("fetchBalance error:", err);
      }
    };
    fetchBalance();
  }, []);

  return (
    <WalletContext.Provider value={{ walletBalance, setWalletBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
