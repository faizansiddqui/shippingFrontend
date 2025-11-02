"use client";

import { useState } from 'react';
import { Menu, X, Package, TrendingUp, Users, Star } from 'lucide-react';
import Image from 'next/image';
import Navbar from './Navbar';
import Link from 'next/link';

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6 text-center pt-4 lg:text-left">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Empower Your{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                  Ecommerce
                </span>{' '}
                Shipments with{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                  Smart Solutions
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Transform your courier management with intuitive, data-driven solutions for better efficiency, accuracy, and growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={'/signup'}>
                <button className="w-full cursor-pointer sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Register Now
                </button>
              </Link>

              <Link href={'/dashboard'}>
                <button className="w-full cursor-pointer sm:w-auto border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Dashboard
                </button>
              </Link>

            </div>

            {/* Rating Section */}
            <div className="flex items-center justify-center lg:justify-start space-x-4 pt-4">
              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-5 w-5 text-orange-500 fill-current" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl font-bold text-gray-900">4.3</span>
                    <span className="text-gray-600">Rated</span>
                  </div>
                  <p className="text-sm text-gray-500">by 24+ satisfied e-commerce vendors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Grid */}
          <div className="relative animate-fade-in-right">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Top Left - Logistics Flow */}
              <div className="relative group">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform group-hover:scale-105 group-hover:rotate-2">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/shipimg2.png"
                      width={100}
                      height={100}
                      alt="Logistics management"
                      className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Smart Routing</span>
                  </div>
                </div>
              </div>

              {/* Top Right - Analytics */}
              <div className="relative group sm:mt-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform group-hover:scale-105 group-hover:-rotate-2">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/shipimg3.png"
                      width={100}
                      height={100}
                      alt="Analytics dashboard"
                      className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Real-time Analytics</span>
                  </div>
                </div>
              </div>

              {/* Bottom Left - Dashboard */}
              <div className="relative group">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform group-hover:scale-105 group-hover:-rotate-2">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/shipimg4.png"
                      width={100}
                      height={100}
                      alt="Dashboard interface"
                      className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Team Management</span>
                  </div>
                </div>
              </div>

              {/* Bottom Right - Delivery */}
              <div className="relative group sm:mt-6">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform group-hover:scale-105 group-hover:rotate-2">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/shipimg5.png"
                      width={100}
                      height={100}
                      alt="Delivery person"
                      className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-30 animate-pulse blur-md"></div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-pulse delay-1000 blur-md"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 animate-bounce blur-sm"></div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Logistics</h3>
            <p className="text-gray-600">Optimize your shipping routes with AI-powered recommendations and real-time tracking capabilities.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Data Analytics</h3>
            <p className="text-gray-600">Make informed decisions with comprehensive analytics and detailed performance metrics.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
            <p className="text-gray-600">Streamline communication and coordination across your entire logistics team.</p>
          </div>
        </div>
      </section>
    </div>
  );
}