

import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Admincard";
import { NavbarAdmin } from "../components/NavbarAdmin";
import { Calendar, Users, DollarSign, Truck } from "lucide-react";
import Menu from "../components/Menu";
import AllOrders from "../components/allorders";

export const AdminPage = () => {
  const [todayOrderCount, setTodayOrderCount] = useState<number>(0);
  const [customerCount, setCustomerCount] = useState<number>(0);

  useEffect(() => {
    const fetchTodayOrders = async () => {
      try {
        const res = await axios.get("http://localhost:4010/api/v1/order/today");
        const orders = res.data.orders || [];
        setTodayOrderCount(orders.length);
      } catch (err) {
        console.error("Error fetching today's orders:", err);
      }
    };

    const fetchCustomers = async () => {
      try {
    const res = await axios.get("http://localhost:4010/api/v1/customer/customersCount");
setCustomerCount(res.data.count || 0);

      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchTodayOrders();
    fetchCustomers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      <NavbarAdmin />

      <div className="max-w-5xl w-full mx-auto space-y-6">
        <div className="text-left">
          <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Manage orders, menus, and deliveries
          </p>
        </div>
        <div className="h-px bg-gray-300 w-full my-4" />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="Today's Orders"
            value={todayOrderCount.toString()}
            icon={<Calendar size={20} />}
            subtitle="+12% vs yesterday"
            highlight=""
            highlightColor="green"
          />
          <Card
            title="Active Customers"
            value={customerCount.toString()}
            icon={<Users size={20} />}
            subtitle="98% customer satisfaction"
            highlight=""
            highlightColor="green"
          />
          <Card
            title="Revenue Today"
            value="₹0"
            icon={<DollarSign size={20} />}
            subtitle="+8% vs yesterday"
            highlight=""
            highlightColor="green"
          />
          <Card
            title="Pending Deliveries"
            value="0"
            icon={<Truck size={20} />}
            subtitle="Expected in 45 min"
            highlight=""
            highlightColor="orange"
          />
        </div>

        <div className="flex items-start">
          <Menu />
        </div>

        <AllOrders />
      </div>
    </div>
  );
};
