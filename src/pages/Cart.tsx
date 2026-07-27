import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, removeFromCart } = useCart();

  const subtotal = cart.reduce((total, item) => total + item.price, 0);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-6xl mx-auto">

          <h1 className="text-4xl font-bold mb-8">
            Shopping Cart
          </h1>

          {cart.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">

              <h2 className="text-2xl font-semibold mb-4">
                Your cart is empty 🛒
              </h2>

              <Link
                to="/products"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </Link>

            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">

              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-5">

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow p-5 flex gap-5 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-28 h-28 object-cover rounded-lg"
                    />

                    <div className="flex-1">

                      <h2 className="text-xl font-semibold">
                        {item.title}
                      </h2>

                      <p className="text-blue-600 font-bold mt-2">
                        ₹{item.price.toLocaleString()}
                      </p>

                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>

                  </div>
                ))}

              </div>

              {/* Summary */}
              <div className="bg-white rounded-xl shadow p-6 h-fit">

                <h2 className="text-2xl font-bold mb-5">
                  Order Summary
                </h2>

                <div className="flex justify-between mb-4">
                  <span>Items</span>
                  <span>{cart.length}</span>
                </div>

                <div className="flex justify-between mb-4">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between mb-6">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <hr />

                <div className="flex justify-between text-xl font-bold my-6">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                <Link
                  to="/checkout"
                  className="block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Proceed to Checkout
                </Link>

              </div>

            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Cart;