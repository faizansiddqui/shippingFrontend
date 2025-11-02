// app/page.js
import Image from "next/image";

export default function Ship() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        
        {/* Left Features Section */}
        <div className="space-y-6">
          <ul className="space-y-6 text-gray-800 text-lg">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✔</span>
              <span>Upload bulk orders via CSV or API to process hundreds of shipments quickly — ideal for high-volume sellers.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✔</span>
              <span>Our smart engine auto-selects the best courier based on cost, speed, and reliability.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✔</span>
              <span>Centralized tracking updates across all courier partners — accessible from one dashboard.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">✔</span>
              <span>Offer both Cash on Delivery and prepaid options across courier services, with COD remittance tracking.</span>
            </li>
          </ul>
        </div>

        {/* Right Image Section */}
        <div className="flex justify-center">
          <Image
            src="/Ship.png" // replace with your image path
            alt="Shipping Dashboard"
            width={500}
            height={400}
            className="rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
