"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Truck,
  ShoppingCart,
  Archive,
  IndianRupee,
  Calculator,
  LogOut,
  X,
} from "lucide-react";
import Image from "next/image";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        // Force full page reload to clear any client state
        window.location.href = '/login';
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Even on error, redirect to login
      window.location.href = '/login';
    }
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (isOpen) onClose();
    setShowConfirm(true);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:shadow-lg`}
      >
        <div className="flex flex-col h-full p-5">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/leftIcon.png"
                alt="MS-Logistic Logo"
                width={40}
                height={40}
                className="rounded-lg shadow-md"
              />
              <span className="hidden text-xl font-bold text-gray-800 sm:block">
                MS-Logistic
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {[
              { href: "/dashboard", icon: Home, label: "Dashboard" },
              { href: "/dashboard/pickup-address", icon: Truck, label: "Pickup Address" },
              { href: "/dashboard/add-new-order", icon: ShoppingCart, label: "Add New Order" },
              { href: "/dashboard/my-orders", icon: Archive, label: "My Orders" },
              { href: "/dashboard/recharge-balance", icon: IndianRupee, label: "Recharge Balance" },
              { href: "/dashboard/rate-calculator", icon: Calculator, label: "Rate Calculator" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isOpen && onClose()}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className={`flex w-full items-center space-x-3 px-4 py-3 mt-6 rounded-xl font-medium text-red-600 transition-all duration-200 hover:bg-red-50 ${
                isLoggingOut ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Confirmation Modal with Spinner */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="p-3 mb-4 rounded-full bg-red-100">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="mb-2 text-xl font-bold text-gray-800">Confirm Logout</h3>
              <p className="mb-6 text-sm text-gray-600">
                Are you sure you want to log out? You'll need to sign in again.
              </p>

              {/* Buttons */}
              <div className="flex w-full space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium transition-all hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex flex-1 items-center justify-center space-x-2 px-4 py-2.5 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-medium transition-all hover:from-red-600 hover:to-red-700 disabled:opacity-70"
                >
                  {isLoggingOut ? (
                    <>
                      <Spinner />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <span>Logout</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Spinner Component
function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );
}