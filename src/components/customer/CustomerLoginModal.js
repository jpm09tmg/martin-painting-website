"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

export default function CustomerLoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full shadow-2xl border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text">Customer Sign In</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:!bg-cyan-600 transition-colors font-medium"
          >
            Sign In
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-text-muted">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-white hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
