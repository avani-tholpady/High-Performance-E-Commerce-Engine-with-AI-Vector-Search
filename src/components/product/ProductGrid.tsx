import ProductCard from "./ProductCard";
import {products} from "../../data/products";


const ProductGrid=()=>{

return(

<div className="
grid grid-cols-1 sm:grid-cols-2 
lg:grid-cols-4 gap-6
">

{
products.map(product=>(

<ProductCard
key={product.id}
{...product}
/>

))
}


</div>

)

}

export default ProductGrid;