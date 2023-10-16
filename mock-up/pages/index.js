import Head from "next/head";
import React, { useEffect, useState } from "react";
import Router from "next/router";
import { auth } from '@/lib/firebase';

export default function Home() {

    const [ user, setUser ] = useState(null)
    const router = Router;
    
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user) {
                setUser(user)
                router.push('/Dashboard')
            } else {
                setUser(null)
                router.push('/Login')
            }
        })
    }, [router, user])

    return (
        <>
            <Head>
                <title>Pet Hub</title>
            </Head>

            <div className='flex min-h-screen items-center justify-center'>
                <i className='fa-solid fa-spinner animate-spin text-black text-[50px]' />
            </div>
        </>
    );
}