import { useState } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

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

  return (
    <div>
      <h1>Product Catalog</h1>

      <SearchBar search={search} setSearch={setSearch} />

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
        <button style={{ marginLeft: "10px" }}>Next</button>
      </div>
    </div>
  );
}

export default ProductList;