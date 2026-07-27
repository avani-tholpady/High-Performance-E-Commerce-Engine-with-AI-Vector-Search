const categories = [
  "Electronics",
  "Fashion",
  "Mobiles",
  "Accessories",
  "Home"
];


const Categories = () => {

return (

<section className="mt-10">

<h2 className="text-3xl font-bold mb-5">
Categories
</h2>


<div className="grid grid-cols-2 md:grid-cols-5 gap-5">

{
categories.map((item)=>(
<div
key={item}
className="p-6 bg-gray-100 rounded-xl text-center 
hover:bg-blue-100 cursor-pointer"
>

{item}

</div>
))

}

</div>


</section>

)

}

export default Categories;