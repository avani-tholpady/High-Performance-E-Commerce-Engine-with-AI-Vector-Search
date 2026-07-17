const path = require("path");
const mongoose = require("mongoose");

// Load environment variables from backend/.env
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = require("../config/db");
const Product = require("../models/Product");

// Constant datasets for realistic mockup data generation
const ADJECTIVES = ["Premium", "Ultra", "Classic", "Wireless", "Smart", "Eco-Friendly", "Pro", "Vintage", "Modern", "Portable", "Ergonomic", "Luxury", "Minimalist", "High-Performance", "Heavy-Duty"];
const BRANDS = {
  electronics: ["Sony", "Samsung", "Apple", "Bose", "Anker"],
  fashion: ["Nike", "Adidas", "Levi's", "Zara", "H&M"],
  home: ["Ikea", "Dyson", "Philips", "Muji", "Keurig"],
  books: ["Penguin", "HarperCollins", "Random House", "Simon & Schuster", "Macmillan"],
  sports: ["Under Armour", "Patagonia", "Columbia", "Decathlon", "North Face"],
  beauty: ["L'Oreal", "Estee Lauder", "Clinique", "Nivea", "Sephora"],
  accessories: ["Fossil", "Herschel", "Ray-Ban", "Casio", "Samsonite"]
};
const NOUNS = {
  electronics: {
    audio: ["Headphones", "Earbuds", "Bluetooth Speaker", "Soundbar", "Microphone"],
    computers: ["Laptop", "Monitor", "Keyboard", "Mouse", "Router"],
    "mobile-accessories": ["Phone Case", "Power Bank", "Screen Protector", "Charger Cable", "Wireless Charger"]
  },
  fashion: {
    "mens-clothing": ["T-Shirt", "Jeans", "Jacket", "Sweater", "Chinos"],
    "womens-clothing": ["Dress", "Blouse", "Skirt", "Leggings", "Cardigan"],
    footwear: ["Sneakers", "Running Shoes", "Boots", "Sandals", "Loafers"]
  },
  home: {
    furniture: ["Office Chair", "Desk", "Sofa", "Coffee Table", "Bookshelf"],
    kitchen: ["Coffee Maker", "Blender", "Toaster", "Air Fryer", "Knife Set"],
    decor: ["Table Lamp", "Wall Clock", "Vase", "Mirror", "Area Rug"]
  },
  books: {
    fiction: ["Novel", "Sci-Fi Paperback", "Mystery Hardcover", "Thriller Book", "Fantasy Epic"],
    "non-fiction": ["Biography", "Self-Help Guide", "History Book", "Science Journal", "Cookbook"]
  },
  sports: {
    "exercise-gear": ["Dumbbell Set", "Yoga Mat", "Resistance Bands", "Kettlebell", "Jump Rope"],
    camping: ["Sleeping Bag", "Tent", "Backpack", "Lantern", "Camping Stove"],
    "sports-wear": ["Track Pants", "Windbreaker", "Shorts", "Running Tee", "Socks"]
  },
  beauty: {
    skincare: ["Moisturizer", "Face Serum", "Sunscreen", "Cleanser", "Face Mask"],
    haircare: ["Shampoo", "Conditioner", "Hair Oil", "Hair Dryer", "Styling Gel"]
  },
  accessories: {
    bags: ["Backpack", "Messenger Bag", "Duffel Bag", "Tote Bag", "Wallet"],
    watches: ["Smartwatch", "Analog Watch", "Digital Watch", "Chronograph", "Leather Watch"]
  }
};

const CATEGORY_MAP = [
  { main: "electronics", subs: ["audio", "computers", "mobile-accessories"], weight: 0.25 },
  { main: "fashion", subs: ["mens-clothing", "womens-clothing", "footwear"], weight: 0.20 },
  { main: "home", subs: ["furniture", "kitchen", "decor"], weight: 0.15 },
  { main: "books", subs: ["fiction", "non-fiction"], weight: 0.10 },
  { main: "sports", subs: ["exercise-gear", "camping", "sports-wear"], weight: 0.10 },
  { main: "beauty", subs: ["skincare", "haircare"], weight: 0.10 },
  { main: "accessories", subs: ["bags", "watches"], weight: 0.10 }
];

