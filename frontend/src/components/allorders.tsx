
import  { useState, useEffect } from 'react';
import { Download, Truck, Smartphone } from 'lucide-react';

type Order = {
  id: string;
  customer: string;
  status: 'Pending' | 'Preparing' | 'In Transit' | 'Delivered';
};

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setOrders([]); 
    }, 500);
  }, []);

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    alert('CSV Export not implemented yet!');
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 w-full h-max border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked readOnly className="accent-green-600" />
          <h2 className="text-lg font-semibold text-gray-700">All Orders</h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-gray-100 text-sm px-3 py-1 rounded-full text-gray-700">
            {orders.length} total orders
          </span>
          <button
            onClick={handleExportCSV}
            className="border border-gray-300 px-3 py-1 text-sm rounded-md hover:bg-gray-50 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="p-4 border rounded-lg shadow-sm flex justify-between">
              <div>
                <p className="font-medium">{order.customer}</p>
                <p className="text-sm text-gray-500">{order.status}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                #{order.id}
              </span>
            </li>
          ))}
        </ul>
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