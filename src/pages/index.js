import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useUserData } from "../lib/hooks";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loader from "../components/Loader";
import toast from 'react-hot-toast'
export default function Landing() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user, username, reportCount } = useUserData();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true); // Set loading to true initially
            
            setTimeout(() => {
                if (user) {
                    toast.success(user.uid);
                    // if userid is of admin, redirect to admin page
                    if (user.uid === "DX1Zzib1x5Ny0J42pNwzfdMTynE3") {
                        router.push("/admin");
                    } else {
                        router.push("/Home");
                    }
                } else {
                    router.push("/Login");
                }
                setLoading(false);
            }, 1500); // Delay for 3 seconds (3000 milliseconds)
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <Head>
                <title>BantayBuddy</title>
                <link rel="icon" href="/images/logo.ico"/>
            </Head>

            {loading ? <Loader show={true}/> : null}
        </>
    );
}