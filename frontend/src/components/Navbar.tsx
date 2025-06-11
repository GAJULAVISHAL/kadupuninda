import { Phone } from 'lucide-react';
export const Navbar = () => {
    return (
        <div className="flex justify-around items-center px-6 py-3 shadow-sm bg-white rounded-2xl mb-2">
            {/* Left: Logo + Name + Tagline */}
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-md flex items-center justify-center font-bold text-lg">
                    K
                </div>
                <div>
                    <h1 className="font-semibold text-lg text-black leading-none">Kadupuninda</h1>
                    <p className="text-sm text-gray-500">Hyderabad Meal Delivery</p>
                </div>
            </div>

            {/* Right: Phone */}
            <div className="flex items-center space-x-2 text-sm text-gray-800">
                <Phone className="text-pink-500 w-4 h-4" />
                <span>+91 40 1234 5678</span>
            </div>
        </div>
    )
}