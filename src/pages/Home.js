import React from 'react'
import { auth } from '../lib/firebase'
import Router from 'next/router'

// handle signout
function handleSignOut() {
  const router = Router;
  auth.signOut()
  router.push('/Login')
}

export default function Home() {
  return (
    <div>

    {/* sign out button */}
    <button onClick={() => auth.signOut()}>
      Sign Out
    </button>

    {/* posts */}

    </div>
  )
}
