import { useParams, Link } from "react-router-dom";
import { products } from "../data/products";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-3xl font-bold">Product Not Found</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-gray-100 min-h-screen py-12">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 grid md:grid-cols-2 gap-10">

          <img
            src={product.image}
            alt={product.title}
            className="w-full h-96 object-cover rounded-lg"
          />

          <div>

            <h1 className="text-4xl font-bold">
              {product.title}
            </h1>

            <p className="text-3xl text-blue-600 font-bold mt-5">
              ₹{product.price.toLocaleString()}
            </p>

            <p className="text-gray-600 mt-6">
              {product.description}
            </p>

            <div className="flex gap-4 mt-10">

              <button
                onClick={() => addToCart(product)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Add to Cart
              </button>

              <Link
                to="/cart"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Go to Cart
              </Link>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetails;