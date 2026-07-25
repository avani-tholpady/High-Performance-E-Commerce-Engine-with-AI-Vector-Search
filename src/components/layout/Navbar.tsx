import { Link } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";

const Navbar = () => {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-sm">
        <div className="max-w-7xl mx-auto flex justify-between px-6 py-2">
          <p>🚚 Free Shipping on Orders above ₹999</p>
          <p>24/7 Customer Support</p>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-extrabold text-blue-600 tracking-wide"
          >
            ShopVerse
          </Link>

          {/* Search */}
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-5 py-3 w-[500px]">

            <FaSearch className="text-gray-400" />

            <input
              type="text"
              placeholder="Search for Products..."
              className="bg-transparent outline-none ml-3 w-full"
            />
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex gap-8 font-medium text-gray-700">
            <Link to="/">Home</Link>
            <Link to="/products">Shop</Link>
            <Link to="/">Categories</Link>
            <Link to="/">Deals</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-6">

            <button className="hover:text-red-500 transition text-2xl">
              <FaHeart />
            </button>

            <button className="relative hover:text-blue-600 transition text-2xl">

              <FaShoppingCart />

              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>

            </button>

            <button className="hover:text-blue-600 transition text-2xl">
              <FaUserCircle />
            </button>

          </div>

        </div>
      </header>
    </>
  );
};

export default Navbar;