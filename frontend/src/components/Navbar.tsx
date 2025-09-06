import { Phone } from 'lucide-react';
import logo from '../assets/logo1.png';

export const Navbar = () => {
    return (
        // On small screens, use less padding (px-4). On medium screens and up, use more (md:px-6).
        <div className="flex justify-between items-center px-4 md:px-6 py-3 shadow-sm bg-white rounded-2xl mb-2">
            
            {/* Left: Logo + Name + Tagline */}
            <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-md flex items-center justify-center font-bold text-lg flex-shrink-0">
                    <img 
                                        src={logo} 
                                        alt="Kadupuninda Logo" 
                                        className="w-12 h-12 object-fill" // object-contain ensures the logo fits well
                                    />
                </div>
                <div>
                    <h1 className="font-semibold text-lg text-black leading-none">Kadupuninda</h1>
                    {/* The tagline will be hidden on very small screens (xs) and appear on small (sm) screens and up */}
                    <p className="text-sm text-gray-500 hidden sm:block">Hyderabad Meal Delivery</p>
                </div>
            </div>

            {/* Right: Phone */}
            <a href="tel:+914012345678" className="flex items-center space-x-2 text-sm text-gray-800 hover:text-pink-500 transition-colors">
                <Phone className="text-pink-500 w-4 h-4" />
                {/* The phone number text will be hidden on very small screens and appear on screens larger than that */}
                <span className="hidden sm:inline">+91 40 1234 5678</span>
            </a>
        </div>
    )
}