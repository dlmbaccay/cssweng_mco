// import React, { useContext, useState, useEffect, useRef } from "react";
// import { auth, db } from "../lib/firebase";
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

// const AuthContext = React.createContext();

// export function useAuth() {
//     return useContext(AuthContext);
// }

// export function AuthProvider({ children }) {
//     const [currentUser, setCurrentUser] = useState(null)
//     const [loading, setLoading ] = useState(null)
//     const userInfo = useRef()

//     return (
//         <AuthContext.Provider>
//             { children }
//         </AuthContext.Provider>
//     )
// }