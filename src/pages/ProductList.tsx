import { useState } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import Sort from "../components/Sort";

const products = [
  {
    id: 1,
    name: "Laptop",
    category: "Electronics",
    price: 55000,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Shoes",
    category: "Fashion",
    price: 2500,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Headphones",
    category: "Electronics",
    price: 3500,
    image: "https://via.placeholder.com/150",
  },
];

function ProductList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  return (
    <div>
      <h1>Product Catalog</h1>

      <SearchBar search={search} setSearch={setSearch} />

      <Filter
        category={category}
        setCategory={setCategory}
      />

      <Sort
        sort={sort}
        setSort={setSort}
      />

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            category={product.category}
            price={product.price}
            image={product.image}
          />
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button>Previous</button>
        <button style={{ margin: "0 10px" }}>1</button>
        <button style={{ marginRight: "10px" }}>2</button>
        <button>Next</button>
      </div>
    </div>
  );
}

export default ProductList;