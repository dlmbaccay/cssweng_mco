import React from 'react'
import Router from 'next/router';

export default function ErrorPage() {
    const router = Router;
  return (
    <div>
        <h1>404</h1>
        <p>Page not found</p>
        <button onClick={() => router.push('/')}>Go back home</button>
    </div>
  )
}
