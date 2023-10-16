import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase';

export default function Header() {

  function handleLogout() {
    auth.signOut()
  }

  return (
    <div className='flex flex-1 justify-between'>
      Header

      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}