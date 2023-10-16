import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import Router from 'next/router';

export default function Login() {

    const router = Router;
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('')
    const [ error, setError ] = useState('')

    async function submitHandler(e) {
      e.preventDefault();

      if(!email || !password) {
        setError('Please fill in all fields') 
      } else {
        try { 
          
          await signInWithEmailAndPassword(auth, email, password)

          // persistence is set to local
          // await setPersistence(auth, browserLocalPersistence)

          // persistence is set to session
          // await setPersistence(auth, browserSessionPersistence)

          const user = auth.currentUser;
          console.log(user)

          router.push('/Dashboard')
        }
        catch (error) { 
          alert(error) 
          setError('Incorrect email or password') }
        return
      }
    }

  return (
    <div className='flex flex-1 justify-center items-center h-full bg-violet-50'>
      <div id="login" className='flex flex-col lg:flex-row h-screen justify-center items-center w-full'>
        
        <form className='justify-center items-center flex flex-col bg-blue-500 w-full h-2/3'>

          <h1 className='font-extrabold uppercase mb-5 text-6xl'>Login</h1>

          { error && <div className='w-full max-w-[280px] text-center border border-solid border-rose-500 text-rose-500 p-2'>{error}</div> }

          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text" 
            placeholder='Email Address'
            className='m-1 p-2 outline-none w-[280px] mt-5 lg:w-[300px]'
          />
          <input 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password" 
            placeholder='Password'
            className='m-1 p-2 outline-none w-[280px] lg:w-[300px]'
          />
          
          {/* to be implemented :) */}
          <div className='flex mt-2 w-[280px] justify-center lg:w-[300px]'>
            <input id='remember' type="checkbox" className='mr-2'/> <label for='remember' className='text-md'>Remember Me</label>
          </div>

          <button
            onClick={submitHandler}
            className='bg-black p-2 m-1 mt-3 text-white w-[280px] lg:w-[300px] hover:opacity-40 duration-300'
          >Submit</button>
          
          <div className='mt-5'>No account yet? <Link href="/Register" className='font-extrabold hover:opacity-50'>Register</Link></div>   
        </form>

        <div id="showcase" className='border-white lg:m-5 bg-green-300 p-1 w-full h-1/3'>
          <Image src="/images/pet-showcase.jpeg" width={500} height={500} alt='doggo' className='items-center justify-center'/>
        </div>
      </div>
    </div>
    )
}
