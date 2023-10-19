import { React, useContext } from 'react'
import { auth } from '../../lib/firebase'
import { UserContext } from '../../lib/context'
import Link from 'next/link'

export default function UserProfilePage() {

  const { user, username } = useContext(UserContext)

  return (
    <div>
      UserProfilePage

      {/* user info */}
      <div>
        <p>Username: {username}</p>
        <p>Email: {user?.email}</p>
        <p>UID: {user?.uid}</p>
      </div>

      {/* back to home page*/}
      <div>
        <Link href="/Home">
          <p>Back to Home</p>
        </Link>
      </div>
    </div>
  )

}
