'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { redirect, useRouter } from 'next/navigation'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'

const dmSerif = DM_Serif_Display({ weight: ['400'], style: ['normal', 'italic'], subsets: ['latin'] })
const dmSans = DM_Sans({ weight: ['300', '400', '500'], subsets: ['latin'] })

export default function LoginPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        redirect('/dashboard')
      }
      setUser(user)
    }
    fetchUser()
  }, [])

  const signIn = async () => {
  supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "https://twoseven.sakshamjain.dev/auth/callback",
  },
})
}

  return (
    <div className={`${dmSans.className} min-h-screen flex items-center justify-center bg-[#f7f6f2]`}>
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-sm border border-black/[0.06]">

        {/* Left panel */}
        <div className="flex-1 bg-[#0f0f0e] p-14 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c9b99a]" />
            <span className={`${dmSerif.className} text-[#f5f0e8] text-2xl`}>TwoSeven</span>
          </div>
          <h1 className={`${dmSerif.className} text-[#f5f0e8] text-4xl font-light leading-tight`}>
            Data that<br /><em className="text-[#c9b99a]">is reliable.</em><br />Better.
          </h1>
          <p className="text-xs text-[#555] tracking-widest uppercase">Trusted by 2,000+ teams</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white p-14 flex flex-col justify-center">
          <h2 className={`${dmSerif.className} text-2xl text-gray-900 mb-1`}>Welcome back</h2>
          <p className="text-sm text-gray-500 mb-9">Sign in to continue to your workspace</p>

          <button
            onClick={signIn}
            className="flex items-center justify-center gap-3 w-full py-3 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button className="flex items-center justify-center w-full py-3 px-5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Continue with email
          </button>

          <p className="text-[11px] text-gray-400 text-center mt-7 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}