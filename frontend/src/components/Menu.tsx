
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

const   MenuManagement = () => {
  const [ratePerMeal, setRatePerMeal] = useState('');
  const [menuType, setMenuType] = useState('Lunch Menu');
  const [menuDate, setMenuDate] = useState('');
  const [menuItems, setMenuItems] = useState('');
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
        menuType: menuType.toLowerCase().replace(' menu', ''),
        menuDate: menuDate,
        menuItems: itemsArray,
        ratePerMeal: parseInt(ratePerMeal, 10), // 👈 2. Add the rate to the request
    };

      // Make API call
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/menu/add`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        toast.error('Failed to create menu. Please try again.');
        return
      }

      toast.success(' Menu created successfully!');


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
  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-green-700">🍽️ Menu Management</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        <div>
            <label className="text-sm font-medium block mb-1">Rate Per Meal (₹)</label>
            <input
                type="number"
                value={ratePerMeal}
                onChange={(e) => setRatePerMeal(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="e.g., 80"
                required
            />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg w-full text-white ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {loading ? 'Uploading...' : 'Upload & Send to Customers'}
        </button>        
      </form>
    </div>
  );
};

export default MenuManagement;
