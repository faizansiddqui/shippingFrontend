import React from "react";

export default function PrivacyPolicy({ effectiveDate = "Insert Date" }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="rounded-2xl bg-white shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">MS</div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Privacy Policy</h1>
                <p className="mt-2 text-sm text-gray-600">At <span className="font-medium">MS-LOGISTIC</span>, we value your privacy and are dedicated to keeping your personal information safe.</p>
                <p className="mt-1 text-xs text-gray-400">Effective Date: <span className="font-medium text-gray-700">{effectiveDate}</span></p>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">About this Policy</h2>
            <p className="text-gray-600 leading-relaxed">This Privacy Policy explains what data we collect, how we use it, and the steps we take to protect it when you use our website <span className="font-medium">ms-logistic.com</span> and related services.</p>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-800">Information We Collect</h3>
            </div>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293A1 1 0 105.293 10.707l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-gray-700 font-medium">Contact details</p>
                  <p className="text-sm text-gray-600">Your name, phone number, email address, and shipping address.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h2v8a2 2 0 002 2h6a2 2 0 002-2V6h2a1 1 0 100-2h-2V3a1 1 0 00-1-1H6z" />
                </svg>
                <div>
                  <p className="text-gray-700 font-medium">Shipment details</p>
                  <p className="text-sm text-gray-600">Pickup & delivery addresses, package weight, declared value, and other shipment-specific details.</p>
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-md font-semibold text-gray-800">How We Use Your Information</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard title="Process & Deliver" description="To process bookings and ensure timely delivery of your shipments." />
              <FeatureCard title="Communications" description="To contact you about services, updates, and customer support." />
              <FeatureCard title="Operations" description="To share required details with courier partners and payment providers for smooth operations." />
              <FeatureCard title="Compliance" description="To meet legal and regulatory obligations when necessary." />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-md font-semibold text-gray-800">Sharing of Information</h3>
            <p className="text-gray-600 mt-3">We respect your trust and do not sell or rent your personal information. We only share data when necessary:</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• With trusted third parties such as courier partners and payment processors for business needs.</li>
              <li>• When required by law, court order, or a government authority.</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-md font-semibold text-gray-800">Data Retention</h3>
            <p className="text-gray-600 mt-3">We keep your personal data only as long as necessary to provide our services, comply with legal obligations, or for other legitimate business purposes.</p>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-md font-semibold text-gray-800">Changes to This Policy</h3>
            <p className="text-gray-600 mt-3">We may update this Privacy Policy occasionally. Any revised policy will be posted on our website with the updated effective date.</p>
          </section>

          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-md font-semibold text-gray-800">Contact Us</h3>
            <p className="text-gray-600 mt-3">If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
            <a href="mailto:support@mslogistic.com" className="inline-flex items-center gap-2 mt-3 text-indigo-600 font-medium">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M2.94 6.94A2 2 0 014 6h12a2 2 0 011.06.28L10 11 2.94 6.94z" />
                <path d="M18 8.5V14a2 2 0 01-2 2H4a2 2 0 01-2-2V8.5l8 4 8-4z" />
              </svg>
              support@mslogistic.com
            </a>
          </section>

          <footer className="text-center text-sm text-gray-400 mt-4">© {new Date().getFullYear()} MS-LOGISTIC — All rights reserved.</footer>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
    </div>
  );
}
