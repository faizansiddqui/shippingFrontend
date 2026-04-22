"use client";
import { useState } from "react";
import { API_BASE_URL } from "@/utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setStatus("failed");
        setMessage(
          data.message || data.error || "Unable to request password reset",
        );
        return;
      }

      const respStatus = data.status || (data.success ? "sent" : null);
      setStatus(respStatus);

      // Friendly messages by status (don't show raw reset link as primary)
      let display = data.message || "";
      if (!display) {
        if (respStatus === "sent")
          display = "✅ Reset link sent. Check your email.";
        else if (respStatus === "generated")
          display = "✅ Reset link generated.";
        else if (respStatus === "notified" || respStatus === "not_configured")
          display = "If an account exists, a reset link will be sent.";
        else if (respStatus === "failed")
          display = "Failed to send reset link.";
        else display = "If an account exists, a reset link will be sent.";
      }

      setMessage(display);
    } catch (err) {
      console.error("ForgotPassword error", err);
      setLoading(false);
      setMessage("Unable to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a reset link.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </div>
        </form>
        {message && (
          <div
            className={`mt-6 text-center text-sm p-3 rounded-md ${
              status === "sent" ||
              status === "generated" ||
              status === "notified" ||
              status === "not_configured"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
