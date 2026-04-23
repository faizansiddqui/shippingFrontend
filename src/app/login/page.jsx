import React from 'react'
import Login from '../components/Login'

const page = () => {
  return (
    <div>
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Login />
      </React.Suspense>
    </div>
  )
}

export default page