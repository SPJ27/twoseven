'use client'

import React from 'react'
import { createClient } from '@/utils/supabase/client';

const page =  () => {
  const supabase = createClient();
  return (
    <div>
      <button onClick={async () => {
        supabase.auth.signInWithOAuth({
  provider: 'google',
})
      }}>Sign in with Google</button>
    </div>
  )
}

export default page