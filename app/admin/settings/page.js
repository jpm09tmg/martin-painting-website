"use client";

import AdminHeader from "../../components/adminHeader";
import Sidebar from "../../components/Sidebar";

import { useState } from "react";
import { User, Eye, EyeOff, Camera } from "lucide-react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = Object.values(formData).some((v) => v && v.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AdminHeader />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4">
          <div className="p-6 space-y-8">
            {/* General */}
            <section className="bg-[#F1F4E8] rounded-lg shadow-lg border border-gray-200 px-6 pt-4 pb-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">General</h2>

              <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-8 items-start">
                {/* Profile */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-3 border-gray-500 border-2">
                    <User className="w-12 h-12 text-gray-600" />
                  </div>

                  <label className="cursor-pointer text-[#5F9136] text-sm font-medium hover:underline flex items-center space-x-1">
                    <Camera className="w-4 h-4" />
                    <span>Update Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        /* handle file */
                      }}
                    />
                  </label>
                </div>

                {/* Form */}
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="fullName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="John Doe"
                      onFocus={(e) => e.target.select()}
                      autoComplete="name"
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md bg-white
                                                                        focus:outline-none focus:ring-2 focus:ring-[#5F9136] focus:border-transparent
                                                                        text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="position"
                      className="text-sm font-medium text-gray-700"
                    >
                      Position
                    </label>
                    <input
                      id="position"
                      type="text"
                      value={formData.position}
                      onChange={(e) =>
                        handleInputChange("position", e.target.value)
                      }
                      placeholder="Owner"
                      onFocus={(e) => e.target.select()}
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md bg-white
                                                                        focus:outline-none focus:ring-2 focus:ring-[#5F9136] focus:border-transparent
                                                                        text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="john.doe@example.com"
                      onFocus={(e) => e.target.select()}
                      autoComplete="email"
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md bg-white
                                                                        focus:outline-none focus:ring-2 focus:ring-[#5F9136] focus:border-transparent
                                                                        text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="(123) 456-7890"
                      onFocus={(e) => e.target.select()}
                      autoComplete="tel"
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md bg-white
                                                                        focus:outline-none focus:ring-2 focus:ring-[#5F9136] focus:border-transparent
                                                                        text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="123 Main St, Anytown, USA"
                      onFocus={(e) => e.target.select()}
                      autoComplete="address"
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md bg-white
                                                                        focus:outline-none focus:ring-2 focus:ring-[#5F9136] focus:border-transparent
                                                                        text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </form>
              </div>
            </section>

            {/* Login */}
            <section className="bg-[#F1F4E8] rounded-lg shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Login Information
              </h2>

              <div className="w-full max-w-md mx-auto space-y-6">
                <div className="flex flex-col">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="John Doe"
                    autoComplete="username"
                    onFocus={(e) => e.target.select()}
                    className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md bg-white
                                                    focus:outline-none focus:ring-2 focus:ring-[#5F9136] focus:border-transparent
                                                    text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter new password"
                      autoComplete="current-password"
                      className="mt-1 w-full px-3 py-1 pr-10 border border-gray-300 rounded-md bg-white
                                                        focus:outline-none focus:ring-2 focus:ring-[#5F9136] focus:border-transparent
                                                        text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F9136] hover:text-[#3F652B]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    disabled={!hasChanges}
                    className="bg-[#5F9136] disabled:opacity-50 disabled:cursor-not-allowed
                                                    text-white py-2 px-6 rounded-md hover:bg-[#3F652B] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
