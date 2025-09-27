import { createBrowserClient, createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClientBrowser() {
  return createBrowserClient(url, anon)
}

export function createClientServer() {
  // Persist auth cookies across server requests
  const cookieStore = cookies()
  const h = headers()
  const cookieHeader = h.get('cookie') ?? ''
  const cookieObj = parseCookieHeader(cookieHeader)

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieObj[name]
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 })
      }
    }
  })
  return supabase
}
