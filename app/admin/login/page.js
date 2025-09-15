// TODO: restrict access + add session

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User, Lock } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function AdminLoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    })
   
    if (error) {
      setError(error.message)
    } else {
      router.push('/admin')
    }
    setLoading(false)
    
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full h-16 bg-[#74A744] justify-center flex items-center">
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
          

          <form className="px-8 pb-8 pt-2" onSubmit={handleSubmit}>
            {/* Email */}
            <label className="block text-gray-700 text-lg mb-2">Email</label>
            <div className="relative mb-6">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-700" />
              <input
                type="email"
                className="w-full h-[42px] rounded-md border border-neutral-300 bg-white pl-10 pr-3 text-[#171717] placeholder:text-gray-400 outline-none"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* TODO: add eye/hide password toggle */}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[44px] flex items-center justify-center rounded transition-colors
               ${loading ? 'bg-gray-400' : 'bg-[#5F9136] hover:bg-[#3F652B] text-white'}
              `}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button> 

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
