const categories = [
  "Mobiles",
  "Laptops",
  "Fashion",
  "Electronics",
  "Furniture",
  "Beauty",
  "Sports",
  "Books",
];

const CategorySection = () => {
  return (
    <section className="max-w-7xl mx-auto py-12 px-5">

      <h2 className="text-3xl font-bold mb-8">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5">

        {categories.map((category) => (
          <div
            key={category}
            className="bg-white shadow rounded-lg p-5 text-center hover:shadow-xl cursor-pointer"
          >
            {category}
          </div>
        ))}

      </div>

    </section>
  );
};

export default CategorySection;