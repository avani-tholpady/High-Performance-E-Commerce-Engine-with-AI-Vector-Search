const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = require("../config/db");
const Product = require("../models/Product");

const createIndexes = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    
    console.log("Synchronizing Product indexes...");
    const syncResult = await Product.syncIndexes();
    console.log("Index synchronization complete!");
    console.log("Sync details:", syncResult);

    const indexes = await Product.collection.indexes();
    console.log("\nCreated Indexes:");
    indexes.forEach((idx) => {
      console.log(`- Name: ${idx.name}`);
      console.log(`  Key: ${JSON.stringify(idx.key)}`);
      if (idx.weights) {
        console.log(`  Weights: ${JSON.stringify(idx.weights)}`);
      }
    });

    console.log("\nDatabase connection closing...");
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating/synchronizing indexes:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

createIndexes();
