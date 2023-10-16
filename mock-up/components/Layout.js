import React, { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import { auth } from '@/lib/firebase';

export default function Layout(props) {

    const { children } = props

    const [ user, setUser ] = useState(null)

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user) {
                setUser(user)
            } else {
                setUser(null)
            }
        })
    }, [])

    return (
        <div className='min-h-screen'>
            <main>
                {children}
            </main>
        </div>
    )
}
