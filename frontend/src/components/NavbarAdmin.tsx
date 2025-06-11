
import { Home } from "lucide-react"

export const NavbarAdmin = () => {
    return (
        <div className="flex justify-between items-center px-40 py-3 shadow-sm bg-white rounded-2xl mb-2">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-md flex items-center justify-center font-bold text-lg">
                    K
                </div>
                <div>
                    <h1 className="font-semibold text-lg text-black leading-none">Kadupuninda</h1>
                    <p className="text-sm text-gray-500">Hyderabad Meal Delivery</p>
                </div>
            </div>
            
            {/* Right: Customer View Button */}
            <button className="px-4 py-2 border flex items-center space-x-2 text-black text-sm font-medium rounded-lg hover:bg-black hover:text-white transition-colors">
             <Home className=" w-4 h-4" />
               <span><a href="/">Customer View</a></span>
            </button>
        </div>
    )
}