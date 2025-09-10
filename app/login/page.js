'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full h-[90px] bg-[#5F9136] flex items-center justify-center">
        <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
                  <div className="w-28 h-12 bg-[#E4EDCB] rounded-lg overflow-hidden shadow-md">
                    <Image 
                      src="/martinPainting.png" 
                      alt="Martin Painting Logo"
                      width={144}
                      height={69}
                      className="w-full h-full object-cover"
                    />
                  </div>
            </Link>
        </div>
      </div>

      {/* Centered card */}
        <div className="max-w-[490px] mx-auto mt-20 bg-[#F1F4E8] shadow-lg rounded-md border border-gray-200">
          <div className="px-8 pt-8 pb-2">
            <h1 className="text-[28px] text-[#171717] font-semibold">Admin Login</h1>
            <div className="mt-2 h-px w-full bg-[#D1D5DB]" />
          

          {/* Form (static) */}
          <form className="px-8 pb-8 pt-2">
            {/* Username */}
            <label className="block text-gray-700 text-lg mb-2">Username</label>
            <div className="relative mb-6">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-700" />
              <input
                className="w-full h-[42px] rounded-md border border-neutral-300 bg-white pl-10 pr-3 text-[#171717] placeholder:text-gray-400 outline-none"
                placeholder="Enter your username"
              />
            </div>

            {/* Password */}
            <label className="block text-gray-700 text-lg mb-2">Password</label>
            <div className="relative mb-8">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-700" />
              <input
                type="password"
                className="w-full h-[42px] rounded-md border border-neutral-300 bg-white pl-10 pr-3 text-[#171717] placeholder:text-gray-400 outline-none"
                placeholder="Enter your password"
              />
            </div>

            {/* TODO: add eye/hide password toggle */}

            {/* Submit button - only redirects to admin dashboard for now - commented out to change to Link redirection to dashboard */}
            {/* <button
              type="button"
              className="w-full h-[44px] bg-[#5F9136] text-white rounded hover:bg-[#3F652B] transition-colors"
            >
              Sign In
            </button> */}
            <Link
            href="/admin"
            className="w-full h-[44px] flex items-center justify-center bg-[#5F9136] text-white rounded hover:bg-[#3F652B] transition-colors"
            >
              Sign In
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