/**
 * Creates a pseudo-random number generator (PRNG) using LCG algorithm
 * to ensure deterministic, reproducible seeding results.
 */
const createRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

/**
 * Returns a category configuration matching target weight distributions
 */
const selectCategory = (randomVal) => {
  let cumulative = 0;
  for (const cat of CATEGORY_MAP) {
    cumulative += cat.weight;
    if (randomVal <= cumulative) {
      return cat;
    }
  }
  return CATEGORY_MAP[CATEGORY_MAP.length - 1];
};

const generateMockProducts = (size, seedVal) => {
  const random = createRandom(seedVal);
  const products = [];

  for (let i = 1; i <= size; i++) {
    const catConfig = selectCategory(random());
    const mainCategory = catConfig.main;
    const subcategory = catConfig.subs[Math.floor(random() * catConfig.subs.length)];
    
    const brandList = BRANDS[mainCategory];
    const brand = brandList[Math.floor(random() * brandList.length)];
    
    const adj = ADJECTIVES[Math.floor(random() * ADJECTIVES.length)];
    const nounList = NOUNS[mainCategory][subcategory];
    const noun = nounList[Math.floor(random() * nounList.length)];
    
    const name = `${brand} ${adj} ${noun}`;
    
    // Generate SKU and URL-friendly Slug using deterministic counters
    const catCode = (mainCategory.substring(0, 3) + "-" + subcategory.substring(0, 3)).toUpperCase();
    const sku = `${catCode}-${String(i).padStart(6, "0")}`;
    const slug = `${brand.toLowerCase()}-${adj.toLowerCase()}-${noun.toLowerCase()}-${i}`.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");

    const description = `The brand new ${name} from ${brand}. Designed for maximum comfort, utility, and modern lifestyles in the ${subcategory} department. Realized with premium materials to ensure high durability.`;
    
    // Select price range base on category
    let minPriceVal = 10, maxPriceVal = 150;
    if (mainCategory === "electronics") {
      minPriceVal = 40; maxPriceVal = 1200;
    } else if (mainCategory === "books") {
      minPriceVal = 5; maxPriceVal = 40;
    } else if (mainCategory === "home") {
      minPriceVal = 20; maxPriceVal = 500;
    }

    const price = parseFloat((minPriceVal + random() * (maxPriceVal - minPriceVal)).toFixed(2));
    
    // 30% discount rates
    const compareAtPrice = random() < 0.3 ? parseFloat((price * (1.15 + random() * 0.25)).toFixed(2)) : undefined;

    // 5% of products are out of stock
    const stock = random() < 0.05 ? 0 : Math.floor(random() * 501);

    const images = [
      `https://assets.ecommerce.com/products/${mainCategory}/${subcategory}/image-${i}-1.jpg`,
      `https://assets.ecommerce.com/products/${mainCategory}/${subcategory}/image-${i}-2.jpg`
    ];

    const tags = [mainCategory, subcategory, brand.toLowerCase()];
    
    // Standard normal distribution for ratings average
    const average = parseFloat((3.5 + random() * 1.5).toFixed(1));
    const count = Math.floor(random() * 1500);

    products.push({
      name,
      slug,
      sku,
      description,
      price,
      compareAtPrice,
      category: `${mainCategory}/${subcategory}`,
      brand,
      images,
      stock,
      tags,
      ratings: { average, count },
      isActive: true
    });
  }

  return products;
};

