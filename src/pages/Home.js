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
    <h1>{user?.email}</h1>
    <button onClick={ handleViewProfile}>
      {username}
    </button>

    {/* sign out button */}
    <button onClick={handleSignOut}>
      Sign Out
    </button>

    {/* posts */}

    </div>
  )
}
