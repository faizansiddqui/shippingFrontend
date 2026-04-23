"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/utils/checkAuth";
import { API_BASE_URL } from "@/utils/api";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, loading, logout } = useAuth(false);

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const toggleProfile = () => setIsProfileOpen((s) => !s);

  const handleAddParcel = () => {
    if (loading) return;
    if (user) {
      window.location.href = "/dashboard/add-new-order";
      return;
    }
    const returnTo = encodeURIComponent("/dashboard/add-new-order");
    window.location.href = `/login?next=${returnTo}`;
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
      if (typeof logout === "function") logout();
      else {
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
          <div className="flex items-center space-x-3">
            <Link href="/">
              <div className="flex items-center justify-center">
                <Image
                  src="/mslogo.png"
                  alt="Delivery Icon"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

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
              href="/rate-calculator"
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

          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <button
                onClick={handleAddParcel}
                aria-label="Add Parcel"
                title="Add Parcel"
                className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Image
                  src="/parcle.png"
                  alt="Parcel Logo"
                  className="w-8 h-8 object-contain"
                  width={100}
                  height={100}
                />
                <span className="text-lg font-bold tracking-tight">
                  Add Parcel
                </span>
                <Image
                  src="/plus.png"
                  alt="Plus Icon"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Image
                    src={user.user_metadata?.avatar_url || "/profileAvatar.png"}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                  <span className="hidden sm:inline text-gray-700 font-medium">
                    {user.name
                      ? user.name
                      : user.email
                        ? user.email.split("@")[0]
                        : "User"}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow py-2 z-50">
                    <button
                      onClick={handleDashboard}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/login?next=${encodeURIComponent("/dashboard")}`}>
                <button className="w-full cursor-pointer sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Login
                </button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden overflow-hidden transition-all duration-300 ease-in-out">
            <div className="px-4 py-4 space-y-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl mt-2 border border-gray-200/50">
              <Link
                href="/"
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-semibold text-lg"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-semibold text-lg"
              >
                About
              </Link>
              <a
                href="/rate-calculator/"
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
                        src={
                          user.user_metadata?.avatar_url || "/profileAvatar.png"
                        }
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="text-gray-700 font-semibold">
                        {user.email}
                      </span>
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
                  <Link
                    href={`/login?next=${encodeURIComponent("/dashboard")}`}
                  >
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl">
                      Login
                    </button>
                  </Link>
                )}

                {user && (
                  <button
                    onClick={handleAddParcel}
                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Add Parcel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
