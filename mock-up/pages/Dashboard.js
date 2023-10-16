import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase';
import Router from 'next/router';

export default function Dashboard() {

  const router = Router
  function handleLogout() {
    auth.signOut()
    .then(() => {
      router.push('/')
    })
  }

  return (
    <div className='flex flex-row min-h-screen'>
      <div className='w-1/3 bg-blue-100 flex-col border-r-2 border-black'>

        <header className='flex-row w-full p-10 h-2/4 border-b-2 border-black box-border'>
          {/* profile pic, display name, followers, following*/}

          <Image 
            src="/images/placeholder-pp.png" 
            width={100} 
            height={100} 
            alt='profile pic' 
            className='rounded-full border-2 border-black'
          />

          <h1 className='font-bold text-2xl'>Display Name</h1>

          <div className='flex flex-row gap-12 mb-3'>
              <div>
                <h2 className='font-bold'>Followers</h2>
                <p>0</p>
              </div>
              <div>
                <h2 className='font-bold'>Following</h2>
                <p>0</p>
              </div>
          </div>

          <Link href='/Profile' className='bg-black text-white p-2'>Edit Profile</Link>
        </header>

        {/* nav menu */}
        <div className='w-full p-10 h-1/3 border-b-2 border-black box-border'>
          <ul>
            <li><i class="fa-solid fa-house"></i>Home</li>
            <li><i class="fa-solid fa-bell"></i>Notifications</li>
            <li><i class="fa-solid fa-envelope"></i>Messages</li>
            <li><i class="fa-solid fa-paw"></i>Find Lost Pets</li>
            <li><i class="fa-solid fa-gear"></i>Settings</li>
          </ul>
        </div>

        {/* logout */}
        <footer className='w-full p-10 h-1/3'>
          <button onClick={handleLogout}>
            <i class="fa-solid fa-right-from-bracket"></i> Log Out
          </button>
        </footer>

      </div>
      
      <div className='w-2/3 bg-red-100 border-r-2 border-black'>
        Column 2
      </div>
      <div className='w-1/3 bg-green-100'>
        Column 3
      </div>
    </div>
  )
}
