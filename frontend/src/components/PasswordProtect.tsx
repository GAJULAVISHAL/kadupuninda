import { useState, type ReactNode, type FormEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

interface PasswordProtectProps {
    children: ReactNode;
}

export function PasswordProtect({ children }: PasswordProtectProps) {
    // State inference works perfectly here (Type: boolean)
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => sessionStorage.getItem("admin-auth") === "true"
    );
    // State inference works here (Type: string)
    const [password, setPassword] = useState("");

    // 2. Type the form submission event
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem("admin-auth", "true");
            toast.success("Access granted. Welcome, Admin!");
        } else {
            toast.error("Incorrect password. Access denied.");
            setIsAuthenticated(false);
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Toaster position="top-right" />
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-4">Admin Access</h2>
                <p className="text-center text-sm text-gray-600 mb-6">
                    This area is restricted. Please enter the password to continue.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            // 3. The 'onChange' event is automatically inferred here
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    >
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
}