const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getPriceRange,
  getRelatedProducts,
  aiSearch,
  getFeaturedProducts,
  getOnSaleProducts,
} = require("../controllers/productController");

router.post("/", createProduct);

router.get("/", getProducts);

router.get("/meta/categories", getCategories);
router.get("/meta/brands", getBrands);
router.get("/meta/price-range", getPriceRange);

// AI Search (must come before /:id)
router.get("/ai-search", aiSearch);
router.get("/featured", getFeaturedProducts);
router.get("/on-sale", getOnSaleProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;