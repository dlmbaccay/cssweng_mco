import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { useUserData } from '@/src/lib/hooks'

export default function UserProfile() {

  const { user, username, description, displayName, profilePicUrl } = useUserData()

  return (

    <div>

        <h1>User Profile Page</h1>

        <p>Display Name: {displayName}</p>
        <p>Username: {username}</p>
        <p>Email: {user?.email}</p>
        <p>Description: {description}</p>

        <img src={profilePicUrl} alt='profile picture'/>

      <div>
        <Link href="/Home">
          <p>Back to Home</p>
        </Link>
      </div>
    </div>
  )
}
