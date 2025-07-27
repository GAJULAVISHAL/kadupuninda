

import { useState, useEffect } from 'react';
import {  Truck, Smartphone, MapPin, Clock } from 'lucide-react';
import axios from 'axios';

interface Order {
  _id: string;
  phoneNumber: string;
  mealType: 'lunch' | 'dinner';
  address: string;
  status: 'pending' | 'preparing' | 'in-transit' | 'delivered';
  createdAt: string;
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return {
    date: `${day}-${month}-${year}`,
    time: `${hour12}:${minutes} ${ampm}`,
  };
}

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/order/allOrders`);
        const ordersData = response.data.orders || [];

        const formattedOrders = ordersData.map((order: any, index: number): Order => ({
          _id: String(order.id || `order-${index}`),
          phoneNumber: (order.customer?.whatsappNumber || "").replace(/\D/g, '') || "Not provided",
          mealType: ["lunch", "dinner"].includes(order.mealSplit?.toLowerCase())
            ? order.mealSplit.toLowerCase()
            : "lunch",
          address: order.customer?.deliveryAddress || "Address not available",
          status: order.status || "pending",
          createdAt: order.createdAt || new Date().toISOString(),
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);


  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-700">📦 All Orders</h2>
        <div className="flex items-center space-x-2">
          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
            {orders.length} orders
          </span>
          
        </div>
      </div>

      {/* Orders List with Scroll */}
      {orders.length > 0 ? (
        <div className="max-h-[500px] overflow-y-auto pr-1">
          <ul className="space-y-4">
            {orders.map((order) => {
              const { date, time } = formatDateTime(order.createdAt);

              return (
                <li
                  key={order._id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-lg text-gray-900">
                      {order.phoneNumber}
                    </p>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {order.mealType}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 flex items-start space-x-2 mt-1">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                    <span>{order.address}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{time}</span>
                    </span>
                    <span>{date}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Truck className="w-10 h-10 mb-2" />
          <p>No orders found</p>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => alert('Add Order modal')}
        className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center"
      >
        <Smartphone className="w-5 h-5" />
      </button>
    </div>
  );
}
