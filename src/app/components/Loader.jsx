"use client";

import React from "react";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
      <div className="text-center">
        <div
          role="status"
          className="inline-block w-16 h-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mb-4"
        />
        <div className="text-gray-700 font-medium">{message}</div>
      </div>
    </div>
  );
}
