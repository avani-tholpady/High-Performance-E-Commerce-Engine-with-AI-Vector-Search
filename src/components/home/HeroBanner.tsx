const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 
    text-white px-10 py-20 rounded-xl mt-6">

      <div className="max-w-xl">

        <h1 className="text-5xl font-bold mb-5">
          Smart Shopping Powered by AI
        </h1>

        <p className="text-lg mb-8">
          Discover products faster with AI powered search 
          and personalized recommendations.
        </p>


        <button className="bg-white text-blue-600 px-7 py-3 rounded-lg font-semibold">
          Explore Products
        </button>

      </div>

    </section>
  )
}

export default Hero;