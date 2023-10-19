import React from 'react'
import { auth } from '../../lib/firebase'

export default function UserProfilePage() {
  return (
    <div>
      UserProfilePage

      {auth.currentUser.email}
    </div>
  )

}
