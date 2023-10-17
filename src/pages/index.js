import Head from "next/head";
import React, { useEffect, useState } from "react";
import Router from "next/router";

export default function Home() {

    // no auth logic yet
    const router = Router;
    router.push('/Login');
        
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