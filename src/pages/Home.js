import React, { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { useUserData } from '../lib/hooks';
import Router from 'next/router';
import toast from 'react-hot-toast';

// handle signout
function handleSignOut() {
  auth.signOut().then(() => {
    window.location.href = "/Login";
  });
}

export default function Home() {

  const { user, username } = useUserData();
  const router = Router;

  function handleViewProfile() {
    router.push(`/user/${username}`);
  }

  // useEffect(() => {
  //   if (!username) {
  //     router.push('/AccountSetup');
  //   } else {
  //     router.push('/Home');
  //   }
  // }, [username, router]);

  return (
    <div>

    {/* user info */}
    <div>
      <h1 className='text-lg'>Email: {user?.email}</h1>
      <h1 className='text-lg'>Username: {username}</h1>
    </div>
    
    <div>
      <button onClick={handleViewProfile} className='bg-black text-white p-2 rounded-md'>
        {username}
      </button>
    </div>

    {/* sign out button */}
    <div>
      <button onClick={handleSignOut} className='bg-black text-white p-2 rounded-md'>
        Sign Out
      </button>
    </div>

    {/* posts */}

    </div>
  )
}
