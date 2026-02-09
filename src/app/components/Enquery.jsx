"use client"

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Inquiry() {
    const [formData, setFormData] = useState({
        pickupPin: '',
        destPin: '',
        length: 10,
        width: 20,
        height: 3,
        actualWeight: 500,
        weightUnit: 'gram',
        volWeight: 0,
        shipValue: 1000,
        parcelType: 'prepaid'
    });

    const [pickupLocation, setPickupLocation] = useState({ city: 'Delhi', pin: '110001' });
    const [destLocation, setDestLocation] = useState({ city: 'Hyderabad', pin: '500001' });
    const [weightInfo, setWeightInfo] = useState({ vol: 0.5, actual: 0.5 });

    const [rates, setRates] = useState([
        { img: '/image1.png', days: 4.3, price: '₹0.00', gst: 0.00, total_price_gst_included: 0, cutoff_time: '00:00', },
        { img: '/image2.png', days: 4.6, price: '₹0.00', gst: 0.00, total_price_gst_included: 0, cutoff_time: '00:00', },
        { img: '/image3.png', days: 3.8, price: '₹0.00', gst: 0.00, total_price_gst_included: 0, cutoff_time: '00:00', },
        { img: '/image4.png', days: 7, price: '₹0.00', gst: 0.00, total_price_gst_included: 0, cutoff_time: '00:00', },
        { img: '/image5.png', days: 4.2, price: '₹0.00', gst: 0.00, total_price_gst_included: 0, cutoff_time: '00:00', },
        { img: '/image6.png', days: 2, price: '₹0.00', gst: 0.00, total_price_gst_included: 0, cutoff_time: '00:00', },
        { img: '/image7.png', days: 4.6, price: '₹0.00', gst: 0.00, total_price_gst_included: 0, cutoff_time: '00:00', },
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [highlightRates, setHighlightRates] = useState(false);

    const courierImageMap = {
        'BlueDart Express': '/image1.png',
        'DTDC': '/image2.png',
        'Delhivery': '/image3.png',
        'Ecom Express': '/image4.png',
        'Xpressbees': '/image5.png',
        'Shadowfax': '/image6.png',
        'Ekart': '/image7.png',
    };

    const ratesRef = useRef(null);

    useEffect(() => {
        // Calculate initial volumetric weight on mount
        const l = formData.length;
        const w = formData.width;
        const h = formData.height;
        const vol = (l * w * h) / 5000;
        setFormData(prev => ({ ...prev, volWeight: vol }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (['length', 'width', 'height', 'actualWeight', 'shipValue', 'volWeight'].includes(name)) {
            val = parseFloat(value) || 0;
        }
        setFormData((prev) => {
            let newData = { ...prev, [name]: val };
            if (['length', 'width', 'height'].includes(name)) {
                const l = name === 'length' ? (parseFloat(value) || 0) : (parseFloat(newData.length) || 0);
                const w = name === 'width' ? (parseFloat(value) || 0) : (parseFloat(newData.width) || 0);
                const h = name === 'height' ? (parseFloat(value) || 0) : (parseFloat(newData.height) || 0);
                const vol = (l * w * h) / 5000;
                newData.volWeight = vol;
            }
            return newData;
        });
    };

    const fetchLocation = async (pin, isPickup) => {
        if (pin.length !== 6) return;
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await res.json();

            if (data[0].Status === 'Success') {
                const po = data[0].PostOffice[0];
                const city = `${po.District}, ${po.State}`;
                if (isPickup) {
                    setPickupLocation({ city, pin });
                } else {
                    setDestLocation({ city, pin });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let actual_kg = formData.actualWeight;
            if (formData.weightUnit === 'gram') actual_kg /= 1000;
            const vol_kg = formData.volWeight || 0;
            const chargeable_kg = Math.max(actual_kg, vol_kg);
            const cod = formData.parcelType === 'cod';
            const body = {
                Pickup_pincode: formData.pickupPin,
                Delivery_pincode: formData.destPin,
                cod,
                total_order_value: formData.shipValue,
                weight: chargeable_kg,
            };
            const res = await fetch('https://backendshipping.onrender.com/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            console.log(data);
            // Assuming data is an array of {courier_name, days, price, gst}
            const mappedRates = data.map((d) => ({
                courier: d.courier_name,
                days: d.days,
                price: `₹${parseFloat(d.total_freight).toFixed(2)}`,
                gst: d.GST,
                total_price_gst_included: d.total_Price_GST_Included,
                img: courierImageMap[d.courier_name] || null,
                cutoff_time: d.cutoff_time,
            }));

            setRates(mappedRates);
            setWeightInfo({ vol: vol_kg, actual: actual_kg });
            
            try {
                if (typeof window !== 'undefined') {
                    const names = mappedRates.map(r => r.courier);
                    localStorage.setItem('CourierServiceNames', JSON.stringify(names));
                }
            }
            catch (e) {
                console.error('Error saving CourierServiceNames to localStorage', e);
            }
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);

        // Focus/scroll logic
        if (ratesRef.current) {
            if (window.innerWidth < 1024) {
                // Mobile: auto-scroll
                ratesRef.current.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Desktop: highlight effect
                setHighlightRates(true);
                setTimeout(() => setHighlightRates(false), 3000);
            }
        }
    };

    return (
        <div className="min-h-screen text-black bg-gradient-to-br from-purple-50 to-blue-50 flex justify-center p-4 sm:p-8 pt-20">
            <div className="flex flex-col lg:flex-row gap-6 max-w-6xl w-full">
                {/* Left Form Section */}
                <div className=" p-6 sm:p-8 flex-1 border border-purple-100/50">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                        Parcel Inquiry
                    </h2>
                    <div className="space-y-6">
                        {/* Pincode Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Pincode</label>
                                <input
                                    type="text"
                                    name="pickupPin"
                                    value={formData.pickupPin}
                                    onChange={handleChange}
                                    onBlur={() => fetchLocation(formData.pickupPin, true)}
                                    placeholder="Enter pickup pincode"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800 placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination Pincode</label>
                                <input
                                    type="text"
                                    name="destPin"
                                    value={formData.destPin}
                                    onChange={handleChange}
                                    onBlur={() => fetchLocation(formData.destPin, false)}
                                    placeholder="Enter destination pincode"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Length (cm)</label>
                                <input
                                    type="number"
                                    name="length"
                                    value={formData.length}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Width (cm)</label>
                                <input
                                    type="number"
                                    name="width"
                                    value={formData.width}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Height (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Weights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Actual Weight</label>
                                <input
                                    type="number"
                                    name="actualWeight"
                                    value={formData.actualWeight}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800"
                                />
                            </div>
                            <div className="flex items-end">
                                <select
                                    name="weightUnit"
                                    value={formData.weightUnit}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800"
                                >
                                    <option value="gram">Gram</option>
                                    <option value="kg">Kilogram</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Volumetric Weight (kg)</label>
                                <input
                                    type="number"
                                    name="volWeight"
                                    value={formData.volWeight.toFixed(2)}
                                    onChange={handleChange}
                                    placeholder="Enter volumetric weight"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Shipment Value and Parcel Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipment Value (₹)</label>
                                <input
                                    type="number"
                                    name="shipValue"
                                    value={formData.shipValue}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parcel Type</label>
                                <select
                                    name="parcelType"
                                    value={formData.parcelType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 bg-gray-50/50 text-gray-800"
                                >
                                    <option value="prepaid">Prepaid</option>
                                    <option value="cod">Cash on Delivery</option>
                                </select>
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300"
                        >
                            {isLoading ? 'Checking...' : 'Check Rates'}
                        </button>
                    </div>

                    <Image
                        src={'/calcImg.png'}
                        width={500}
                        height={500}
                        alt='calcImg'
                        className="mt-6 mx-auto block rounded-2xl"
                    />
                </div>

                {/* Right Rates Table */}
                <div
                    ref={ratesRef}
                    className={`p-6 sm:p-8 flex-1 border border-purple-100/50 transition-all duration-500 ${highlightRates ? 'ring-4 ring-purple-400 bg-purple-50/50' : ''}`}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                        Shipping Rates
                    </h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>From</span>
                            <span>To</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-800">
                            <span>{pickupLocation.city}</span>
                            <span className="mx-2">→</span>
                            <span>{destLocation.city}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{pickupLocation.pin}</span>
                            <span>{destLocation.pin}</span>
                        </div>
                        <div className="text-sm text-gray-600">{formData.parcelType.charAt(0).toUpperCase() + formData.parcelType.slice(1)}</div>
                        <div className="text-sm text-gray-600">Weight: Volumetric {weightInfo.vol.toFixed(1)}kg | Actual {weightInfo.actual.toFixed(1)}kg</div>
                        <div className="text-sm text-green-600 font-medium">Eligible for GST input tax credit</div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-gray-200">
                                    <th className="pb-3 font-semibold text-gray-700">Courier</th>
                                    <th className="pb-3 font-semibold text-gray-700 text-center">Cut-off time</th>
                                    <th className="pb-3 font-semibold text-gray-700 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-100 hover:bg-purple-50/70 transition-all duration-300 rounded-lg"
                                    >
                                        {/* Courier Image / Name */}
                                        <td className="py-4 px-3 flex items-center gap-3">
                                            {row.img ? (
                                                <Image
                                                    src={row.img}
                                                    alt={`Courier ${index + 1}`}
                                                    width={40}
                                                    height={40}
                                                    className="object-contain rounded-md shadow-sm"
                                                />
                                            ) : (
                                                <span className="font-semibold text-gray-800">{row.courier}</span>
                                            )}
                                        </td>

                                        {/* Delivery Days */}
                                        <td className="py-4 px-3 text-center">
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                                                {row.cutoff_time}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="py-4 px-3 text-right">
                                            <div className="text-gray-900 font-semibold text-lg">
                                                {row.price}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ₹{Math.ceil(row.gst)} GST
                                            </div>
                                            <div className="mt-2 text-sm">
                                                <span className="text-gray-700 font-semibold  "> Payable Price </span>
                                                <span className="text-purple-500 font-bold ">
                                                    ₹{Math.ceil(row.total_price_gst_included)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                    <div className="text-xs text-gray-500 mt-4">
                        Estimated delivery days are based on average courier performance for the given pincodes.
                    </div>
                </div>
            </div>
        </div>
    );
}