require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product");
const embedText = require("../utils/embedding");

async function generateEmbeddings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const products = await Product.find();

    console.log(`Found ${products.length} products`);

    for (const product of products) {
      const text = `${product.name} ${product.brand} ${product.category} ${product.description}`;

      console.log(`Generating embedding for: ${product.name}`);

      product.embedding = await embedText(text);

      await product.save();

      console.log(`✔ Saved embedding for ${product.name}`);
    }

    console.log("🎉 All embeddings generated successfully!");

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

generateEmbeddings();