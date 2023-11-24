import React from 'react'
import withSpecialAuth from '@/src/components/withSpecialAuth'

function index() {
  return (
    <div>Admin Landing Page</div>
  )
}

export default withSpecialAuth('KEIay0tvXbf3ha2z20zZpFccpWj1')(index)