import { Link } from "react-router-dom";
import { products } from "../../data/products";
import ProductCard from "../ProductCard";

const FeaturedProducts = () => {
  const featured = products.slice(0, 4);

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Featured Products
          </h2>

          <Link
            to="/products"
            className="text-blue-600 font-semibold hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;