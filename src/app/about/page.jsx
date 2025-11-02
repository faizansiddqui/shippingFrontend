"use client";

import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-white text-gray-800 py-16 mt-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto space-y-12 mb-10">
        {/* Hero / Intro */}
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About MS-Logistic
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              MS-Logistic is a leading courier & logistics company dedicated to connecting businesses and people across India with reliable, safe, and efficient delivery solutions. We specialize in handling everything from small documents to heavy industrial cargo — tailored to your needs.
            </p>
          </div>
          <div className="flex-1">
            <Image
              src="/logisticImgAbout.png"
              alt="Logistics operations"
              width={600}
              height={400}
              className="rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>

        {/* Our Services */}
        <div>
          <h2 className="text-3xl font-semibold mb-6">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-medium">Domestic Courier Services</h3>
              <p className="text-gray-600">
                Fast and secure parcel delivery across India. Door-to-door pickup and delivery for documents, e-commerce packages, and more.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-medium">Industrial & Heavy Cargo</h3>
              <p className="text-gray-600">
                Expert handling of project cargos, heavy machinery, out-of-gauge shipments, and plant relocations. We ensure safety and compliance at every step.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-medium">Express & Next-Day Delivery</h3>
              <p className="text-gray-600">
                Need delivery fast? We offer expedited services to get your shipments to their destination as quickly as possible.  
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-medium">Branch Network & Coverage</h3>
              <p className="text-gray-600">
                With multiple branches across India, we ensure strong local reach and faster service. Our branch network supports efficient logistics. :contentReference[oaicite:4] 
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div>
          <h2 className="text-3xl font-semibold mb-6">Why Choose MS-Logistic?</h2>
          <ul className="space-y-4 list-disc list-inside text-gray-600">
            <li><strong>Reliability & Trust:</strong> Strong track record in safe deliveries and customer satisfaction.</li>
            <li><strong>Comprehensive Solutions:</strong> From mail to heavy cargo, we cover it all.</li>
            <li><strong>Speed & Efficiency:</strong> Express and next-day services available. :contentReference[oaicite:5]</li>
            <li><strong>Wide Network:</strong> Branch presence ensures local pickup & faster last-mile delivery.</li>
            <li><strong>Experienced Team:</strong> Skilled in logistics planning, route optimization, safety, and handling.</li>
          </ul>
        </div>

        {/* Our Journey / Milestones */}
        <div>
          <h2 className="text-3xl font-semibold mb-6">Our Journey</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-medium">Founded & Growth</h3>
              <p className="text-gray-600">
                MS-Logistic began with a vision to make logistics seamless and dependable. Over time, we expanded our operations, adding more branches and diversifying services to become a full-scale logistics provider.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Branch Expansion</h3>
              <p className="text-gray-600">
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Commitment to Excellence</h3>
              <p className="text-gray-600">
                Our mission is to consistently improve, adapt to new technology, and exceed expectations — offering the best in logistics and courier services.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action / Get in Touch */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold mb-3">Ready to ship with us?</h3>
          <p className="text-gray-700 mb-5">Contact our team now and get a quote tailored to your requirements.</p>
          <a
            href="/contact-us"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
