import React, { useState } from 'react';
import Image from 'next/image'
import Router from 'next/router'
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import Notifications from './Notifications';

export default function PhoneNav( {props} ) {
    
    const { setShowPhoneNavModal, currentUserUsername, currentUserPhotoURL, notifications} = props
    const router = Router

    const [showNotifications, setShowNotifications] = useState(false);

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
    <div className='w-full h-full flex flex-col items-center'>
        <div className='bg-snow w-full h-14 flex justify-between items-center md:hidden drop-shadow-md'>
              <div className='h-full flex flex-row items-center gap-1'>
                <Image src='/images/logo.png' alt='logo' width={40} height={40} className='ml-2 rounded-full'/>
                <h1 className='font-shining text-4xl text-grass'>BantayBuddy</h1>
              </div>
              
              <button onClick={() => setShowPhoneNavModal(false)}>
                <i className='fa-solid fa-xmark text-xl w-[56px] h-[56px] flex items-center justify-center'/>
              </button>
        </div>

        <div className='w-fit h-fit flex flex-col items-center mt-8 gap-4' onClick={() => router.push(`/user/${currentUserUsername}`)}>
            <Image src={currentUserPhotoURL} alt='profile picture' width={100} height={100} className='rounded-full  aspect-square object-cover'/>
            <h1 className='font-shining text-2xl text-raisin_black'>@{currentUserUsername}</h1>
        </div>

        <div className='border w-[50%] mt-4 opacity-30 text-xanthous' />

        <div className='w-fit h-fit flex flex-col gap-4 justify-start mt-6'>
        <button className='flex flex-row items-center justify-start gap-2' onClick={() => router.push('/Home')}>
            <i className='fa-solid fa-house text-xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
            <h1 className='font-shining text-3xl text-grass'>Home</h1>
        </button>

        <button className='flex flex-row items-center justify-start gap-2' onClick={() => router.push('/PetTracker')}>
            <i className='fa-solid fa-paw text-xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
            <h1 className='font-shining text-3xl text-grass'>Pet Tracker</h1>
        </button>

        <button className='flex flex-row items-center justify-start gap-2' onClick={() => router.push('/Home')}>
            <i className='fa-solid fa-earth-asia text-2xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
            <h1 className='font-shining text-3xl text-grass'>Foundations</h1>
        </button>

        <button className='flex flex-row items-center justify-start gap-2' onClick={() => router.push(`/user/${currentUserUsername}`)}>
            <i className='fa-solid fa-user text-xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
            <h1 className='font-shining text-3xl text-grass'>Profile</h1>
        </button>

        <button className='flex flex-row items-center justify-start gap-2'  onClick={() => setShowNotifications(!showNotifications)}>
            <i className='fa-solid fa-bell text-xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
            <h1 className='font-shining text-3xl text-grass'>Notifications</h1>
        </button>

        <button className='flex flex-row items-center justify-start gap-2' onClick={() => router.push('/Settings')}>
            <i className='fa-solid fa-gear text-xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
            <h1 className='font-shining text-3xl text-grass'>Settings</h1>
        </button>

        <div className='border w-full mt-2 opacity-30 text-xanthous' />

        <button className='flex flex-row items-center justify-start gap-2' onClick={() => {
            auth.signOut();
            router.push('/');
            toast.success('Successfully logged out!');
            }} >
            <i className='fa-solid fa-right-from-bracket text-xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
            <h1 className='font-shining text-3xl text-grass'>Log Out</h1>
        </button>
        </div>

        {showNotifications && (
        <div className='fixed top-0 left-0 w-full h-screen z-50 overflow-y-auto'>
            <Notifications notifications={notifications} toggleNotifs={handleToggleNotifications}/>
        </div>
        )}

        {/* <button onClick={() => router.push('/AboutUs')} className='text-grass mb-2 mt-auto hover:text-grass'>
            About Us
        </button> */}
    </div>
  )
}
