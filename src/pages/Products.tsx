import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductCard from "../components/product/ProductCard";
import { products } from "../data/products";


const Products = () => {

  return (
    <>
      <Navbar />

      <div className="p-10">

        <h1 className="text-4xl font-bold mb-8">
          Our Products
        </h1>


        <div className="grid grid-cols-3 gap-6">

          {
            products.map((product)=>(
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          }

        </div>

      </div>

      <Footer />

    </>
  );
};


export default Products;