"use client";

import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";
import { WalletProvider } from "@/context/WalletContext";



export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar/Footer for all /dashboard pages
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <html lang="en">
      <body>
        {!isDashboard && <Navbar />}
        <WalletProvider>
          {children}
        </WalletProvider>
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}
