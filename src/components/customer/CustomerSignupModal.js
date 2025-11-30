"use client";

import { useState } from "react";
import { X, Mail, Phone } from "lucide-react";

export default function CustomerSignupModal({ isOpen, onClose, onSwitchToLogin }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text">Create Account</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="email"
                placeholder="john.doe@example.com"
                className="w-full px-3 py-2 pl-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="tel"
                placeholder="(123) 456-7890"
                className="w-full px-3 py-2 pl-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light text-text"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:!bg-cyan-600 transition-colors font-medium"
          >
            Create Account
          </button>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-text-muted">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-white hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

