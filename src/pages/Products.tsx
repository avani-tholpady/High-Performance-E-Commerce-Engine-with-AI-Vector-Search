import { useState } from "react";
import SearchBar from "../components/filters/SearchBar";
import ProductCard from "../components/product/ProductCard";
import { products } from "../data/products";

const Products = () => {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">

        <h1 className="text-4xl font-bold">
          Products
        </h1>

        <SearchBar
          search={search}
          setSearch={setSearch}
        />

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}

      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 mt-16 text-xl">
          No products found.
        </div>
      )}

    </div>
  );
};

export default Products;