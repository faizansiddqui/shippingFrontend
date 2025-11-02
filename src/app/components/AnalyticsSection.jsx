'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const AnalyticsSection = () => {
  return (
    <div className="bg-gradient-to-b from-white via-pink-50 to-pink-100 py-8 px-4 sm:px-6 md:px-12 lg:px-24 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 w-full">
        {/* Left Side: Text Content */}
        <div className="lg:w-1/2 text-left order-2 lg:order-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight animate-fade-in">
            Gain deeper insights<br className="hidden sm:block" /> backed by powerful<br className="hidden md:block" /> analytics
          </h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed animate-fade-in animation-delay-200">
            Get a comprehensive dashboard. Keep an eye on important<br className="hidden sm:block" />
            shipping KPIs, and make informed decisions.
          </p>
          <ul className="space-y-3 mb-6 text-left animate-fade-in animation-delay-400">
            <li className="flex items-center text-purple-700 text-sm sm:text-base">
              <span className="mr-3 text-lg">✓</span> Take charge of shipping operations
            </li>
            <li className="flex items-center text-purple-700 text-sm sm:text-base">
              <span className="mr-3 text-lg">✓</span> View shipping metrics and performance
            </li>
            <li className="flex items-center text-purple-700 text-sm sm:text-base">
              <span className="mr-3 text-lg">✓</span> Monitor shipping spends
            </li>
          </ul>
          <Link
            href={"/dashboard"}
            className="inline-block text-purple-700 font-semibold text-sm sm:text-base bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ml-0 animate-fade-in animation-delay-600"
          >
            Get Started →
          </Link>
        </div>

        {/* Right Side: Graphic */}
        <div className="lg:w-1/2 relative flex justify-center order-1 lg:order-2 w-full">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[3/2] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto rounded-2xl overflow-hidden shadow-xl border border-gray-200 animate-slide-up">
            <Image
              src="/shippingimg.png"
              alt="Shipping analytics dashboard"
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        @media (max-width: 640px) {
          .aspect-[4/3] { aspect-ratio: 4/3; }
        }
        @media (max-width: 480px) {
          .aspect-[4/3] { aspect-ratio: 1/1; max-width: 200px; }
        }
        @media (max-width: 320px) {
          .aspect-[4/3] { aspect-ratio: 3/4; max-width: 150px; }
          h1 { font-size: 1.5rem; line-height: 1.2; }
          p, li { font-size: 0.875rem; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsSection;