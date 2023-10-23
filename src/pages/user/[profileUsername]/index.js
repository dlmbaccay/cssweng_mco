import { React, useEffect } from 'react'
import UserProfile from '../../../components/UserProfile'
import Modal from 'react-modal';

export default function UserProfilePage() {
  
  useEffect(() => {
    // Empty useEffect hook with no code inside
    Modal.setAppElement('#root')
  }, []); // Empty dependency array to run the effect only once

  return (
    <div id="root">
      <UserProfile />
    </div>
  )
}
