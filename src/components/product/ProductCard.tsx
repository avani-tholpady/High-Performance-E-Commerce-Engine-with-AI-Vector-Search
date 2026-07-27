import { Product } from "../../types/Product";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">

      <img
        src={product.image}
        alt={product.title}
        className="h-48 w-full object-cover rounded-lg"
      />

      <h2 className="text-xl font-bold mt-3">
        {product.title}
      </h2>

      <p className="text-gray-600">
        {product.description}
      </p>

      <p className="text-blue-600 font-bold mt-2">
        ₹{product.price}
      </p>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
        Add to Cart
      </button>

    </div>
  );
};

export default ProductCard;