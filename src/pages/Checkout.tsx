import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleOrder = () => {
    if (!name || !address || !phone) {
      alert("Please fill all fields");
      return;
    }

    alert("🎉 Order Placed Successfully!");

    localStorage.removeItem("cart");

    navigate("/");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

          <div className="bg-white p-8 rounded-xl shadow">

            <h2 className="text-3xl font-bold mb-6">
              Shipping Details
            </h2>

            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-3 rounded mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="w-full border p-3 rounded mb-4"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <textarea
              placeholder="Shipping Address"
              className="w-full border p-3 rounded h-32"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

          </div>

          <div className="bg-white p-8 rounded-xl shadow h-fit">

            <h2 className="text-3xl font-bold mb-6">
              Order Summary
            </h2>

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between mb-3"
              >
                <span>{item.title}</span>
                <span>₹{item.price.toLocaleString()}</span>
              </div>
            ))}

            <hr className="my-5" />

            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleOrder}
              className="w-full mt-8 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Place Order
            </button>

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Checkout;