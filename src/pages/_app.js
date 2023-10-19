import '../styles/globals.css'
import { AuthProvider } from '../lib/context'
import Layout from '../components/Layout'
import { Toaster } from 'react-hot-toast'

function MyApp({ Component, pageProps }) {

  return (
  <AuthProvider>
    <Layout>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        reverseOrder={false} />
    </Layout>
  </AuthProvider>
  )
}

export default MyApp