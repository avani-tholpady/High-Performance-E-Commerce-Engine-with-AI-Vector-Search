import Navbar from "../components/layout/Navbar";
import HeroBanner from "../components/home/HeroBanner";
import CategorySection from "../components/home/CategorySection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts />
      <Footer />
    </div>
  );
};

export default Home;