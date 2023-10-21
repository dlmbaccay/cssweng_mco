import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firestore } from '@/src/lib/firebase';
import { useUserData, usePetData } from '@/src/lib/hooks'

export default function UserProfile() {
  const router = useRouter();
  const { userId} = router.query;
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [description, setDescription] = useState(null); // TODO: Add description to user profile
  const [displayName, setDisplayName] = useState(null); // TODO: Add display name to user profile
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const pets = usePetData(userId);

  useEffect(() => {
  // turn off realtime subscription
  let unsubscribe;

  if (userId) {
    const userRef = firestore.collection('users').doc(userId);
    unsubscribe = userRef.onSnapshot((doc) => {
      setUsername(doc.data()?.username);
      setProfilePicUrl(doc.data()?.photoURL);
      setDescription(doc.data()?.description);
      setDisplayName(doc.data()?.displayName);
      setEmail(doc.data()?.email);
    });
  } else {
    setUsername(null);
    setProfilePicUrl(null);
    setDescription(null);
    setDisplayName(null);
    setEmail(null);
  }

  return unsubscribe;
}, [userId]);

  return (
    <div>
      <h1>User Profile Page</h1>

      <p>Display Name: {displayName}</p>
      <p>Username: {username}</p>
      <p>Email: {email}</p>
      <p>Description: {description}</p>

      <img src={profilePicUrl} alt='profile picture'/>

      <h2>Pets</h2>
      {pets.map((pet) => (
        <div key={pet.id}>
          <h3>Pet Name: {pet.name}</h3>
          <p>Favorite Human: {pet.favehooman}</p>
          <Link href={`/user/${userId}/pets/${pet.id}`}>
            <p>View Pet Profile</p>
          </Link>
        </div>
      ))}

      <div>
        <Link href="/Home">
          <p>Back to Home</p>
        </Link>
      </div>
    </div>
  )
}
