import React from 'react'
import { auth } from '../lib/firebase'
import { useUserData } from '../lib/hooks';
import Router from 'next/router';

// handle signout
function handleSignOut() {
  auth.signOut().then(() => {
    // trigger custom sign out event
    const signOutEvent = new CustomEvent("custom-sign-out");
    window.dispatchEvent(signOutEvent);

    // Redirect to the login page
    window.location.href = "/Login";
  });
}

export default function Home() {

  const { user, username } = useUserData();
  const router = Router;

  function handleViewProfile() {
    router.push(`/user/${username}`);
  }


  return (
    <div>

    {/* user info */}
    <div>
      <h1 className='text-lg'>{user?.email}</h1>
    </div>
    
    <div>
      <button onClick={ handleViewProfile} className='bg-black text-white p-2 rounded-md'>
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
