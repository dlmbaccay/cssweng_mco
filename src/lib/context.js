// import { createContext } from 'react';

// // export const UserContext = createContext({ user: null, username: null });
// export const UserContent = createContext({ user : null });

import React, { useContext, createContext, useState, useEffect, useRef } from "react";
import { auth, db } from "../lib/firebase";
import Router from "next/router";
import toast from "react-hot-toast";

const AuthContext = React.createContext();

export const UserContext = createContext({ user: null, username: null });

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = Router;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
            if (!user || !user.emailVerified) {
                router.push("/Login");
            } else if (user && !user.username) {
                router.push(`/AccountSetup`);
            } else if (user && user.username) {
                router.push("/Home");
            }
        });

        return unsubscribe;
    }, [ router, auth.currentUser ]);

    return (
        <AuthContext.Provider value={currentUser}>
            {!loading && children}
        </AuthContext.Provider>
    );
}