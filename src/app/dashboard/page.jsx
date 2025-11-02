"use client";

import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, TrendingUp, ShoppingCart, Archive, IndianRupee } from "lucide-react";
import Link from "next/link";
import { useAuth } from '../../utils/checkAuth'; // Adjust path as needed

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState([]);

  // Fetch user orders (similar to OnlyMyOrder)
  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5000/user-orders', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchOrders();
    }
  }, [user, loading]);

  // Compute stats based on orders statuses
  useEffect(() => {
    if (orders.length === 0) return;

    const statusCounts = {
      ACCEPTED: 0,
      PENDING: 0,
      ON_WAY: 0,
      DELIVERED: 0,
    };

    let totalRevenue = 0;

    orders.forEach(order => {
      if (order.status === 'ACCEPTED') statusCounts.ACCEPTED++;
      if (order.status === 'PENDING') statusCounts.PENDING++;
      if (order.status === 'ON_WAY') statusCounts.ON_WAY++;
      if (order.status === 'DELIVERED') statusCounts.DELIVERED++;
      totalRevenue += Number(order.totalOrderValue || 0);
    });

    // Hardcoded percentage changes (in real app, compute from historical data)
    const percentageChanges = {
      ACCEPTED: '+12%',
      PENDING: '+5%',
      ON_WAY: '+18%',
      DELIVERED: '-2%',
    };

    setStats([
      { 
        name: "Accepted Orders", 
        value: statusCounts.ACCEPTED.toLocaleString(), 
        change: percentageChanges.ACCEPTED, 
        icon: Package, 
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-100 text-blue-800"
      },
      { 
        name: "Pending Orders", 
        value: statusCounts.PENDING.toLocaleString(), 
        change: percentageChanges.PENDING, 
        icon: Clock, 
        color: "from-yellow-500 to-yellow-600",
        bgColor: "bg-yellow-100 text-yellow-800"
      },
      { 
        name: "On Way Orders", 
        value: statusCounts.ON_WAY.toLocaleString(), 
        change: percentageChanges.ON_WAY, 
        icon: MapPin, 
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-100 text-purple-800"
      },
      { 
        name: "Delivered Orders", 
        value: statusCounts.DELIVERED.toLocaleString(), 
        change: percentageChanges.DELIVERED, 
        icon: CheckCircle, 
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-100 text-green-800"
      },
    ]);
  }, [orders]);

  // Get recent orders (last 3, sorted by date descending)
  const recentOrders = orders
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 3)
    .map(order => ({
      id: `#ORD-${order.orderId}`,
      status: order.status,
      date: new Date(order.orderDate).toLocaleDateString(),
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by hook
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Stats Grid - Responsive: 1 col mobile, 2 tablet, 4 desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const changeColor = stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600';
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs sm:text-sm ${changeColor} font-medium`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Quick Actions - Responsive: stacked on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Recent Orders
          </h2>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                // Map status to bgColor from stats or default
                const statusMap = {
                  ACCEPTED: "bg-purple-100 text-purple-800",
                  PENDING: "bg-yellow-100 text-yellow-800",
                  ON_WAY: "bg-blue-100 text-blue-800",
                  DELIVERED: "bg-green-100 text-green-800",
                  REJECTED: "bg-red-100 text-red-800",
                  RTO: "bg-orange-100 text-orange-800",
                };
                const bgColor = statusMap[order.status] || "bg-gray-100 text-gray-800";
                return (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate" title={order.id}>{order.id}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{order.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                      {order.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No recent orders
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "Add New Order", href: "/dashboard/add-new-order", icon: ShoppingCart },
              { label: "View My Orders", href: "/dashboard/my-orders", icon: Archive },
              { label: "Recharge Balance", href: "/dashboard/recharge-balance", icon: IndianRupee },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-gray-600 flex-shrink-0" />
                  <span className="font-medium text-gray-700">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}