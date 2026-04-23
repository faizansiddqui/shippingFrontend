import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
            <div className="max-w-xl text-center p-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Page not found</h1>
                <p className="text-gray-600 mb-6">Sorry, we couldn't find the page you're looking for.</p>
                <div className="flex justify-center gap-4">
                    <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">Home</Link>
                    <Link href="/contact-us" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Contact Support</Link>
                </div>
            </div>
        </main>
    );
}
