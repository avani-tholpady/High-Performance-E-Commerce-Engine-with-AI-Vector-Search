const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 shadow-md bg-white">
      <h1 className="text-2xl font-bold text-blue-600">
        ShopSmart
      </h1>

      <ul className="flex gap-6 text-gray-700 font-medium">
        <li className="cursor-pointer hover:text-blue-600">Home</li>
        <li className="cursor-pointer hover:text-blue-600">Products</li>
        <li className="cursor-pointer hover:text-blue-600">Categories</li>
      </ul>
    </nav>
  );
};

export default Navbar;