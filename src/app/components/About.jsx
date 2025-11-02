import Image from 'next/image'
import React from 'react'

const About = () => {
  return (
    <>
    <div className="relative w-full h-screen ">
      <div>

      </div>
      <Image 
        src="/LogisticCourier2.png"
        alt="logistic"
        fill
        priority
        className="object-cover border-t  border-amber-50"
      />
    </div>
    </>

  )
}

export default About;
