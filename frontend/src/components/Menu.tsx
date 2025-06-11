
import axios from 'axios';
import { useState } from 'react';
import OrderManagement from './ordermanagement';

const MenuManagement = () => {
  const [menuType, setMenuType] = useState('Lunch Menu');
  const [menuDate, setMenuDate] = useState('');
  const [menuItems, setMenuItems] = useState('');
  const [totalCustomers, setTotalCustomers] = useState('');
  const [confirmations, setConfirmations] = useState(0);
  const [menuSent, setMenuSent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const itemsArray = menuItems
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item !== '');

      // Prepare API request body
      const requestBody = {
        menuType: menuType.toLowerCase().replace(' menu', ''), // Convert "Lunch Menu" to "lunch"
        menuDate: menuDate,
        menuItems: itemsArray
      };

      // Make API call
      const response = await axios.post('http://localhost:4010/api/v1/menu/add', requestBody,{
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Sending request body:", requestBody);


      console.log('Menu created successfully:', response.data);

      // Simulate WhatsApp sending logic (as in original code)
      const total = parseInt(totalCustomers);
      const randomConfirmations = Math.floor(Math.random() * (total - 20) + 20);

      setMenuSent(total);
      setConfirmations(randomConfirmations);
      setSubmitted(true);

    } catch (err) {
      console.error('Error creating menu:', err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create menu. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const responseRate = menuSent > 0 ? Math.round((confirmations / menuSent) * 100) : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Menu Management */}
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-green-700">🍽️ Menu Management</h2>

          <div className="flex gap-4 mb-6">
            <div className="border rounded-lg p-3 bg-red-50">
              <p className="font-semibold text-red-700">Lunch Menu</p>
              <p className="text-xs text-red-600">Due: 11:00 AM</p>
              <p className="text-xs text-red-500">⚠️ Deadline passed</p>
            </div>
            <div className="border rounded-lg p-3 bg-red-50">
              <p className="font-semibold text-red-700">Dinner Menu</p>
              <p className="text-xs text-red-600">Due: 4:00 PM</p>
              <p className="text-xs text-red-500">⚠️ Deadline passed</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Menu Type</label>
              <select
                value={menuType}
                onChange={(e) => setMenuType(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                disabled={loading}
              >
                <option>Lunch Menu</option>
                <option>Dinner Menu</option>
                <option>Both Menu</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Menu Date</label>
              <input
                type="date"
                value={menuDate}
                onChange={(e) => setMenuDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Menu Items</label>
              <textarea
                rows={6}
                value={menuItems}
                onChange={(e) => setMenuItems(e.target.value)}
                placeholder="Enter one item per line"
                className="w-full border rounded-md px-3 py-2"
                disabled={loading}
                required
              ></textarea>
              <p className="text-xs mt-1 text-gray-400">Enter each menu item on a new line</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg w-full text-white ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Uploading...' : 'Upload & Send to Customers'}
            </button>

            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-green-800 mb-2">📲 WhatsApp Status</h3>

                <div className="flex justify-between text-sm text-gray-800">
                  <span>Menus sent:</span>
                  <strong>{menuSent}/{totalCustomers}</strong>
                </div>

                <div className="flex justify-between text-sm text-gray-800">
                  <span>Confirmations received:</span>
                  <strong>{confirmations}/{totalCustomers}</strong>
                </div>

                <div className="flex justify-between text-sm text-gray-800">
                  <span>Response rate:</span>
                  <strong>{responseRate}%</strong>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="flex-1">
          {/* OrderManagement component would go here */}
          <OrderManagement />
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
