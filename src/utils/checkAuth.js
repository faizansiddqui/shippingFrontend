"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

export function useAuth(redirectOnUnauth = true) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isChecking = useRef(false); // prevent duplicate calls

  // ✅ Handle unauthenticated state
  const handleUnauth = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("refreshExpires");

    if (!redirectOnUnauth || typeof window === "undefined") return;

    const { pathname, hash } = window.location;

    // Allow password reset flow
    if (pathname.startsWith("/reset-password") || hash.includes("access_token")) {
      console.log("Skipping redirect: password reset flow");
      return;
    }

    router.push("/login");
  }, [redirectOnUnauth, router]);

  // ✅ Auth check (with duplicate call prevention)
  const checkAuth = useCallback(async () => {
    if (isChecking.current) return; // prevent spam calls
    isChecking.current = true;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("refreshExpires", Date.now() + 15 * 24 * 60 * 60 * 1000);
        return true;
      }

      // 🔄 Try refresh token if unauthorized
      if (res.status === 401) {
        const refreshRes = await fetch("http://localhost:5000/profile/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setUser(refreshData.user);
          localStorage.setItem("user", JSON.stringify(refreshData.user));
          localStorage.setItem("refreshExpires", Date.now() + 15 * 24 * 60 * 60 * 1000);
          return true;
        }
      }

      handleUnauth();
      return false;
    } catch (err) {
      console.error("Auth check failed:", err);
      handleUnauth();
      return false;
    } finally {
      setLoading(false);
      isChecking.current = false;
    }
  }, [handleUnauth]);

  // ✅ Logout handler
  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout fetch error:", err);
    } finally {
      handleUnauth();
      router.push("/login");
    }
  }, [handleUnauth, router]);

  // ✅ Initial Auth Check (runs only once)
  useEffect(() => {
    checkAuth();

    // Auto-refresh every 5 minutes (only if user logged in)
    const interval = setInterval(() => {
      if (user) checkAuth();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuth]); // no 'user' dependency!

  return {
    user,
    loading,
    checkAuth,
    logout,
  };
}
