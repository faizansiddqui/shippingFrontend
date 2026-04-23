"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL } from "@/utils/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const router = useRouter();
  const isChecking = useRef(false);
  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);

  // Warning time before auto-logout (in ms)
  const WARNING_TIME = 60000; // 1 minute warning
  // Session timeout (in ms) - match backend session expiry (15 minutes)
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  // ✅ Handle unauthenticated state
  const handleUnauth = useCallback((isSessionExpired = false) => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("refreshExpires");
    localStorage.removeItem("sessionStart");
    localStorage.removeItem("lastActivity");

    if (isSessionExpired) {
      setSessionExpired(true);
      setShowLogoutWarning(false);
    }

    if (typeof window === "undefined") return;

    const { pathname, search, hash } = window.location;

    // Allow password reset flow
    if (pathname.startsWith("/reset-password") || hash.includes("access_token")) {
      console.log("Skipping redirect: password reset flow");
      return;
    }

    // Preserve current location so user can return after login
    const next = encodeURIComponent(`${pathname}${search || ""}${hash || ""}`);
    router.push(`/login?next=${next}&reason=${isSessionExpired ? "session" : "unauthorized"}`);
  }, [router]);

  // ✅ Handle session expiry with warning
  const handleSessionExpiry = useCallback(() => {
    if (showLogoutWarning) return; // Already showing warning

    setShowLogoutWarning(true);
    
    // Auto logout after warning time
    logoutTimeoutRef.current = setTimeout(() => {
      setShowLogoutWarning(false);
      handleUnauth(true);
    }, WARNING_TIME);
  }, [showLogoutWarning, handleUnauth]);

  // ✅ Clear warning and timeouts
  const clearWarning = useCallback(() => {
    setShowLogoutWarning(false);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  }, []);

  // ✅ Extend session (user clicked "Stay Logged In")
  const extendSession = useCallback(async () => {
    clearWarning();
    
    try {
      const res = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        // Update session start time
        localStorage.setItem("sessionStart", Date.now().toString());
        localStorage.setItem("lastActivity", Date.now().toString());
        return true;
      }
    } catch (err) {
      console.error("Failed to extend session:", err);
    }
    
    // If refresh failed, logout
    handleUnauth(true);
    return false;
  }, [handleUnauth, clearWarning]);

  // ✅ Track user activity
  const updateLastActivity = useCallback(() => {
    localStorage.setItem("lastActivity", Date.now().toString());
  }, []);

  // ✅ Auth check (with duplicate call prevention)
  const checkAuth = useCallback(async () => {
    if (isChecking.current) return;
    isChecking.current = true;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("refreshExpires", Date.now() + 15 * 24 * 60 * 60 * 1000);
        
        // Initialize session tracking
        if (!localStorage.getItem("sessionStart")) {
          localStorage.setItem("sessionStart", Date.now().toString());
        }
        localStorage.setItem("lastActivity", Date.now().toString());
        
        setSessionExpired(false);
        clearWarning();
        return true;
      }

      // 🔄 Try refresh token if unauthorized
      if (res.status === 401) {
        const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setUser(refreshData.user);
          localStorage.setItem("user", JSON.stringify(refreshData.user));
          localStorage.setItem("refreshExpires", Date.now() + 15 * 24 * 60 * 60 * 1000);
          localStorage.setItem("sessionStart", Date.now().toString());
          localStorage.setItem("lastActivity", Date.now().toString());
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
  }, [handleUnauth, clearWarning]);

  // ✅ Logout handler
  const logout = useCallback(async () => {
    clearWarning();
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout fetch error:", err);
    } finally {
      handleUnauth(false);
      router.push("/login");
    }
  }, [handleUnauth, router, clearWarning]);

  // ✅ Initial Auth Check and Session Monitoring
  useEffect(() => {
    if (typeof window === "undefined") return;

    checkAuth();

    // Track user activity
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => updateLastActivity();
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check session expiry periodically
    const checkSessionInterval = setInterval(() => {
      const sessionStart = localStorage.getItem("sessionStart");
      const lastActivity = localStorage.getItem("lastActivity");
      
      if (!sessionStart || !lastActivity || !user) return;

      const now = Date.now();
      const timeSinceActivity = now - parseInt(lastActivity);
      const timeSinceSessionStart = now - parseInt(sessionStart);

      // Check if session has exceeded maximum duration
      if (timeSinceSessionStart >= SESSION_TIMEOUT) {
        handleSessionExpiry();
        return;
      }

      // Check for inactivity timeout (match session timeout - 15 minutes)
      const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
      if (timeSinceActivity >= INACTIVITY_TIMEOUT && !showLogoutWarning) {
        handleSessionExpiry();
      }
    }, 30000); // Check every 30 seconds

    // Auto-refresh every 5 minutes (only if user logged in)
    const refreshInterval = setInterval(() => {
      if (user && !showLogoutWarning) checkAuth();
    }, 5 * 60 * 1000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkSessionInterval);
      clearInterval(refreshInterval);
      clearWarning();
    };
  }, [checkAuth, user, showLogoutWarning, handleSessionExpiry, updateLastActivity, clearWarning]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        checkAuth,
        logout,
        sessionExpired,
        showLogoutWarning,
        extendSession,
        clearWarning,
        WARNING_TIME,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Legacy useAuth hook for backward compatibility
export function useAuth(redirectOnUnauth = true) {
  const { user, loading, checkAuth, logout, sessionExpired, showLogoutWarning, extendSession, clearWarning, WARNING_TIME } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && redirectOnUnauth) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?next=${next}`);
    }
  }, [loading, user, redirectOnUnauth, router]);

  return {
    user,
    loading,
    checkAuth,
    logout,
    sessionExpired,
    showLogoutWarning,
    extendSession,
    clearWarning,
    WARNING_TIME,
  };
}