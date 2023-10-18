import Head from "next/head";
import React, { useEffect, useState } from "react";
import Router from "next/router";
import Login from "./Login";

export default function Home() {
        
    return (
        <>
            <Head>
                <title>Pet Hub</title>
            </Head>

            <Login />

            {/* <div className='flex min-h-screen items-center justify-center'>
                <i className='fa-solid fa-spinner animate-spin text-black text-[50px]' />
            </div> */}
        </>
    );
}