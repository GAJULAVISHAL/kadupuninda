// import Card from "../components/Admincard"
// import { NavbarAdmin } from "../components/NavbarAdmin"

// export const AdminPage = ()=>{
//     return(
//       <div className="flex flex-col min-h-screen p-4 bg-gray-100">
//            <NavbarAdmin />

//                <div className="max-w-3xl w-full mx-auto space-y-6">
//              <div className="text-left">
//           <h2 className="text-3xl font-bold text-gray-800">
//             Admin Dashboard 
//           </h2>
//           <p className="text-gray-600 mt-1">Manage orders,menus,and deliveries</p>
//         </div>
//         <div className="h-px bg-gray-300 w-full my-4" />
// <Card title="Today's Orders"  />
//            </div>
//            </div>
//     )
// }
import Card from "../components/Admincard";
import { NavbarAdmin } from "../components/NavbarAdmin";
import { Calendar, Users, DollarSign, Truck } from "lucide-react";
import Menu from "../components/Menu";
import AllOrders from "../components/allorders";

export const AdminPage = () => {
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
            value="0"
            icon={<Calendar size={20} />}
            subtitle="+12% vs yesterday"
            highlight=""
            highlightColor="green"
          />
          <Card
            title="Active Subscriptions"
            value="0"
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
      <div className="flex  items-start"> {/* Not items-stretch */}
  <Menu />
</div>
<AllOrders/>
      </div>
    </div>
  );
};
