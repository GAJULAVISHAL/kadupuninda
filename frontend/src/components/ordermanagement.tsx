import { useState, useEffect } from "react";
import { Truck, ChevronDown } from "lucide-react";
import axios from "axios";

// Interface now represents a Delivery, not an Order
interface Delivery {
  id: number;
  phoneNumber: string;
  mealType: "lunch" | "dinner";
  address: string;
  status: "scheduled" | "preparing" | "in_transit" | "delivered" | "cancelled";
  createdAt: string;
}

export default function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // Calling the new /api/v1/delivery/today endpoint
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/today`);
        const deliveryData = response.data.deliveries || [];

        // Correctly mapping the delivery data from the new API structure
        const formattedDeliveries = deliveryData.map((delivery: any): Delivery => ({
          id: delivery.id,
          phoneNumber: delivery.order.customer?.whatsappNumber || "Not provided",
          mealType: delivery.mealType?.toLowerCase(),
          address: delivery.order.customer?.deliveryAddress || "Not available",
          status: delivery.deliveryStatus?.toLowerCase(),
          createdAt: delivery.createdAt,
        }));

        setDeliveries(formattedDeliveries);
      } catch (err) {
        setError("Failed to fetch today's deliveries");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const updateDeliveryStatus = async (deliveryId: number, newStatus: Delivery["status"]) => {
    try {
      // Calling the new PATCH endpoint to update the status
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/${deliveryId}/status`, {
        status: newStatus
      });

      // Updating the state locally for an instant UI update
      setDeliveries(prev =>
        prev.map(d => (d.id === deliveryId ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      alert("Failed to update delivery status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
        📦 Today's Deliveries
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Manage the status of confirmed deliveries for today.
      </p>

      {deliveries.length > 0 ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="border rounded-lg p-4 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{delivery.phoneNumber}</p>
                  <p className="text-sm capitalize">
                    Meal:{" "}
                    <span className={`font-medium ${delivery.mealType === "lunch" ? "text-amber-600" : "text-indigo-600"}`}>
                      {delivery.mealType}
                    </span>
                  </p>
                </div>
                <div className="relative">
                  <select
                    value={delivery.status}
                    onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value as Delivery["status"])}
                    className={`appearance-none ${getStatusColor(delivery.status)} pr-8 pl-3 py-1 rounded-full text-xs font-semibold capitalize focus:outline-none focus:ring-1 focus:ring-gray-400`}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="preparing">Preparing</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                </div>
              </div>
              <p className="text-sm mt-2 text-gray-700">
                <span className="font-medium">Address:</span> {delivery.address}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Truck className="w-10 h-10 mb-2" />
          <p>No confirmed deliveries for today yet.</p>
        </div>
      )}
    </div>
  );
}

// Helper function to get status colors
function getStatusColor(status: Delivery["status"]) {
  switch (status) {
    case "scheduled": return "bg-blue-100 text-blue-800";
    case "preparing": return "bg-orange-100 text-orange-800";
    case "in_transit": return "bg-purple-100 text-purple-800";
    case "delivered": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}