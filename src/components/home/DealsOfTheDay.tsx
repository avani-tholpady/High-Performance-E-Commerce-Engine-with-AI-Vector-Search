import ProductCard from "../product/ProductCard";
import { products } from "../../data/products";

const DealsOfTheDay = () => {
  return (
    <section className="py-20 bg-slate-100">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center mb-12">

          <div>
            <p className="text-red-500 font-semibold">
              Limited Time Offer
            </p>

            <h2 className="text-4xl font-bold mt-2">
              Deals of the Day
            </h2>

            <p className="text-gray-500 mt-3">
              Grab the best offers before they're gone.
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition">
            View All
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}

        </div>

      </div>

    </section>
  );
};

export default DealsOfTheDay;