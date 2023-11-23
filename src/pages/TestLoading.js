import React from 'react'

import Loader from '../components/Loader'

export default function TestLoading() {
  return (
    <div className='min-h-screen min-w-full'>
        <Loader show={true} />
    </div>
  )
}
