import { Product } from "../../types/Product";
import ProductCard from "../components/product/ProductCard";
interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow">

      <img
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-cover"
      />

      <h2 className="text-xl font-bold mt-3">
        {product.title}
      </h2>

      <p>{product.description}</p>

      <p className="font-bold">
        ₹{product.price}
      </p>

    </div>
  );
};

export default ProductCard;