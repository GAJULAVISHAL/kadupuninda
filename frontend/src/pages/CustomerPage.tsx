import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Navbar } from "../components/Navbar";
import { Sun, Moon, Utensils, Calendar, Lightbulb, Clock, Phone, MapPin, FileText, CreditCard } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CustomerPage = () => {
  const [selectedMeal, setSelectedMeal] = useState('both');
  const [mealCount, setMealCount] = useState(10);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lunchMenu, setLunchMenu] = useState<string[]>([]);
  const [dinnerMenu, setDinnerMenu] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableMenus, setAvailableMenus] = useState({
    lunch: false,
    dinner: false
  });

  const ratePerMeal = 80;
  const totalAmount = mealCount * ratePerMeal;

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      setError(null);
      const menuStatus = { lunch: false, dinner: false };

      // Fetch lunch menu
      try {
        const lunchRes = await axios.get('http://localhost:4010/api/v1/menu/today?menuType=lunch');
        if (lunchRes.data?.data?.menuItems && lunchRes.data.data.menuItems.length > 0) {
          setLunchMenu(lunchRes.data.data.menuItems);
          menuStatus.lunch = true;
        }
      } catch (lunchError) {
        console.log('Lunch menu not available:', lunchError);
      }

      // Fetch dinner menu
      try {
        const dinnerRes = await axios.get('http://localhost:4010/api/v1/menu/today?menuType=dinner');
        if (dinnerRes.data?.data?.menuItems && dinnerRes.data.data.menuItems.length > 0) {
          setDinnerMenu(dinnerRes.data.data.menuItems);
          menuStatus.dinner = true;
        }
      } catch (dinnerError) {
        console.log('Dinner menu not available:', dinnerError);
      }

      setAvailableMenus(menuStatus);

      // Set error if no menus are available
      if (!menuStatus.lunch && !menuStatus.dinner) {
        setError('No menus available for today');
      }

      // Auto-select available meal type
      if (menuStatus.lunch && menuStatus.dinner) {
        setSelectedMeal('both');
      } else if (menuStatus.lunch) {
        setSelectedMeal('lunch');
      } else if (menuStatus.dinner) {
        setSelectedMeal('dinner');
      }

      setLoading(false);
    };

    fetchMenuData();
  }, []);

  const renderMenuItems = () => {
    if (loading) return ['Loading menu...'];
    if (!availableMenus.lunch && !availableMenus.dinner) return ['No menu available for today'];
    
    switch (selectedMeal) {
      case 'lunch':
        return availableMenus.lunch ? lunchMenu : ['Lunch menu not available today'];
      case 'dinner':
        return availableMenus.dinner ? dinnerMenu : ['Dinner menu not available today'];
      case 'both':
        const combinedMenu = [];
        if (availableMenus.lunch) combinedMenu.push(...lunchMenu);
        if (availableMenus.dinner) combinedMenu.push(...dinnerMenu);
        return [...new Set(combinedMenu)];
      default:
        return [];
    }
  };

  const calculateMealType = () =>
    selectedMeal === 'both' ? 'Lunch + Dinner' : selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1);

  const handleMealChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setMealCount(Number(value));
    }
  };

  // Check if selected meal type is available
  const isMealTypeAvailable = (mealType: string) => {
    switch (mealType) {
      case 'lunch':
        return availableMenus.lunch;
      case 'dinner':
        return availableMenus.dinner;
      case 'both':
        return availableMenus.lunch || availableMenus.dinner;
      default:
        return false;
    }
  };

  const handleMealTypeSelection = (mealType: string) => {
    if (isMealTypeAvailable(mealType)) {
      setSelectedMeal(mealType);
    } else {
      toast.error(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} menu is not available today`);
    }
  };

  const handleSubmit = async () => {
    // Check if selected meal type is available
    if (!isMealTypeAvailable(selectedMeal)) {
      toast.error(`Selected meal type is not available today. Please choose another option.`);
      return;
    }

    // Input validation
    if (!phone.trim()) {
      toast.error('Please enter your WhatsApp number');
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    if (mealCount <= 0) {
      toast.error('Please enter a valid number of meals');
      return;
    }

    try {
      // Step 1: Create Customer
      console.log('Creating customer with:', { whatsappNumber: phone, deliveryAddress: address });

      const customerRes = await axios.post('http://localhost:4010/api/v1/customer/create', {
        whatsappNumber: phone,
        deliveryAddress: address
      });

      const customerData = customerRes.data;
      console.log('Customer creation response:', customerData);

      if (!customerData.success) {
        toast.error('Failed to create customer account. Please try again.');
        return;
      }

      const customerId =
        customerData.customerId ||
        customerData.data?.id ||
        customerData.data?.customerId ||
        customerData.id;

      if (!customerId) {
        console.error('Customer ID not found in response:', customerData);
        toast.error('Customer account created but ID not received. Please contact support.');
        return;
      }

      console.log('Customer created successfully with ID:', customerId);

      // Step 2: Create Order
      const orderPayload = {
        customerId,
        mealQuantity: mealCount,
        mealSplit: selectedMeal,
        totalAmount,
        paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('Creating order with:', orderPayload);

      const orderRes = await axios.post('http://localhost:4010/api/v1/order/createOrder', orderPayload);
      const orderData = orderRes.data;
      console.log('Order creation response:', orderData);

      if (!orderData.success) {
        toast.error('Customer created but order placement failed. Please try again.');
        return;
      }

      toast.success('✅ Payment successful and order placed!');

      // Reset form fields
      setMealCount(10);
      setSelectedMeal(availableMenus.lunch && availableMenus.dinner ? 'both' : 
                     availableMenus.lunch ? 'lunch' : 'dinner');
      setPhone('');
      setAddress('');

      console.log('Order placed successfully!');
    } catch (err: any) {
      console.error('Error during submission:', err);

      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Network error. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Don't show the form if no menus are available
  if (!loading && !availableMenus.lunch && !availableMenus.dinner) {
    return (
      <div className="flex flex-col min-h-screen p-4 bg-gray-100">
        <Toaster position="top-right" />
        <Navbar />
        
        <div className="max-w-3xl w-full mx-auto space-y-6 flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Menus Available Today</h2>
            <p className="text-gray-600 mb-4">We're sorry, but there are no meals available for today.</p>
            <p className="text-gray-500 text-sm">Please check back tomorrow or contact us for more information.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      <Toaster position="top-right" />
      <Navbar />

      <div className="max-w-3xl w-full mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Traditional South Indian <span className="text-green-600">Meals</span>
          </h2>
          <p className="text-gray-600 mt-1">Home-cooked meals delivered across Hyderabad</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Utensils size={20} /> Book Your Meal Subscription
            </div>
            <p className="text-sm mt-1">Fresh, daily meals in just a few steps</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Meal Count */}
            <div>
              <label className="flex items-center font-medium text-gray-800 mb-1">
                <Calendar size={18} className="mr-2 text-green-600" /> Total Number of Meals
              </label>
              <input
                type="text"
                value={mealCount}
                onChange={handleMealChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-green-500"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <Lightbulb size={16} className="mr-1 text-yellow-400" /> Must be even for proper distribution
              </p>
            </div>

            {/* Meal Schedule */}
            <div>
              <label className="flex items-center font-medium text-gray-800 mb-2">
                <Clock size={18} className="mr-2 text-green-600" /> Choose Your Meal Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { type: 'lunch', icon: <Sun className="mx-auto text-yellow-500 mb-2" size={28} />, label: 'Lunch Only', time: '12–2 PM' },
                  { type: 'dinner', icon: <Moon className="mx-auto text-indigo-500 mb-2" size={28} />, label: 'Dinner Only', time: '7–9 PM' },
                  { type: 'both', icon: <Utensils className="mx-auto text-green-600 mb-2" size={28} />, label: 'Both', time: 'Lunch + Dinner' },
                ].map(({ type, icon, label, time }) => {
                  const isAvailable = isMealTypeAvailable(type);
                  const isSelected = selectedMeal === type;
                  
                  return (
                    <div
                      key={type}
                      className={`border rounded-lg p-4 text-center cursor-pointer transition relative ${
                        isSelected && isAvailable
                          ? 'border-green-600 bg-green-50'
                          : isAvailable
                          ? 'hover:border-green-400'
                          : 'opacity-50 cursor-not-allowed bg-gray-50'
                      }`}
                      onClick={() => handleMealTypeSelection(type)}
                    >
                      {!isAvailable && (
                        <div className="absolute top-2 right-2 text-red-500 text-xs font-semibold">
                          N/A
                        </div>
                      )}
                      {icon}
                      <h4 className={`font-semibold ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                        {label}
                      </h4>
                      <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                        {time}
                      </p>
                      {isAvailable && isSelected && (
                        <div className="absolute top-2 left-2 text-green-600">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Menu availability status */}
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>
                  Lunch: {availableMenus.lunch ? '✅ Available' : '❌ Not Available'}
                </span>
                <span>
                  Dinner: {availableMenus.dinner ? '✅ Available' : '❌ Not Available'}
                </span>
              </div>
            </div>

            {/* Menu Display */}
            <div className="bg-gray-50 p-4 rounded border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-semibold text-gray-700 capitalize">
                  {selectedMeal} Menu
                  {isMealTypeAvailable(selectedMeal) && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Available
                    </span>
                  )}
                </h4>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                )}
              </div>

              {error && !loading && (
                <div className="text-sm text-red-600 mb-2 p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}

              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {renderMenuItems().map((item, idx) => (
                  <li key={idx} className={loading ? 'animate-pulse' : 'hover:text-gray-800 transition-colors'}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <label className="flex items-center font-medium text-gray-800 mb-1">
                <Phone size={18} className="mr-2 text-green-600" /> WhatsApp Number
              </label>
              <div className="flex">
                <span className="px-3 flex justify-center items-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600">+91</span>
                <input
                  type="tel"
                  placeholder="98xxxxxxxx"
                  className="w-full border border-gray-300 rounded-r-md px-3 py-2 focus:ring-2 focus:ring-green-500"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value) }}
                  maxLength={10}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">You'll receive order confirmations via WhatsApp</p>
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center font-medium text-gray-800 mb-1">
                <MapPin size={18} className="mr-2 text-green-600" /> Delivery Address
              </label>
              <textarea
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="Flat, Street, Landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded p-4 border">
              <h3 className="flex items-center font-medium text-gray-800 mb-2">
                <FileText size={18} className="mr-2 text-green-600" /> Order Summary
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Meals:</strong> {mealCount}</li>
                <li><strong>Type:</strong> {calculateMealType()}</li>
                <li><strong>Rate:</strong> ₹{ratePerMeal}</li>
              </ul>
              <div className="pt-2 font-semibold text-green-700 text-lg">
                Total: ₹{totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleSubmit}
              disabled={!isMealTypeAvailable(selectedMeal)}
              className={`w-full py-3 px-6 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                isMealTypeAvailable(selectedMeal)
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              <CreditCard size={20} /> 
              {isMealTypeAvailable(selectedMeal) ? 'Pay Securely with Razorpay' : 'Selected Meal Not Available'}
            </button>

            <div className="flex justify-center gap-4 text-sm text-gray-500 mt-2">
              <span>💳 Cards</span>
              <span>📱 UPI</span>
              <span>👛 Wallets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};