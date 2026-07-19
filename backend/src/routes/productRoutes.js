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
  getRelatedProducts
} = require("../controllers/productController");
router.post("/", createProduct);

router.get("/", getProducts);

router.get("/meta/categories", getCategories);
router.get("/meta/brands", getBrands);
router.get("/meta/price-range", getPriceRange);

router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);
router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;