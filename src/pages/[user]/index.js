import { React, useContext } from 'react'
import { UserContext } from '../../lib/context'
import UserProfile from '../../components/UserProfile'
import { useUserData } from '@/src/lib/hooks'
import Image from 'next/image'

export default function UserProfilePage() {

  const { user, username } = useContext(UserContext)
  const { profilePicUrl } = useUserData()

  return (
    <div>
      <UserProfile user={user} username={username} profilePictureUrl={profilePicUrl}/>
    </div>
  )

}
