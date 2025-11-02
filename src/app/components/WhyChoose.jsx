'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function WhyChoose() {
  const [isVisible, setIsVisible] = useState(false);
  const [particleStyles, setParticleStyles] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const styles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
    }));
    setParticleStyles(styles);
  }, []);

  const stats = [
    {
      value: '1k+',
      label: 'Shipments/Day',
      icon: '/shipment.png',
      color: 'from-blue-500 to-cyan-500',
      bgGlow: 'shadow-blue-500/20'
    },
    {
      value: '250+',
      label: 'Hubs',
      icon: '/hubs.png',
      color: 'from-purple-500 to-pink-500',
      bgGlow: 'shadow-purple-500/20'
    },
    {
      value: '4,500+',
      label: 'Service Centres',
      icon: '/serviceCenter.png',
      color: 'from-green-500 to-emerald-500',
      bgGlow: 'shadow-green-500/20'
    },
    {
      value: '20,000+',
      label: 'Pin Codes',
      icon: '/world.png',
      color: 'from-orange-500 to-red-500',
      bgGlow: 'shadow-orange-500/20'
    },
    {
      value: '42+',
      label: 'Cities Warehouses',
      icon: '/werehouse.png',
      color: 'from-indigo-500 to-blue-500',
      bgGlow: 'shadow-indigo-500/20'
    },
    {
      value: '100+',
      label: 'Businesses Served',
      icon: '/BusinessesServed.png',
      color: 'from-teal-500 to-cyan-500',
      bgGlow: 'shadow-teal-500/20'
    },
    {
      value: '10M+',
      label: 'Parcels Shipped Since Inception',
      icon: '/parcleShipped.png',
      color: 'from-rose-500 to-pink-500',
      bgGlow: 'shadow-rose-500/20'
    },
    {
      value: '1 Day',
      label: 'Fase Delivery System',
      icon: '/fastDelivery.png',
      color: 'from-rose-500 to-pink-500',
      bgGlow: 'shadow-rose-500/20'
    },
  ];

  const CountUpAnimation = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (!isVisible || hasAnimated) return;

      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      const suffix = value.replace(/[0-9]/g, '');
      let startValue = 0;
      const endValue = numericValue;
      const incrementTime = duration / endValue;

      const timer = setInterval(() => {
        startValue += Math.ceil(endValue / (duration / 50));
        if (startValue >= endValue) {
          setCount(endValue + suffix);
          setHasAnimated(true);
          clearInterval(timer);
        } else {
          setCount(startValue + suffix);
        }
      }, 50);

      return () => clearInterval(timer);
    }, [isVisible, value, duration, hasAnimated]);

    return <span>{count || value}</span>;
  };

  return (
    <div className="relative min-h-screen overflow-hidden ">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gray-800/10 rounded-full animate-pulse"
            style={style}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Header Section */}
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-4 mb-4 px-6 py-3 rounded-full bg-gray-100 backdrop-blur-md border border-gray-200">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm font-medium">Leading Logistics Partner</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
              Why Choose{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Us
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              </span>
            </h2>
            
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
              <Image
                src="/mslogo.png"
                alt="Shipnet Logo"
                width={140}
                height={70}
                className="drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              />
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto justify-items-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`group transform transition-all duration-700 w-full ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200 p-8 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${stat.bgGlow} group-hover:border-gray-300 min-h-64 flex flex-col items-center justify-between`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-all duration-500 rounded-2xl`}></div>
                  
                  {/* Icon container */}
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 backdrop-blur-md flex items-center justify-center group-hover:bg-gray-200 transition-all duration-300 group-hover:scale-110">
                      <Image
                        src={stat.icon}
                        alt={stat.label}
                        width={50}
                        height={50}
                        className="drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Stats content */}
                  <div className="relative z-10 mt-auto">
                    <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 group-hover:bg-clip-text transition-all duration-300">
                      <CountUpAnimation value={stat.value} />
                    </div>
                    <div className="text-gray-600 text-sm md:text-base font-medium leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-gray-200 to-transparent transform -skew-x-12 group-hover:animate-shine"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className={`mt-16 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 backdrop-blur-md border border-gray-200 hover:border-gray-300 transition-all duration-300 group cursor-pointer">
              <span className="text-gray-900 font-medium">Trusted by thousands worldwide</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}