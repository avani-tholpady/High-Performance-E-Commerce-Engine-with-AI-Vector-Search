const FeaturedProducts = () => {
  return (
    <section className="max-w-7xl mx-auto py-12 px-5">

      <h2 className="text-3xl font-bold mb-8">
        Featured Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {[1,2,3,4].map((item)=>(
          <div
            key={item}
            className="bg-white rounded-lg shadow p-4"
          >

            <div className="h-48 bg-gray-200 rounded"></div>

            <h3 className="font-semibold mt-4">
              Product {item}
            </h3>

            <p className="text-blue-600 font-bold mt-2">
              ₹999
            </p>

            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
              View
            </button>

          </div>
        ))}

      </div>

    </section>
  );
};

export default FeaturedProducts;