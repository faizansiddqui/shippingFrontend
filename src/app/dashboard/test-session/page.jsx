"use client";

import { useAuth } from "../../../utils/checkAuth";
import { useState } from "react";

export default function TestSessionPage() {
  const { user, showLogoutWarning, extendSession, clearWarning, logout, WARNING_TIME } = useAuth(false);
  const [manualWarning, setManualWarning] = useState(false);

  const triggerManualWarning = () => {
    setManualWarning(true);
    setTimeout(() => setManualWarning(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Session Management Test</h1>
          
          {/* User Info */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current User</h2>
            {user ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-gray-600">No user logged in</p>
            )}
          </div>

          {/* Session Status */}
          <div className="mb-8 p-6 bg-amber-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Warning Active</h3>
                <p className={`mt-1 ${showLogoutWarning ? 'text-red-600' : 'text-green-600'}`}>
                  {showLogoutWarning ? 'YES - Warning showing' : 'NO - Session active'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Warning Time</h3>
                <p className="mt-1 text-gray-600">{Math.floor(WARNING_TIME / 1000)} seconds</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Manual Test</h3>
                <button
                  onClick={triggerManualWarning}
                  className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Trigger Warning
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={extendSession}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Extend Session
            </button>
            <button
              onClick={clearWarning}
              className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Clear Warning
            </button>
            <button
              onClick={logout}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Instructions</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Stay inactive for 30 minutes to trigger session warning</li>
              <li>• Click "Stay Logged In" to extend session</li>
              <li>• Click "Logout" to manually logout</li>
              <li>• Use "Trigger Warning" button for manual testing</li>
              <li>• Check browser console for session monitoring logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}