import React, { useEffect, useState } from 'react'
import { useUserData } from '../lib/hooks';
import { auth, firestore, googleAuthProvider } from '../lib/firebase'
import Router from 'next/router';
import toast from 'react-hot-toast';
import NavBar from '../components/NavBar';
import Link from 'next/link';


export default function Home() {

  const { user, username } = useUserData();
  const [ users, setUsers ] = useState([]);
  const [ pets, setPets ] = useState([]);
  const router = Router;

  function handleViewProfile() {
    router.push(`/user/${username}`);
  }

  async function getAllUsers() {
    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map((doc) => ({
      username: doc.data().username,
      displayName: doc.data().displayName,
      email: doc.data().email,
    }));
    setUsers(users);
  }

  async function getAllPets() {
  }

  useEffect(() => {
    if (user) {
      getAllUsers();
      getAllPets();
    }
  }, [user]);

  return (
    <div>
      <div className='flex h-screen'>
        <NavBar />

        <div className='h-full w-full p-4'>
          {/* Current User Info */}
          
          <div className='bg-snow w-80 rounded-lg p-4'>
            <h1 className='text-xl font-bold mb-2'>Welcome, {user?.displayName}!</h1>
            <h1 className='text-sm'>Display Name: {user?.displayName}</h1>
            <h1 className='text-sm'>Username: {username}</h1>
            <h1 className='text-sm'>Email: {user?.email}</h1>
            <button onClick={handleViewProfile} className='bg-black w-full mt-2 text-white text-sm p-2 rounded-md hover:opacity-80 transition-all'>
              View Profile
            </button>
          </div>

          {/* all users by their usernames */}

          <div className='bg-snow w-80 rounded-lg p-4 mt-4'>
            <h1 className='text-xl font-bold mb-2'>All Users</h1>
            <div className='flex flex-col'>
              {users && users.map((user) => (
                <Link href={`/user/${user.username}`} key={user.username}>
                  <p className='text-sm hover:underline'>{user.username}</p>
                </Link>
              ))}

              {!users && (
                <p className='text-sm'>No users found</p>
              )}
            </div>
          </div>

          {/* all pets by their owners */}
          <div className='bg-snow w-80 rounded-lg p-4 mt-4'>
            <h1 className='text-xl font-bold mb-2'>All Pets</h1>
            <div className='flex flex-col'>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
