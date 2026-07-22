import Navbar from "../components/layout/Navbar";
import HeroBanner from "../components/home/HeroBanner";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <HeroBanner />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <FeaturedProducts />
      </main>

      <Footer />
    </div>
  );
};

export default Home;