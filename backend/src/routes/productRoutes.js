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
  getProductStats,
} = require("../controllers/productController");

router.post("/", createProduct);
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 */
router.get("/", getProducts);

router.get("/meta/categories", getCategories);
router.get("/meta/brands", getBrands);
router.get("/meta/price-range", getPriceRange);

// AI Search (must come before /:id)
router.get("/ai-search", aiSearch);
router.get("/featured", getFeaturedProducts);
router.get("/on-sale", getOnSaleProducts);
router.get("/stats", getProductStats);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;