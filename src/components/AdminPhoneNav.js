import React from 'react'
import Image from 'next/image'
import Router from 'next/router'
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminPhoneNav( {props} ) {
    
    const { setShowPhoneNavModal, activeContainer, setActiveContainer } = props
    const router = Router

    return (
    <div className='w-full h-full flex flex-col items-center'>
        <div className='bg-snow w-full h-14 flex justify-between items-center md:hidden drop-shadow-md'>
            <div className='h-full flex flex-row items-center gap-1'>
            <Image src='/images/logo.png' alt='logo' width={40} height={40} className='ml-2 rounded-full'/>
            <h1 className='font-shining text-4xl text-grass'>Admin</h1>
            </div>
            
            <button onClick={() => setShowPhoneNavModal(false)}>
            <i className='fa-solid fa-xmark text-xl w-[56px] h-[56px] flex items-center justify-center'/>
            </button>
        </div>

        <div className='w-fit h-fit flex flex-col gap-4 justify-start mt-10'>
            <button className='flex flex-row items-center justify-start gap-2' onClick={(e) => {
                e.stopPropagation();
                setShowPhoneNavModal(false);
                setActiveContainer('Reported Posts')
            }}>
                <i className='fa-solid fa-bell text-xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
                <h1 className='font-shining text-3xl text-grass'>Reported Posts</h1>
            </button>

            <button className='flex flex-row items-center justify-start gap-2' onClick={(e) => {
                e.stopPropagation();
                setShowPhoneNavModal(false);
                setActiveContainer('Foundation Applications')
            }}>
                <i className='fa-solid fa-earth-asia text-2xl w-[40px] h-[40px] flex items-center justify-center rounded-full bg-grass text-pale_yellow'/>
                <h1 className='font-shining text-3xl text-grass'>Foundations</h1>
            </button>

            <button className='flex flex-row items-center justify-start gap-2' onClick={(e) => {
                e.stopPropagation();
                setShowPhoneNavModal(false);
                setActiveContainer('Settings')
            }}>
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
    </div>
  )
}
