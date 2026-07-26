import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";

interface ProductProps {
  id: number;
  title: string;
  image: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
}

const ProductCard = ({
  title,
  image,
  category,
  price,
  oldPrice,
  rating,
}: ProductProps) => {
  return (
    <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">

      {/* Image */}
      <div className="relative bg-gray-100 h-64 flex items-center justify-center">

        <img
          src={image}
          alt={title}
          className="h-52 object-contain group-hover:scale-110 transition duration-500"
        />

        {/* Wishlist */}
        <button className="absolute top-4 right-4 bg-white rounded-full p-3 shadow hover:bg-red-500 hover:text-white transition">
          <FaHeart />
        </button>

        {/* Discount */}
        <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          25% OFF
        </span>

      </div>

      {/* Details */}
      <div className="p-5">

        <p className="text-sm text-blue-600 font-medium">
          {category}
        </p>

        <h3 className="text-lg font-bold mt-2 line-clamp-2">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-3 text-yellow-500">

          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={
                index < Math.round(rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}

          <span className="text-gray-500 ml-2">
            ({rating})
          </span>

        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mt-4">

          <span className="text-2xl font-bold text-blue-600">
            ₹{price}
          </span>

          <span className="line-through text-gray-400">
            ₹{oldPrice}
          </span>

        </div>

        {/* Button */}
        <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-3 transition">

          <FaShoppingCart />

          Add to Cart

        </button>

      </div>
    </div>
  );
};

export default ProductCard;