// components/Navbar.jsx (or .js)
"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/utils/checkAuth";
import { API_BASE_URL } from "@/utils/api";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // MUST call hook at top-level
  const { user, loading, checkAuth, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const toggleProfile = () => setIsProfileOpen((s) => !s);

  // Optional: make sure auth is fresh when this component mounts
  useEffect(() => {
    // checkAuth is safe to call; it's a function returned by the hook
    if (!loading) {
      // nothing (or call checkAuth() only if you need to re-verify)
    } else {
      // Let the hook finish its initial check
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddParcel = async () => {
    // rely on hook's loading/user
    if (loading) return;

    if (user) {
      window.location.href = "/dashboard";
      return;
    }

    // Try refresh via your backend, then fetch profile (fallback flow you had)
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        const profileRes = await fetch(`${API_BASE_URL}/profile`, {
          credentials: "include",
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          // update local storage to match hook expectations
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem(
            "refreshExpires",
            Date.now() + 15 * 24 * 60 * 60 * 1000
          );
          // You can call checkAuth() to let the hook update its state
          if (typeof checkAuth === "function") await checkAuth();
          window.location.href = "/dashboard";
          return;
        }
      }
    } catch (err) {
      console.error("Error trying refresh:", err);
    }
    window.location.href = "/login";
  };

  const handleDashboard = () => {
    setIsProfileOpen(false);
    window.location.href = "/dashboard";
  };

  const handleLogout = async () => {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          credentials: "include",
        });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Use the hook's logout if available
      if (typeof logout === "function") {
        logout();
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("refreshExpires");
        window.location.href = "/";
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href={"/"}>
              <div className=" flex items-center justify-center">
                <Image
                  src="/mslogo.png"
                  alt="Delivery Icon"
                  width={100}
                  height={100}
                  className="object-contain "
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-semibold text-lg"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-semibold text-lg"
            >
              About
            </Link>
            <Link
              href="/dashboard/rate-calculator"
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-semibold text-lg"
            >
              Price Calculator
            </Link>
            <Link
              href="/contact-us"
              className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-semibold text-lg"
            >
              Contact
            </Link>
          </nav>

          {/* User Profile or Login */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleAddParcel}
              className="flex items-center cursor-pointer gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              <Image
                src="/parcle.png"
                alt="Parcel Logo"
                className="w-8 h-8 object-contain"
                width={100}
                height={100}
              />
              <span className="text-lg font-bold tracking-tight">Add Parcel</span>
              <Image
                src="/plus.png"
                width={24}
                height={24}
                alt="Plus Icon"
                className="object-contain"
              />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden overflow-hidden transition-all duration-300 ease-in-out">
            <div className="px-4 py-4 space-y-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl mt-2 border border-gray-200/50">
              <Link
                href={"/"}
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-semibold text-lg"
              >
                Home
              </Link>
              <Link
                href={"/about"}
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-semibold text-lg"
              >
                About
              </Link>
              <a
                href={"/dashboard/rate-calculator/"}
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-semibold text-lg"
              >
                Price Calculator
              </a>
              <Link
                href="/contact-us"
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-semibold text-lg"
              >
                Contact
              </Link>
              <div className="pt-2">
                {user ? (
                  <div className="relative">
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                      onClick={toggleProfile}
                    >
                      <Image
                        src={user.user_metadata?.avatar_url || "/profileAvatar.png"}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="text-gray-700 font-semibold">{user.email}</span>
                    </div>
                    {isProfileOpen && (
                      <div className="bg-white shadow-md rounded-md p-2">
                        <button
                          onClick={handleDashboard}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl">
                      Login
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleAddParcel}
                  className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Parcel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
