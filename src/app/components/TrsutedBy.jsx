'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

export default function TrustedBy() {
  const logos = [
    '/image1.png',
    '/image2.png',
    '/image3.png',
    '/image4.png',
    '/image5.png',
    '/image6.png',
    '/image7.png',
  ];

  return (
    <div className="mt-24 mb-40 bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white p-6 rounded-lg ">
        <p className="text-center text-gray-600 mb-10 text-2xl">
          40+ businesses actively handling hassle-free and cost-effective shipments with Shipneer.
        </p>
        <div className="relative overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={5}
            autoplay={{ delay: 0, disableOnInteraction: false, reverseDirection: false }}
            speed={5000}
            loop={true}
            className="w-full"
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 30,
              },
            }}
          >
            {logos.map((logo, index) => (
              <SwiperSlide key={index} className="flex justify-center items-center">
                <Image
                  src={logo}
                  alt={`Logo ${index + 1}`}
                  width={150}
                  height={50}
                  className="object-contain max-w-full max-h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}