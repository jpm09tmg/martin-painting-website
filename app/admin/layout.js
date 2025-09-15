'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminHeader from '../components/adminHeader'
import Sidebar from '../components/Sidebar'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            const currentSession = data.session
            setSession(currentSession)
            setLoading(false)

            // Redirect before rendering layout so it doesn't flicker
            if (!currentSession) {
                router.push('/login')
            } 
            
        }
        getSession()
    
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (!session) {
                router.push('/login')
            }
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [router])


    if (loading) return <p className="text-center mt-20">Loading...</p>

    if (!session) return null

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <AdminHeader />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    )
}