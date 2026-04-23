"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, LogOut, RefreshCw } from "lucide-react";

export default function SessionWarningModal({
  isOpen,
  onStayLoggedIn,
  onLogout,
  warningTime = 60000,
}) {
  const [timeLeft, setTimeLeft] = useState(warningTime / 1000);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(warningTime / 1000);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, warningTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-center">Session Expiring Soon</h3>
          <p className="text-center text-white/90 mt-1 text-sm">
            Your session is about to expire due to inactivity
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Timer Display */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
              <Clock className="w-6 h-6 text-amber-600" />
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-700 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-amber-600 mt-1">
                  {timeLeft > 0 ? "remaining" : "Time's up!"}
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm text-center mb-6">
            You'll be automatically logged out when the timer reaches zero.
            Click "Stay Logged In" to continue your session.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              disabled={timeLeft === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium transition-all hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Now</span>
            </button>
            <button
              onClick={onStayLoggedIn}
              disabled={timeLeft === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-medium transition-all hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Stay Logged In</span>
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Staying logged in will reset your session timer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}