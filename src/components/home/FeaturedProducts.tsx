import ProductCard from "../product/ProductCard";
import { products } from "../../data/products";

const FeaturedProducts = () => {
  return (
    <section className="py-20 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h2 className="text-4xl font-bold">
              Featured Products
            </h2>

            <p className="text-gray-500 mt-2">
              Best selling products this week
            </p>

          </div>

          <button className="text-blue-600 font-semibold">
            View All →
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}

        </div>

      </div>

    </section>
  );
};

export default FeaturedProducts;