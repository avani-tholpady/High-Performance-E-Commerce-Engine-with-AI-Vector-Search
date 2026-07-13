function ProductList() {
  return (
    <div>
      <h1>Product Catalog</h1>

      <input
        type="text"
        placeholder="Search products..."
      />

      <div>
        {/* Product cards will be displayed here */}
      </div>

      <button>Previous</button>
      <button>Next</button>
    </div>
  );
}

export default ProductList;