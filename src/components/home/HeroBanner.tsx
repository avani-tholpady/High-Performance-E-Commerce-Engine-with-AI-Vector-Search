const HeroBanner = () => {
  return (
    <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">

      <div className="max-w-7xl mx-auto py-24 px-6 flex justify-between items-center">

        <div>

          <h1 className="text-6xl font-bold mb-5">
            Mega Shopping Sale
          </h1>

          <p className="text-xl mb-8">
            Up to 70% OFF on Electronics & Fashion
          </p>

          <button className="bg-yellow-400 text-black px-7 py-3 rounded-lg font-semibold">
            Shop Now
          </button>

        </div>

      </div>

    </section>
  );
};

export default HeroBanner;