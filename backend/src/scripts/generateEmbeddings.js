require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product");
const embedText = require("../utils/embedding");

const CONCURRENCY_LIMIT = 5; // Process in parallel batches to be efficient without hitting rate limits

async function generateEmbeddings() {
  const force = process.argv.includes("--force") || process.argv.includes("-f");

  if (!process.env.HF_TOKEN) {
    console.error("❌ Error: HF_TOKEN is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Query filters
    const query = force ? {} : { $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }, { embedding: null }] };
    const products = await Product.find(query);

    console.log(`🔍 Found ${products.length} products needing embedding generation${force ? " (forced)" : ""}.`);

    if (products.length === 0) {
      console.log("🎉 All products already have embeddings. Nothing to do!");
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // Process products in batches
    for (let i = 0; i < products.length; i += CONCURRENCY_LIMIT) {
      const batch = products.slice(i, i + CONCURRENCY_LIMIT);
      console.log(`\n📦 Processing batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1} of ${Math.ceil(products.length / CONCURRENCY_LIMIT)}...`);

      const batchPromises = batch.map(async (product) => {
        try {
          const textToEmbed = `Name: ${product.name}. Brand: ${product.brand}. Category: ${product.category}. Description: ${product.description}.`;

          const embedding = await embedText(textToEmbed);
          if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("Returned embedding is empty or invalid format.");
          }

          product.embedding = embedding;
          await product.save();
          console.log(`   ✔ Generated and saved embedding for: "${product.name}"`);
          successCount++;
        } catch (err) {
          console.error(`   ❌ Failed for product "${product.name}" (${product._id}):`, err.message);
          failCount++;
        }
      });

      await Promise.all(batchPromises);
    }

    console.log("\n==========================================");
    console.log("🎉 Embedding generation run completed!");
    console.log(`   - Successes: ${successCount}`);
    console.log(`   - Failures:  ${failCount}`);
    console.log("==========================================");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Critical script error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

generateEmbeddings();