const runSeeder = async () => {
  const args = process.argv.slice(2);
  const options = {
    size: 1000,
    mode: "append",
    seed: 42,
    batchSize: 500
  };

  args.forEach(arg => {
    if (arg.startsWith("--size=")) {
      options.size = parseInt(arg.split("=")[1], 10) || options.size;
    } else if (arg.startsWith("--mode=")) {
      options.mode = arg.split("=")[1].toLowerCase() || options.mode;
    } else if (arg.startsWith("--seed=")) {
      options.seed = parseInt(arg.split("=")[1], 10) || options.seed;
    } else if (arg.startsWith("--batch-size=")) {
      options.batchSize = parseInt(arg.split("=")[1], 10) || options.batchSize;
    }
  });

  const startTime = Date.now();
  console.log(`Starting mock seeding script...`);
  console.log(`Configuration: size=${options.size}, mode=${options.mode}, seed=${options.seed}, batchSize=${options.batchSize}`);

  // 1. Establish DB Connection
  await connectDB();

  try {
    // 2. Clear table if reset mode selected
    if (options.mode === "reset") {
      const isProduction = process.env.NODE_ENV === "production" || process.env.MONGO_URI.includes("prod-cluster") || process.env.MONGO_URI.includes("production");
      if (isProduction) {
        console.error("FATAL ERROR: Truncation/Reset mode is prohibited on production connections!");
        process.exit(1);
      }
      console.log("Truncating active products collection...");
      await Product.deleteMany({});
      console.log("Collection reset completed.");
    }

    // 3. Compile mock data
    console.log("Compiling mock product structures in memory...");
    const genStartTime = Date.now();
    const mockProducts = generateMockProducts(options.size, options.seed);
    const genDuration = Date.now() - genStartTime;
    console.log(`Compiled ${mockProducts.length} mock product objects in ${genDuration}ms.`);

    // 4. Batch Insertion logic
    let successCount = 0;
    let duplicateSkipCount = 0;
    let failureCount = 0;
    
    const writeStartTime = Date.now();

    for (let i = 0; i < mockProducts.length; i += options.batchSize) {
      const batch = mockProducts.slice(i, i + options.batchSize);
      
      try {
        if (options.mode === "upsert") {
          // Idempotent UPSERT mode via bulkWrite operations
          const bulkOps = batch.map(prod => ({
            updateOne: {
              filter: { sku: prod.sku },
              update: { $set: prod },
              upsert: true
            }
          }));
          const result = await Product.bulkWrite(bulkOps);
          successCount += (result.nInserted || 0) + (result.nUpserted || 0);
          // nModified matches count updated
        } else {
          // APPEND mode (default) using unordered inserts to skip duplicates
          const result = await Product.insertMany(batch, { ordered: false });
          successCount += result.length;
        }
      } catch (error) {
        if (error.name === "MongoBulkWriteError" || error.code === 11000) {
          if (error.result) {
            successCount += error.result.insertedCount || (error.result.result ? error.result.result.nInserted : 0) || 0;
          }
          if (error.writeErrors) {
            error.writeErrors.forEach(err => {
              const innerError = err.err || err;
              if (innerError.code === 11000) {
                duplicateSkipCount++;
              } else {
                failureCount++;
                console.error(`Write error item: ${innerError.errmsg || innerError.message || JSON.stringify(innerError)}`);
              }
            });
          }
        } else {
          throw error;
        }
      }
    }

    const writeDuration = Date.now() - writeStartTime;
    const totalDuration = Date.now() - startTime;
    const throughput = parseFloat(((successCount + duplicateSkipCount) / (writeDuration / 1000)).toFixed(2));

    console.log("\n==================================================");
    console.log("                   SEED SUMMARY                   ");
    console.log("==================================================");
    console.log(`Total Attempted:     ${options.size}`);
    console.log(`Successfully Seeded: ${successCount}`);
    console.log(`Duplicates Skipped:  ${duplicateSkipCount}`);
    console.log(`Errors Encountered:  ${failureCount}`);
    console.log(`Write Duration:      ${(writeDuration / 1000).toFixed(2)}s`);
    console.log(`Throughput:          ${throughput} docs/sec`);
    console.log(`Total Elapsed Time:  ${(totalDuration / 1000).toFixed(2)}s`);
    console.log("==================================================\n");

    console.log("Downstream Hook: Vector Search embeds and Redis cache flush deferred (Integration pending).");

  } catch (err) {
    console.error("FATAL ERROR: Seeding process failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed cleanly.");
    process.exit(0);
  }
};

if (require.main === module) {
  runSeeder();
}
