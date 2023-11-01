import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useUserData } from "../lib/hooks";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loader from "../components/Loader";

export default function Landing() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user, username } = useUserData();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true); // Set loading to true initially

            setTimeout(() => {
                if (user) {

                    if(username == null) {
                        router.push("/AccountSetup");
                        return;
                    }

                    router.push("/Home");
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
            </Head>

            {loading ? <Loader show={true}/> : null}
        </>
    );
}