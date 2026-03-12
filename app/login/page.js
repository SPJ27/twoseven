'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const Page = () => {
  const supabase = createClient()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()
  }, [])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div>
      {user ? (
        <p>Welcome, {user.user_metadata.full_name}</p>
      ) : (
        <button onClick={signIn}>
          Sign in with Google
        </button>
      )}
    </div>
  )
}

export default Page