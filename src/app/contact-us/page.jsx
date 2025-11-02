"use client";

import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {
    return (
        <section className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-10">
                {/* Left Side */}
                <div className="flex-1 text-center md:text-left">
                    <span className="inline-block mb-4 px-5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium shadow-sm">
                        Reach Out To Us
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 leading-tight">
                        Send Us A Message.
                    </h2>
                    <p className="text-gray-500 mb-8 text-lg">
                        Or just reach out manually at{" "}
                        <a
                            href="mailto:hello@slotuhi.com"
                            className="text-blue-600 hover:underline font-semibold"
                        >
                            support@mslogistic.com
                        </a>
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    {/* Card Template */}
                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white">
                        <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1 text-lg">
                            Live Chat
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                            Speak to our team quickly.
                        </p>
                        <a
                            href="mailto:hello@slotuhi.com"
                            className="text-blue-600 font-medium hover:underline text-sm"
                        >
                            support@mslogistic.com
                        </a>
                    </div>

                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white">
                        <Mail className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1 text-lg">
                            Submit Help Ticket
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                            We’re available to help via email.
                        </p>
                        <a
                            href="mailto:support@slotuhi.com"
                            className="text-blue-600 font-medium hover:underline text-sm"
                        >
                            support@mslogistic.com
                        </a>
                    </div>

                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white">
                        <MapPin className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1 text-lg">
                            Visit Our Office
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                            Visit our location in real life.
                        </p>
                        <p className="text-blue-600 font-medium text-sm">
                            Nokha, Bikaner, SO, Rajasthan - 334803, india
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white">
                        <Phone className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1 text-lg">
                            Call Us Directly
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                            Available during working hours.
                        </p>
                        <a
                            href="tel:+12344567789"
                            className="text-blue-600 font-medium hover:underline text-sm"
                        >
                            (+91) 6377007138
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
