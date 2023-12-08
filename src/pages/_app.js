import '../styles/globals.css'
import Layout from '../components/Layout'
import { Toaster } from 'react-hot-toast'
import { UserContext } from '../lib/context';
import { useUserData } from '../lib/hooks';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {

  const userData = useUserData();

  return (
    <UserContext.Provider value={userData}>
      <Head>
        <title>BantayBuddy</title>
        <link rel="icon" href="images/logo.ico" />
      </Head>
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