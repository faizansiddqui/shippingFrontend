import Image from 'next/image'
import React from 'react'

const page = () => {
  return (
    <div className='min-w-screen min-h-screen'>
      <Image 
        src={"/LogisticCourier.png"}
        className='min-w-screen min-h-screen'
        alt='logistic'
        width={100}
        height={100}
      />
    </div>
  )
}

export default page