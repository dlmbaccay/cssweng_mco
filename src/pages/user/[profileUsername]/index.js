import { React, useEffect } from 'react'
import UserProfile from '../../../components/UserProfile'
import Modal from 'react-modal';

export default function UserProfilePage() {
  
  useEffect(() => {
    Modal.setAppElement('#root')
  }, []); 

  return (
    <div id="root">
      <UserProfile />
    </div>
  )
}
