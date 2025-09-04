import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { FaMoon, FaSun } from "react-icons/fa";

const Topbar = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        < div className="max-w-7xl mx-auto px-4 py-2 flex justify-between text-sm" >
            <Link href="/services" className={`transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                BLESSING Services &rarr;
            </Link>
            <div className="flex flex-row space-x-2 items-center">
                <Link href="/help" className={`transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Help</Link>
                <Link href="/contact" className={`transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contact</Link>
                <button
                    onClick={toggleTheme}
                    className={`p-1 cursor-pointer rounded-full transition-colors duration-200 ${theme === 'dark'
                        ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {theme === 'dark' ? <FaSun className="w-3 h-3" /> : <FaMoon className="w-3 h-3" />}
                </button>
            </div>
        </div >
    );
};

export default Topbar;