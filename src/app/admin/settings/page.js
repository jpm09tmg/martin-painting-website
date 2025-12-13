"use client";

import { useState, useEffect } from "react";
import { User, Eye, EyeOff, Camera, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/db/supabase-client";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  const [profileImage, setProfileImage] = useState(null);
  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
  });

  // Load admin profile from database on mount
  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      // Fetch admin profile from database
      const { data, error } = await supabase
        .from("admin_profile")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
        console.error("Error loading profile:", error);
        setNotification({ type: "error", message: "Failed to load profile data" });
      } else if (data) {
        const profileData = {
          fullName: data.full_name || "",
          position: data.position || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          username: data.username || "",
          password: "",
        };
        setFormData(profileData);
        setOriginalData(profileData);
        setProfileImage(data.profile_image_url || null);
      }
    } catch (err) {
      console.error("Error loading admin profile:", err);
      setNotification({ type: "error", message: "An error occurred while loading profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return Object.keys(formData).some((key) => {
      if (key === "password") return formData[key].length > 0;
      return formData[key] !== originalData[key];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setNotification(null);

      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.username) {
        setNotification({ type: "error", message: "Please fill in all required fields" });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setNotification({ type: "error", message: "Please enter a valid email address" });
        return;
      }

      // Prepare data for database
      const profileData = {
        full_name: formData.fullName,
        position: formData.position,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        username: formData.username,
        profile_image_url: profileImage,
        updated_at: new Date().toISOString(),
      };

      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("admin_profile")
        .select("id")
        .single();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from("admin_profile")
          .update(profileData)
          .eq("id", existingProfile.id);
      } else {
        // Insert new profile
        result = await supabase
          .from("admin_profile")
          .insert([{ ...profileData, created_at: new Date().toISOString() }]);
      }

      if (result.error) {
        console.error("Error saving profile:", result.error);
        setNotification({ type: "error", message: "Failed to save profile" });
      } else {
        setNotification({ type: "success", message: "Profile updated successfully!" });
        setOriginalData({ ...formData, password: "" });
        setFormData((prev) => ({ ...prev, password: "" }));
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setNotification({ type: "error", message: "An error occurred while saving" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setNotification({ type: "error", message: "Please upload an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ type: "error", message: "Image size should be less than 5MB" });
      return;
    }

    try {
      setNotification({ type: "info", message: "Uploading image..." });

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      const filePath = `admin-profiles/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);

        // If bucket doesn't exist, show helpful message
        if (uploadError.message.includes('not found')) {
          setNotification({
            type: "error",
            message: "Storage bucket not found. Please create 'profile-images' bucket in Supabase Storage."
          });
          return;
        }

        setNotification({ type: "error", message: "Failed to upload image" });
        return;
      }

      // Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setProfileImage(urlData.publicUrl);
        setNotification({ type: "success", message: "Image uploaded! Click 'Save Changes' to persist." });
      } else {
        setNotification({ type: "error", message: "Failed to get image URL" });
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setNotification({ type: "error", message: "An error occurred while uploading" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-text-muted font-medium">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-text mb-2">
              Settings
            </h1>
            <p className="text-sm md:text-base text-text-muted">
              Manage your profile and account settings
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`p-4 rounded-lg border flex items-center space-x-3 ${
                notification.type === "success"
                  ? "bg-success/10 border-success text-success"
                  : "bg-danger/10 border-danger text-danger"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="font-medium">{notification.message}</p>
              <button
                onClick={() => setNotification(null)}
                className="ml-auto text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* General Profile Section */}
          <section className="bg-background-light rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-5 border-b border-border">
              <h2 className="text-xl md:text-2xl font-bold text-text flex items-center">
                <div className="p-2 bg-primary/20 rounded-lg mr-3">
                  <User className="w-5 h-5 text-primary" />
                </div>
                Profile Information
              </h2>
              <p className="text-xs md:text-sm text-text-muted mt-1 ml-12">
                Update your personal information and profile picture
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-8 items-start">
                {/* Profile Image */}
                <div className="flex flex-col items-center lg:items-start">
                  <div className="relative group">
                    <div className="w-36 h-36 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 border-4 border-background shadow-xl overflow-hidden ring-4 ring-primary/10">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-20 h-20 text-white" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-white mx-auto mb-1" />
                        <p className="text-xs text-white font-medium">Change Photo</p>
                      </div>
                    </div>
                  </div>

                  <label className="cursor-pointer text-primary text-sm font-semibold hover:opacity-80 flex items-center justify-center space-x-2 bg-primary/10 px-5 py-2.5 rounded-lg hover:bg-primary/20 transition-all duration-200 border border-primary/20 hover:border-primary/30 w-full">
                    <Camera className="w-4 h-4" />
                    <span>Update Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="text-xs text-text-muted mt-2 text-center lg:text-left">
                    JPG, PNG or GIF (Max. 5MB)
                  </p>
                </div>

              {/* Form */}
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                {/* Full Name */}
                <div className="flex flex-col group">
                  <label
                    htmlFor="fullName"
                    className="text-xs font-bold text-text mb-2 uppercase tracking-wide flex items-center"
                  >
                    <span>Full Name</span>
                    <span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter your full name"
                    onFocus={(e) => e.target.select()}
                    autoComplete="name"
                    className="px-4 py-3 border-2 border-border rounded-lg bg-background
                              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                              text-text placeholder:text-text-muted transition-all duration-200
                              hover:border-primary/50"
                  />
                </div>

                {/* Position */}
                <div className="flex flex-col group">
                  <label
                    htmlFor="position"
                    className="text-xs font-bold text-text mb-2 uppercase tracking-wide"
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
                    placeholder="e.g., Owner, Manager, Administrator"
                    onFocus={(e) => e.target.select()}
                    className="px-4 py-3 border-2 border-border rounded-lg bg-background
                              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                              text-text placeholder:text-text-muted transition-all duration-200
                              hover:border-primary/50"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col group">
                  <label
                    htmlFor="email"
                    className="text-xs font-bold text-text mb-2 uppercase tracking-wide flex items-center"
                  >
                    <span>Email Address</span>
                    <span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    onFocus={(e) => e.target.select()}
                    autoComplete="email"
                    className="px-4 py-3 border-2 border-border rounded-lg bg-background
                              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                              text-text placeholder:text-text-muted transition-all duration-200
                              hover:border-primary/50"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col group">
                  <label
                    htmlFor="phone"
                    className="text-xs font-bold text-text mb-2 uppercase tracking-wide"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(123) 456-7890"
                    onFocus={(e) => e.target.select()}
                    autoComplete="tel"
                    className="px-4 py-3 border-2 border-border rounded-lg bg-background
                              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                              text-text placeholder:text-text-muted transition-all duration-200
                              hover:border-primary/50"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col sm:col-span-2 group">
                  <label
                    htmlFor="address"
                    className="text-xs font-bold text-text mb-2 uppercase tracking-wide"
                  >
                    Business Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="123 Main Street, City, State, ZIP"
                    onFocus={(e) => e.target.select()}
                    autoComplete="address"
                    className="px-4 py-3 border-2 border-border rounded-lg bg-background
                              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                              text-text placeholder:text-text-muted transition-all duration-200
                              hover:border-primary/50"
                  />
                </div>
              </form>
              </div>
            </div>
          </section>

          {/* Login Information Section */}
          <section className="bg-background-light rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 px-6 py-5 border-b border-border">
              <h2 className="text-xl md:text-2xl font-bold text-text flex items-center">
                <div className="p-2 bg-secondary/20 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                Security & Login
              </h2>
              <p className="text-xs md:text-sm text-text-muted mt-1 ml-12">
                Manage your login credentials and account security
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="w-full max-w-3xl mx-auto space-y-6">
                {/* Username */}
                <div className="flex flex-col group">
                  <label
                    htmlFor="username"
                    className="text-xs font-bold text-text mb-2 uppercase tracking-wide flex items-center"
                  >
                    <span>Username</span>
                    <span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter your username"
                    autoComplete="username"
                    onFocus={(e) => e.target.select()}
                    className="px-4 py-3 border-2 border-border rounded-lg bg-background
                              focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary
                              text-text placeholder:text-text-muted transition-all duration-200
                              hover:border-secondary/50"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col group">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-text mb-2 uppercase tracking-wide"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Leave blank to keep current password"
                      autoComplete="new-password"
                      className="px-4 py-3 pr-12 w-full border-2 border-border rounded-lg bg-background
                                focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary
                                text-text placeholder:text-text-muted transition-all duration-200
                                hover:border-secondary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors p-1 rounded"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-2 flex items-start">
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Leave blank if you don&apos;t want to change your password</span>
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6"></div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                  <div className="text-xs text-text-muted order-2 sm:order-1">
                    {hasChanges() && (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-warning rounded-full mr-2 animate-pulse"></span>
                        You have unsaved changes
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-3 order-1 sm:order-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(originalData);
                        setNotification(null);
                      }}
                      disabled={!hasChanges()}
                      className="flex-1 sm:flex-none px-6 py-3 border-2 border-border text-text rounded-lg
                                hover:bg-background-dark hover:border-text-muted
                                transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                                font-semibold text-sm disabled:hover:bg-transparent disabled:hover:border-border"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!hasChanges() || saving}
                      className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary to-secondary
                                text-white rounded-lg hover:shadow-xl hover:scale-105
                                transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                                font-semibold text-sm inline-flex items-center justify-center space-x-2
                                disabled:hover:scale-100 disabled:hover:shadow-md"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
