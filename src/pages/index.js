import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useUserData } from "../lib/hooks";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loader from "../components/Loader";

export default function Landing() {
    const { user } = useUserData();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true); // Set loading to true initially

            setTimeout(() => {
                if (user) {
                    router.push("/Home");
                } else {
                    router.push("/Login");
                }
                setLoading(false);
            }, 1500); // Delay for 3 seconds (3000 milliseconds)
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <>
            <Head>
                <title>BantayBuddy</title>
            </Head>

            {loading ? <Loader /> : null}
        </>
    );
}