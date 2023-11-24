import React from 'react'
import withSpecialAuth from '@/src/components/withSpecialAuth'
import { auth } from '@/src/lib/firebase'
import toast from 'react-hot-toast'

function Admin() {
  return (
    <div className='flex flex-row w-full h-screen overflow-hidden bg-dark_gray'>
      <button onClick={() => {
        auth.signOut()
        .then(() => {
          toast.success('Admin signed out')
        })
        .catch((error) => {
          console.log(error)
        })
      }}>
        Admin Log Out
      </button>
    </div>
  )
}

export default withSpecialAuth('luTr6y0B1TUOkimRQlfiCO9xQqo1')(Admin)