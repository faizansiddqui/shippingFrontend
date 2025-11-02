"use client";
import React from "react";
import { useWallet } from "@/context/WalletContext";

export default function AnotherPage() {
  const { walletBalance } = useWallet();

  return <div className="p-30 text-gray-950 mt-20">Current Wallet: ₹{walletBalance}</div>;
}
