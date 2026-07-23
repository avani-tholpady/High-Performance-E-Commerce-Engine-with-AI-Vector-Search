import {
  FaSearch,
  FaShoppingCart,
  FaUserCircle,
  FaHeart,
} from "react-icons/fa";

const Navbar = () => {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">
          ShopVerse
        </h1>

        <div className="hidden md:flex bg-gray-100 rounded-lg px-3 py-2 w-[450px]">
          <FaSearch className="text-gray-500 mt-1" />

          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none ml-3 w-full"
          />
        </div>

        <div className="flex gap-6 text-2xl">
          <FaHeart className="cursor-pointer hover:text-red-500" />
          <FaShoppingCart className="cursor-pointer hover:text-blue-600" />
          <FaUserCircle className="cursor-pointer hover:text-blue-600" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;