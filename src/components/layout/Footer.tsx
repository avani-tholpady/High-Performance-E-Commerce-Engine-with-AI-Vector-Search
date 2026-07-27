import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mt-16">

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

        {/* Logo */}
        <div>
          <h2 className="text-3xl font-bold text-blue-400">
            ShopVerse
          </h2>

          <p className="mt-4 text-gray-300">
            Your one-stop destination for electronics,
            fashion, accessories, and more.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2">

            <li>
              <Link to="/" className="hover:text-blue-400">
                Home
              </Link>
            </li>

            <li>
              <Link to="/products" className="hover:text-blue-400">
                Products
              </Link>
            </li>

            <li>
              <Link to="/cart" className="hover:text-blue-400">
                Cart
              </Link>
            </li>

            <li>
              <Link to="/login" className="hover:text-blue-400">
                Login
              </Link>
            </li>

          </ul>
        </div>

        {/* Contact */}
        <div>

          <h3 className="text-xl font-semibold mb-4">
            Contact
          </h3>

          <p>Email: support@shopverse.com</p>
          <p className="mt-2">Phone: +91 9876543210</p>
          <p className="mt-2">Hyderabad, India</p>

        </div>

        {/* Social */}
        <div>

          <h3 className="text-xl font-semibold mb-4">
            Follow Us
          </h3>

          <div className="flex gap-5 text-2xl">

            <FaFacebook className="cursor-pointer hover:text-blue-400" />
            <FaInstagram className="cursor-pointer hover:text-pink-400" />
            <FaTwitter className="cursor-pointer hover:text-sky-400" />
            <FaGithub className="cursor-pointer hover:text-gray-300" />

          </div>

        </div>

      </div>

      <div className="border-t border-gray-700 py-5 text-center text-gray-400">

        © 2026 ShopVerse. All Rights Reserved.

      </div>

    </footer>
  );
};

export default Footer;