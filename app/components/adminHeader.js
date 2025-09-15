'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
    const router = useRouter()

    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error logging out:', error.message)
      } else {
        router.push('/login')
      }
    }

    return (
        <div className="w-full h-16 bg-[#74A744] justify-center flex items-center relative">
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

            <button
        onClick={handleLogout}
        className="absolute right-6 p-2 rounded-full hover:bg-[#5F9136] transition-colors"
        aria-label="Logout"
      >
        <LogOut className="w-6 h-6 text-white" />
      </button>
            {/* TODO: add admin icon + notification bell? + logout option */}
        </div>
    )
}