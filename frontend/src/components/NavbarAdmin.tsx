import { Home } from "lucide-react";
import logo from '../assets/logo1.png';
export const NavbarAdmin = () => {
    return (
        // On small screens (mobile), reduce padding with px-4. On medium screens and up, use more padding with md:px-8
        <div className="flex justify-between items-center px-4 md:px-8 py-3 shadow-sm bg-white">
            <div className="flex items-center space-x-3">
                {/* 👇 2. Replace the div with an img tag */}
                <img 
                    src={logo} 
                    alt="Kadupuninda Logo" 
                    className="w-12 h-12 object-fill" // object-contain ensures the logo fits well
                />
                <div>
                    <h1 className="font-semibold text-lg text-black leading-none">Kadupuninda</h1>
                    {/* Hide tagline on very small screens */}
                    <p className="text-sm text-gray-500 hidden sm:block">Hyderabad Meal Delivery</p>
                </div>
            </div>
            
            <a 
                href="/" 
                className="px-3 py-2 border flex items-center space-x-2 text-black text-sm font-medium rounded-lg hover:bg-black hover:text-white transition-colors"
            >
             <Home className="w-4 h-4" />
               {/* This text will be hidden on small screens and visible on medium screens and up */}
               <span className="hidden md:inline">Customer View</span>
            </a>
        </div>
    );
}