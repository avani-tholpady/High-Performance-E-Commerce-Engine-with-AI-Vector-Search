import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-md">
      
      <h1 className="text-2xl font-bold text-blue-600">
        ShopAI
      </h1>

      <div className="flex gap-8">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
      </div>

      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg">
        Login
      </button>

    </nav>
  );
};

export default Navbar;