import { useState, useEffect } from "react";
import { Truck, ChevronDown, Loader2 } from "lucide-react"; // 👈 Import Loader2 for the spinner
import axios from "axios";
import toast from "react-hot-toast";

// This should be the Delivery interface from your other component
interface Delivery {
  id: string; // This should be the delivery ID
  phoneNumber: string;
  mealType: "lunch" | "dinner";
  address: string;
  status: "scheduled" | "delivered" | "cancelled";
  createdAt: string;
}

export default function DeliveryManagement({setPendingDeliveries}:{
      setPendingDeliveries: React.Dispatch<React.SetStateAction<number>>;
    }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null); // 👈 State for loading indicator

  // Custom sort function to prioritize 'scheduled' status
  const sortDeliveries = (deliveries: Delivery[]) => {
    const statusOrder = {
      scheduled: 0,
      delivered: 1,
      cancelled: 2,
    };

    return deliveries.sort((a, b) => {
      // Primary sort by status
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // Secondary sort by newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/today`);
        const deliveryData = response.data.deliveries || [];

        const formattedDeliveries = deliveryData.map((d: any): Delivery => ({
          id: String(d.id),
          phoneNumber: d.order.customer?.whatsappNumber || "Not provided",
          mealType: d.mealType?.toLowerCase(),
          address: d.order.customer?.deliveryAddress || "Not available",
          status: d.deliveryStatus?.toLowerCase(),
          createdAt: d.createdAt,
        }));

        // Use the new sorting function
        setDeliveries(sortDeliveries(formattedDeliveries));
      } catch (err) {
        setError("Failed to fetch today's deliveries");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const updateDeliveryStatus = async (deliveryId: string, newStatus: Delivery["status"]) => {
    setUpdatingId(deliveryId); // 👈 Set loading state for this specific delivery
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/${deliveryId}/status`, {
        status: newStatus,
      }).then(()=>{
        setPendingDeliveries(prev => newStatus === 'scheduled' ? prev + 1 : prev - 1);
        toast.success("Delivery status updated successfully!");
      }); // Update pending deliveries count

      setDeliveries(prevDeliveries => {
        const updated = prevDeliveries.map(d =>
          d.id === deliveryId ? { ...d, status: newStatus } : d
        );
        // Re-sort the list after updating
        return sortDeliveries(updated);
      });
    } catch (err) {
      alert("Failed to update delivery status.");
    } finally {
      setUpdatingId(null); // 👈 Clear loading state
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
    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col w-full max-w-lg mx-auto">
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

                {/* 👇 Conditional rendering for loading spinner */}
                <div className="relative w-28 text-center">
                  {updatingId === delivery.id ? (
                    <div className="flex items-center justify-center h-full py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <>
                      <select
                        value={delivery.status}
                        onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value as Delivery["status"])}
                        className={`appearance-none w-full ${getStatusColor(delivery.status)} pr-8 pl-3 py-1 rounded-full text-xs font-semibold capitalize focus:outline-none focus:ring-1 focus:ring-gray-400`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                    </>
                  )}
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
    case "delivered": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}