import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/HeroBanner";
import Categories from "../components/home/CategorySection";
import ProductGrid from "../components/product/ProductGrid";


const Home=()=>{


return(

<div className="px-8">

<Navbar/>


<Hero/>


<Categories/>


<section className="mt-12">

<h2 className="text-3xl font-bold mb-6">
Featured Products
</h2>


<ProductGrid/>


</section>


</div>

)

}


export default Home;