import '../styles/globals.css'
import Layout from '../components/Layout'
import { Toaster } from 'react-hot-toast'

import { UserContext } from '../lib/context';
import { useUserData } from '../lib/hooks';
import Router from 'next/router';
import { useEffect } from 'react';
import { auth } from '../lib/firebase'

function MyApp({ Component, pageProps }) {

  const userData = useUserData();

  // sign out to every instance of app within browser when user signs out
  useEffect(() => {
    const signOut = () => {
      Router.push('/Login');
    }
    window.addEventListener('custom-sign-out', signOut);
    return () => window.removeEventListener('custom-sign-out', signOut);
  }, []);

  return (
    <UserContext.Provider value={userData}>
      <Layout>
        <Component {...pageProps} />
        <Toaster 
          position="top-right"
          reverseOrder={false} />
      </Layout>
    </UserContext.Provider>
  )
}

export default MyApp