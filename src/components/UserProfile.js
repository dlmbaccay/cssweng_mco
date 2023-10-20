import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import toast from 'react-hot-toast'

export default function UserProfile( { user, username, profilePicUrl } ) {
  return (

    <div>

        <h1>User Profile Page</h1>

        <p>Username: {username}</p>
        <p>Email: {user?.email}</p>
        <p>UID: {user?.uid}</p>
        <p>Profile Picture: <img src={profilePicUrl} /></p>

      {/* back to home page*/}
      <div>
        <Link href="/Home">
          <p>Back to Home</p>
        </Link>
      </div>
    </div>
  )
}
