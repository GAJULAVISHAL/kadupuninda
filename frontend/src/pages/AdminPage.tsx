import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Admincard";
import { NavbarAdmin } from "../components/NavbarAdmin";
import { Calendar, Users, Truck, IndianRupee } from "lucide-react";
import AllOrders from "../components/allorders";
import DeliveryManagement from "../components/ordermanagement"; // Make sure this is imported
import MenuManagement from "../components/Menu";

export const AdminPage = () => {
  const [todayOrderCount, setTodayOrderCount] = useState<number>(0);
  const [customerCount, setCustomerCount] = useState<number>(0);
  // 👇 1. Add new state variables for revenue and pending deliveries
  const [todaysRevenue, setTodaysRevenue] = useState<number>(0);
  const [pendingDeliveries, setPendingDeliveries] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- Fetch Customers (no change) ---
        const customerRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/customer/customersCount`);
        setCustomerCount(customerRes.data.count || 0);

        // --- Fetch Today's Orders to Calculate Revenue ---
        const ordersRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/order/today`);
        const orders = ordersRes.data.orders || [];
        setTodayOrderCount(orders.length);

        // Calculate total revenue from today's orders
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
        setTodaysRevenue(totalRevenue);

        // --- Fetch Today's Deliveries to Count Pending ---
        const deliveryRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/today`);
        const deliveries = deliveryRes.data.deliveries || [];
        
        // Count deliveries that are not 'delivered' or 'cancelled'
        const pendingCount = deliveries.filter(
          (d: any) => d.deliveryStatus !== 'delivered' && d.deliveryStatus !== 'cancelled'
        ).length;
        setPendingDeliveries(pendingCount);

      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
            <NavbarAdmin />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
                        <p className="text-gray-600 mt-1">
                            Manage orders, menus, and deliveries in real-time.
                        </p>
                    </div>

                    {/* Cards Grid - This will wrap automatically on smaller screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card title="Today's Orders" value={todayOrderCount} icon={<Calendar size={20} />} />
                        <Card title="Active Customers" value={customerCount} icon={<Users size={20} />} />
                        <Card title="Revenue Today" value={todaysRevenue} icon={<IndianRupee size={20} />} />
                        <Card title="Pending Deliveries" value={pendingDeliveries} icon={<Truck size={20} />} highlightColor="orange" />
                    </div>

                    {/* Main Content Area using Flexbox for responsiveness */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left Column */}
                        <div className="w-full lg:w-1/3 flex-shrink-0 space-y-8">
                            <MenuManagement />
                        </div>
                        {/* Right Column */}
                        <div className="w-full lg:w-2/3 space-y-8">
                            <DeliveryManagement />
                        </div>
                    </div>
                    
                    {/* All Orders Table at the bottom */}
                    <div>
                        <AllOrders />
                    </div>

                </div>
            </main>
        </div>
  );
};