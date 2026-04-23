"use client";

import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar/Footer for all /dashboard pages
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <html lang="en">
      <body>
        {!isDashboard && <Navbar />}
        <AuthProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </AuthProvider>
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}
