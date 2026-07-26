import {
  FaMobileAlt,
  FaLaptop,
  FaTshirt,
  FaCouch,
  FaGamepad,
  FaHeadphones,
  FaArrowRight,
} from "react-icons/fa";

const categories = [
  {
    name: "Mobiles",
    icon: <FaMobileAlt size={36} />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Laptops",
    icon: <FaLaptop size={36} />,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Fashion",
    icon: <FaTshirt size={36} />,
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Furniture",
    icon: <FaCouch size={36} />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    name: "Gaming",
    icon: <FaGamepad size={36} />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Accessories",
    icon: <FaHeadphones size={36} />,
    color: "bg-red-100 text-red-600",
  },
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center mb-10">

          <div>
            <h2 className="text-4xl font-bold">
              Shop by Category
            </h2>

            <p className="text-gray-500 mt-2">
              Discover products from your favourite categories
            </p>
          </div>

          <button className="flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
            View All <FaArrowRight />
          </button>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 cursor-pointer p-8 flex flex-col items-center"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${category.color}`}
              >
                {category.icon}
              </div>

              <h3 className="mt-6 font-semibold text-lg">
                {category.name}
              </h3>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default CategorySection;