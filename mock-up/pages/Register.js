import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('')
    const [ error, setError ] = useState('')

    async function submitHandler(e) {
      e.preventDefault();

      if(!email || !password) {
        setError('Please fill in all fields') 
      } else {
        try { 
          await createUserWithEmailAndPassword(auth, email, password)
          router.push('/Dashboard')
        }
        catch (error) { setError('Incorrect email or password') }
        return
      }
    }

  return (
    <div className='flex flex-1 justify-center items-center h-full bg-violet-50'>
      <div id="login" className='flex flex-col lg:flex-row h-screen justify-center items-center gap-10'>
        
        <form className='justify-center items-center m-5 flex flex-col'>

          <h1 className='font-extrabold uppercase mb-5 text-6xl'>Register</h1>

          { error && <div className='w-full max-w-[350px] text-center border border-solid border-rose-500 text-rose-500 p-2'>{error}</div> }

          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text" 
            placeholder='Email Address'
            className='m-1 p-2 outline-none w-[350px] mt-5'
          />
          <input 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password" 
            placeholder='Password'
            className='m-1 p-2 outline-none w-[350px]'
          />
          <button
            onClick={submitHandler}
            className='bg-black p-2 m-1 mt-3 text-white w-[350px] hover:opacity-40 duration-300'
          >Submit</button>
          
          <div className='mt-5'>Already have an account? <Link href="/Login" className='font-extrabold hover:opacity-50'>Login</Link></div>   
        </form>

        <div id="showcase" className='border-8 border-white m-5'>
          <Image src="/images/pet-showcase.jpeg" width={600} height={600} alt='doggo'/>
        </div>
      </div>
    </div>
    )
}
