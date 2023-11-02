import { React, useEffect } from 'react'
import PetProfile from '../../../components/PetProfile'
import Modal from 'react-modal';

export default function PetProfilePage() {
  useEffect(() => {
    Modal.setAppElement('#root')
  }, []); 

  return (
    <div id="root">
      <PetProfile />
    </div>
  )
}
