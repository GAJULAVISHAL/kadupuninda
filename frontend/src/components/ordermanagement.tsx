
 

import { useState, useEffect } from "react";
import { Truck, ChevronDown } from "lucide-react";
import axios from "axios";

interface Order {
  _id: string;
  phoneNumber: string;
  mealType: "lunch" | "dinner";
  address: string;
  status: "pending" | "preparing" | "in-transit" | "delivered";
  createdAt: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:4010/api/v1/order/today");
        console.log("API Response:", response.data);

        const ordersData = response.data.orders || [];

const formattedOrders = ordersData.map((order: any, index: number): Order => {
  console.log("Customer Info:", order.customer);
  return {
    _id: String(order.id || `order-${index}`),
    phoneNumber: (order.customer?.whatsappNumber || "").replace(/\D/g, '') || "Not provided",
    mealType: ["lunch", "dinner"].includes(order.mealSplit?.toLowerCase())
      ? order.mealSplit.toLowerCase() as "lunch" | "dinner"
      : "lunch",
    address: order.customer?.deliveryAddress || "Address not available",
    status: order.status || "pending",
    createdAt: order.createdAt || new Date().toISOString()
  };
});

        console.log("Formatted Orders:", formattedOrders);

        const sortedOrders = formattedOrders.sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Failed to fetch orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await axios.patch(`http://localhost:4010/api/v1/order/${orderId}`, {
        status: newStatus
      });

      setOrders(prevOrders => {
        const updated = prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus, createdAt: new Date().toISOString() }
            : order
        );
        return updated.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to update order status");
      }
    }
  };

  const shouldScroll = orders.length > 4;
  const containerClass = shouldScroll
    ? "space-y-4 w-full max-h-[420px] overflow-y-auto"
    : "space-y-4 w-full";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-xl p-6 flex flex-col w-full max-w-md mx-auto">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
        📦 Today's Orders - Delivery Management
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Manage order statuses: <em>Pending → Preparing → In Transit → Delivered</em>
      </p>

      {orders.length > 0 ? (
        <div className={containerClass}>
          {(shouldScroll ? orders : orders.slice(0, 4)).map((order) => (
            <div key={order._id} className="border rounded-lg p-4 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-700">{order.phoneNumber}</p>
                  <p className="text-sm capitalize">
                    Meal:{" "}
                    <span
                      className={`font-medium ${
                        order.mealType === "lunch" ? "text-amber-500" : "text-indigo-500"
                      }`}
                    >
                      {order.mealType}
                    </span>
                  </p>
                </div>
                <div className="relative">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value as Order["status"])}
                    className={`appearance-none ${getStatusColor(order.status)} pr-8 pl-3 py-1 rounded-full text-xs font-medium capitalize focus:outline-none focus:ring-1 focus:ring-gray-300`}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <p className="text-sm mt-2 text-gray-600">
                <span className="font-medium">Address:</span> {order.address}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Truck className="w-10 h-10 mb-2" />
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
}

function formatPhoneNumber(phoneNumber?: string): string {
  if (!phoneNumber) return "";
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phoneNumber;
}

function getStatusColor(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "preparing":
      return "bg-blue-100 text-blue-800";
    case "in-transit":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
