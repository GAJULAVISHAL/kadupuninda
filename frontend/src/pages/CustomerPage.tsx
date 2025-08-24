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
  const [ratePerMeal, setRatePerMeal] = useState(1)
  // const ratePerMeal = 1;
  const totalAmount = mealCount * ratePerMeal;


  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [flatDetails, setFlatDetails] = useState('');
  const [areaDetails, setAreaDetails] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Combined address for API
  const getCombinedAddress = () => {
    const addressParts = [
      fullName && `Name: ${fullName}`,
      mobileNumber && `Mobile: ${mobileNumber}`,
      flatDetails,
      areaDetails,
      landmark && `Near ${landmark}`,
      city,
      state,
      pincode && `PIN: ${pincode}`,
    ].filter(Boolean);

    return addressParts.join(', ');
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      setError(null);
      const menuStatus = { lunch: false, dinner: false };

      // Fetch lunch menu
      try {
        const lunchRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/menu/today?menuType=lunch`);
        if (lunchRes.data?.data?.menuItems && lunchRes.data.data.menuItems.length > 0) {
          setLunchMenu(lunchRes.data.data.menuItems);
          setRatePerMeal(lunchRes.data.data.ratePerMeal);
          menuStatus.lunch = true;
        }
      } catch (lunchError) {
        console.log('Lunch menu not available:', lunchError);
      }

      // Fetch dinner menu
      try {
        const dinnerRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/menu/today?menuType=dinner`);
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

  const handlePayment = async () => {
    console.log("1. handlePayment function started.");

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    console.log("2. Razorpay Key ID:", razorpayKey);

    if (!razorpayKey) {
      toast.error("Razorpay Key ID is not configured. Please check your .env file.");
      console.error("Error: VITE_RAZORPAY_KEY_ID is missing.");
      return;
    }

    // --- Validation ---
    if (!phone.trim() || phone.length !== 10 || !/^\d+$/.test(phone)) {
      return toast.error('Please enter a valid 10-digit WhatsApp number');
    }
    console.log("3. Form validation passed.");

    const fullPhoneNumber = `91${phone}`;

    try {
      // --- Customer Creation ---
      console.log("4. Sending request to create customer...");
      const customerRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/customer/create`, {
        whatsappNumber: fullPhoneNumber,
        deliveryAddress: address,
      });
      const customerId = customerRes.data.data.id;
      console.log("5. Customer created with ID:", customerId);

      // --- Razorpay Order Creation ---
      console.log("6. Sending request to create Razorpay order...");
      const orderRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/payment/create-order`, {
        amount: totalAmount,
      });
      const { order } = orderRes.data;
      console.log("7. Razorpay order created:", order.id);


      // --- Step 4: Configure and open the Razorpay payment modal ---
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Get your key from .env.local
        amount: order.amount,
        currency: order.currency,
        name: "Kadupuninda Meals",
        description: "Meal Subscription Payment",
        order_id: order.id,
        // This handler function is called upon successful payment
        handler: async function (response: any) {
          // --- Step 5: Send payment details to your backend for verification ---
          const verificationRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/payment/verify`, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            // Pass all the other order details needed for creation
            customerId,
            mealQuantity: mealCount,
            mealSplit: selectedMeal,
            totalAmount,
            whatsappNumber: fullPhoneNumber,
          });

          if (verificationRes.data.success) {
            toast.success(verificationRes.data.message);
            // Reset form on success
            setPhone('');
            setAddress('');
            setMealCount(10);
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "Customer Name", // Optional
          contact: phone
        },
        theme: {
          color: "#4CAF50" // A nice green theme
        }
      };

      console.log("8. Opening Razorpay payment modal...");
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("9. An error occurred in the payment process:", err);
      toast.error('An error occurred. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <Utensils className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Traditional South Indian Meals
              </h1>
              <p className="text-gray-600 text-lg">Home-cooked meals delivered across Hyderabad</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Utensils size={18} />
                </div>
                <h2 className="text-2xl font-bold">Book Your Meal Subscription</h2>
              </div>
              <p className="text-green-100">Fresh, daily meals in just a few steps</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Meal Count */}
            <div className="group">
              <label className="flex items-center font-semibold text-gray-800 mb-3 text-lg">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar size={16} className="text-green-600" />
                </div>
                Total Number of Meals
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={mealCount}
                  onChange={handleMealChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg font-medium focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 hover:border-green-300"
                  placeholder="Enter number of meals"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-2xl">🍽️</span>
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                <Lightbulb size={16} className="mr-2 text-amber-500" />
                Must be even for proper distribution (lunch + dinner)
              </div>
            </div>

            {/* Meal Schedule */}
            <div>
              <label className="flex items-center font-semibold text-gray-800 mb-4 text-lg">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock size={16} className="text-green-600" />
                </div>
                Choose Your Meal Schedule
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  {
                    type: 'lunch',
                    icon: <Sun size={32} />,
                    label: 'Lunch Only',
                    time: '12–2 PM',
                    gradient: 'from-yellow-400 to-orange-500',
                    bgGradient: 'from-yellow-50 to-orange-50'
                  },
                  {
                    type: 'dinner',
                    icon: <Moon size={32} />,
                    label: 'Dinner Only',
                    time: '7–9 PM',
                    gradient: 'from-indigo-400 to-purple-500',
                    bgGradient: 'from-indigo-50 to-purple-50'
                  },
                  {
                    type: 'both',
                    icon: <Utensils size={32} />,
                    label: 'Both Meals',
                    time: 'Lunch + Dinner',
                    gradient: 'from-green-400 to-emerald-500',
                    bgGradient: 'from-green-50 to-emerald-50'
                  },
                ].map(({ type, icon, label, time, gradient, bgGradient }) => {
                  const isAvailable = isMealTypeAvailable(type);
                  const isSelected = selectedMeal === type;

                  return (
                    <div
                      key={type}
                      className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${isSelected && isAvailable
                        ? `border-green-400 bg-gradient-to-br ${bgGradient} shadow-lg`
                        : isAvailable
                          ? 'border-gray-200 hover:border-green-300 bg-white hover:shadow-md'
                          : 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                        }`}
                      onClick={() => handleMealTypeSelection(type)}
                    >
                      {!isAvailable && (
                        <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                          N/A
                        </div>
                      )}

                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                          {icon}
                        </div>
                        <h4 className={`font-bold text-lg mb-2 ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                          {label}
                        </h4>
                        <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                          {time}
                        </p>
                      </div>

                      {isAvailable && isSelected && (
                        <div className="absolute top-3 left-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Menu availability status */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Availability:</span>
                </div>
                <div className="flex gap-6 text-sm">
                  <span className={`flex items-center gap-1 ${availableMenus.lunch ? 'text-green-600' : 'text-red-500'}`}>
                    {availableMenus.lunch ? '✅' : '❌'} Lunch
                  </span>
                  <span className={`flex items-center gap-1 ${availableMenus.dinner ? 'text-green-600' : 'text-red-500'}`}>
                    {availableMenus.dinner ? '✅' : '❌'} Dinner
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Display */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  {selectedMeal} Menu
                  {isMealTypeAvailable(selectedMeal) && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      Available
                    </span>
                  )}
                </h4>
                {loading && (
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>

              {error && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                {renderMenuItems().map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 transition-all duration-300 ${loading ? 'animate-pulse' : 'hover:shadow-md hover:border-green-200'
                      }`}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center font-semibold text-gray-800 mb-3 text-lg">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Phone size={16} className="text-green-600" />
                  </div>
                  WhatsApp Number
                </label>
                <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100 transition-all duration-300">
                  <span className="bg-gray-100 px-4 py-4 text-gray-600 font-medium border-r border-gray-200">+91</span>
                  <input
                    type="tel"
                    placeholder="98xxxxxxxx"
                    className="flex-1 px-4 py-4 focus:outline-none text-lg"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <span>📱</span> Order confirmations via WhatsApp
                </p>

                <div>
                  <div>
                    <label className="flex items-center font-semibold text-gray-800 mb-4 text-lg">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <MapPin size={16} className="text-green-600" />
                      </div>
                      Delivery Address
                    </label>

                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100 transition-all duration-300">

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full name (First and Last name)
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile number
                        </label>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Enter mobile number"
                          maxLength={10}
                        />
                        <p className="text-xs text-gray-500 mt-1">May be used to assist delivery</p>
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="6 digits [0-9] PIN code"
                          maxLength={6}
                        />
                      </div>

                      {/* Flat Details */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flat, House no., Building, Company, Apartment
                        </label>
                        <input
                          type="text"
                          value={flatDetails}
                          onChange={(e) => setFlatDetails(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Enter flat/house details"
                        />
                      </div>

                      {/* Area Details */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area, Street, Sector, Village
                        </label>
                        <input
                          type="text"
                          value={areaDetails}
                          onChange={(e) => setAreaDetails(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="Enter area details"
                        />
                      </div>

                      {/* Landmark */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                          placeholder="E.g. near apollo hospital"
                        />
                      </div>

                      {/* City and State */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Town/City
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            placeholder="Enter city"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300"
                            placeholder="Enter city"
                          />
                        </div>
                      </div>


                      {/* Add Address Button */}
                      <button
                        type="button"
                        onClick={() => {
                          // This would typically save the address
                          console.log('Combined Address:', getCombinedAddress());
                          setAddress(getCombinedAddress());
                          alert('Address saved! Check console for combined address string.');
                        }}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Add address
                      </button>
                    </div>
                  </div>
                </div>
              </div>


              {/* Order Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                <h3 className="flex items-center font-bold text-gray-800 mb-4 text-xl">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText size={16} className="text-green-600" />
                  </div>
                  Order Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meals:</span>
                      <span className="font-semibold">{mealCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">{calculateMealType()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-semibold">₹{ratePerMeal}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-green-700">
                      <span>Total:</span>
                      <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={!isMealTypeAvailable(selectedMeal)}
                className={`w-full py-4 px-6 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 ${isMealTypeAvailable(selectedMeal)
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <CreditCard size={24} />
                {isMealTypeAvailable(selectedMeal) ? 'Pay Securely with Razorpay' : 'Selected Meal Not Available'}
              </button>

              <div className="flex justify-center gap-8 text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  <span className="font-medium">Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <span className="font-medium">UPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👛</span>
                  <span className="font-medium">Wallets</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
      `}</style>
      </div>
    </div>
  );
}