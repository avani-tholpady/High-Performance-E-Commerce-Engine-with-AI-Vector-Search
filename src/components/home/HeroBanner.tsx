import hero from "../../assets/hero.png";

const HeroBanner = () => {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-10 items-center">

        {/* Left */}
        <div>

          <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold">
            🔥 Limited Time Offer
          </span>

          <h1 className="text-6xl font-extrabold text-white leading-tight mt-8">
            Premium Shopping
            <br />
            Experience
          </h1>

          <p className="text-gray-300 text-xl mt-6 leading-8">
            Discover the latest electronics, fashion, beauty,
            furniture and much more at unbeatable prices.
          </p>

          <div className="flex gap-5 mt-10">

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition">
              Shop Now
            </button>

            <button className="border border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-black transition">
              Explore
            </button>

          </div>

          <div className="flex gap-12 mt-16">

            <div>
              <h2 className="text-3xl font-bold text-white">
                15K+
              </h2>
              <p className="text-gray-400">
                Happy Customers
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white">
                500+
              </h2>
              <p className="text-gray-400">
                Brands
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white">
                25K+
              </h2>
              <p className="text-gray-400">
                Products
              </p>
            </div>

          </div>

        </div>

        {/* Right */}

        <div className="flex justify-center">

          <div className="relative">

            <div className="absolute -inset-5 bg-blue-500 blur-3xl opacity-30 rounded-full"></div>

            <img
              src={hero}
              alt="Hero"
              className="relative w-full max-w-lg drop-shadow-2xl"
            />

          </div>

        </div>

      </div>
    </section>
  );
};

export default HeroBanner;