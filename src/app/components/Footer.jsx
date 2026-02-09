import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-50 to-gray-50 py-12 px-4 sm:px-6 md:px-8 lg:px-16 shadow-lg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Section: Logo, Tagline, Social Icons */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-3">
            <Image
              src="/mslogo.png"
              alt="MS Logistic Logo"
              width={150}
              height={150}
              className="object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          <p className="text-gray-700 text-base leading-relaxed max-w-md">
            By leveraging automated cross-carrier quoting and analytics, Shipneer empowers sellers with smarter shipping decisions.
          </p>
          {/* <div className="flex space-x-6">
            <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <Image
                src="/instagram.png"
                alt="Instagram icon"
                width={24}
                height={24}
                className="hover:opacity-80"
              />
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <Image
                src="/facebook.png"
                alt="Facebook icon"
                width={24}
                height={24}
                className="hover:opacity-80"
              />
            </Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <Image
                src="/x.png"
                alt="X icon"
                width={24}
                height={24}
                className="hover:opacity-80"
              />
            </Link>
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <Image
                src="/linkedin.png"
                alt="LinkedIn icon"
                width={24}
                height={24}
                className="hover:opacity-80"
              />
            </Link>
          </div> */}
        </div>

        {/* Middle Section: Company Links */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-gray-800 font-bold text-xl tracking-wide">Company</h2>
          <ul className="space-y-3 text-gray-600">

            <li><a href="/" className="hover:text-blue-600 transition-colors duration-200 text-base">Home</a></li>

            <li>
              <Link href={"/about"} className="hover:text-blue-600 transition-colors duration-200 text-base">About Us</Link>
            </li>

            {/* <li><a href="#" className="hover:text-blue-600 transition-colors duration-200 text-base">Rate Calculator</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors duration-200 text-base">Review</a></li> */}

            <li>
              <Link href="/term-and-condition" className="hover:text-blue-600 transition-colors duration-200 text-base">Terms & Conditions</Link>
            </li>

            <li>
              <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors duration-200 text-base">Privacy Policy</Link>
            </li>

            <li>
              <a href="/refund-policy" className="hover:text-blue-600 transition-colors duration-200 text-base">Refund Policy</a>
            </li>
          </ul>
        </div>

        {/* Right Section: Contact */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-gray-800 font-bold text-xl tracking-wide">Contact</h2>
          <ul className="space-y-3 text-gray-600 text-base">
            <li className="flex items-center space-x-2">
              <span className="text-blue-600">📞</span>
              <span>(+91) 6377007138</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-600">✉️</span>
              <span>support@mslogistic.com</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-600">📍</span>
              <span>Nokha, Bikaner, SO, Rajasthan - 334803, india</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-sm space-y-4 sm:space-y-0">
        <p>© 2025 MS Logistic All rights reserved.</p>
        <p>Developed By <b>Akamify</b></p>
      </div>
    </footer>
  );
};

export default Footer;  