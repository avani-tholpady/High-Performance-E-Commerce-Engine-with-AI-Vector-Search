import { useState } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import Sort from "../components/Sort";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import "./ProductList.css";

const products = [
  {
    id: 1,
    title: "Laptop",
    category: "Electronics",
    price: 55000,
    image: "https://via.placeholder.com/300",
    description: "High-performance laptop for work and gaming.",
  },
  {
    id: 2,
    title: "Shoes",
    category: "Fashion",
    price: 2500,
    image: "https://via.placeholder.com/300",
    description: "Comfortable casual shoes.",
  },
  {
    id: 3,
    title: "Headphones",
    category: "Electronics",
    price: 3500,
    image: "https://via.placeholder.com/300",
    description: "Wireless noise-cancelling headphones.",
  },
];

function ProductList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading] = useState(false);
  const [error] = useState("");

  const filteredProducts = products
    .filter((product) =>
      product.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((product) =>
      category ? product.category === category : true
    )
    .sort((a, b) => {
      if (sort === "low-high") return a.price - b.price;
      if (sort === "high-low") return b.price - a.price;
      return 0;
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Product Catalog
      </h1>

      <SearchBar search={search} setSearch={setSearch} />

      <Filter
        category={category}
        setCategory={setCategory}
      />

      <Sort
        sort={sort}
        setSort={setSort}
      />

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500 text-center mt-5">
          {error}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default ProductList;