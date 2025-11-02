

export default function RefundPolicy() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
              Refund Policy
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              At MSLogistic, we use a wallet-based payment system. You need to add money to your MSLogistic Wallet to book shipments. This policy explains when and how refunds are processed in simple terms.
            </p>
          </div>

          {/* Refund for Shipment Cancellation Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">
              Refund for Shipment Cancellation
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                If you cancel a shipment before it is picked up, the amount will be refunded to your MSLogistic Wallet.
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                No refunds will be given if the shipment has already been picked up by the courier.
              </li>
            </ul>
          </div>

          {/* Wallet Balance Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">
              Wallet Balance
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                You can use the money in your MSLogistic Wallet for future bookings or related charges.
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Refunds are credited only to your wallet, not directly to your bank account (except in the case below).
              </li>
            </ul>
          </div>

          {/* Account Closure Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">
              Account Closure
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you permanently close your MSLogistic account, any remaining balance in your wallet will be transferred to your bank account after verification.
            </p>
          </div>

          {/* Contact Us Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions, email us at <a href="mailto:support@mslogistic.com" className="text-blue-500 hover:underline font-medium">support@mslogistic.com</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}