import { React, useEffect } from 'react'
import UserProfile from '../../../components/UserProfile'

export default function UserProfilePage() {
  
  useEffect(() => {
    // Empty useEffect hook with no code inside
  }, []); // Empty dependency array to run the effect only once

  return (
    <div id="root">
      <UserProfile />
    </div>
  )
}
