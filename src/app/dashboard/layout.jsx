"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Bell, Menu, User, Package } from "lucide-react";
import { useAuth } from "../../utils/checkAuth"; // Adjust path
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // ✅ Handle redirect safely after render
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login with return URL
      const next = encodeURIComponent("/dashboard");
      router.push(`/login?next=${next}`);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don’t redirect during render — just render nothing
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-30 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-between space-x-1">
            <div className="flex items-center space-x-1">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                {/* <span className="text-sm text-gray-500">Signed in as</span> */}
                <span className="text-gray-800 font-medium">
                  {user?.name
                    ? user.name
                    : user?.email
                      ? user.email.split("@")[0]
                      : "User"}
                </span>
              </div>
            </div>

            <div>
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/add-new-order")
                }
                className="ml-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-2 py-1 rounded-lg shadow hover:scale-105 transition-transform"
              >
                <Package className="w-4 h-4" />
                Parcel
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto border border-gray-400">
          {children}
        </main>
      </div>
    </div>
  );
}
