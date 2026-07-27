const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createVariant,
  updateVariant,
  deleteVariant,
  getVariantById,
  getVariantsByProduct,
  getAllVariants,
  searchVariants,
  increaseStock,
  decreaseStock
} = require("../controllers/variantController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Variant:
 *       type: object
 *       required:
 *         - productId
 *         - sku
 *         - price
 *         - stockQuantity
 *       properties:
 *         id:
 *           type: string
 *           description: Unique database ID of the variant
 *         productId:
 *           type: string
 *           description: Parent product ID
 *         sku:
 *           type: string
 *           description: Unique SKU for the variant
 *         size:
 *           type: string
 *           description: Size attribute (e.g. M, L, XL)
 *         color:
 *           type: string
 *           description: Color attribute (e.g. Red, Blue, Black)
 *         material:
 *           type: string
 *           description: Material composition (e.g. Cotton, Polyester)
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         stockQuantity:
 *           type: integer
 *           description: Available stock
 *         lowStockThreshold:
 *           type: integer
 *           description: Threshold for generating low stock alerts
 *         price:
 *           type: number
 *           description: Regular price
 *         salePrice:
 *           type: number
 *           description: Promotional sale price
 *         barcode:
 *           type: string
 *         weight:
 *           type: number
 *         dimensions:
 *           type: object
 *           properties:
 *             length:
 *               type: number
 *             width:
 *               type: number
 *             height:
 *               type: number
 *         isActive:
 *           type: boolean
 *           default: true
 */

/**
 * @swagger
 * /variants:
 *   post:
 *     summary: Create a new product variant
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Variant'
 *     responses:
 *       201:
 *         description: Variant created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate SKU
 *   get:
 *     summary: Retrieve all active variants
 *     tags: [Variants]
 *     responses:
 *       200:
 *         description: List of variants
 */

/**
 * @swagger
 * /variants/search:
 *   get:
 *     summary: Search product variants by attributes
 *     tags: [Variants]
 *     parameters:
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *       - in: query
 *         name: barcode
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */

/**
 * @swagger
 * /variants/product/{productId}:
 *   get:
 *     summary: Get variants for a specific product
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of product variants
 */

/**
 * @swagger
 * /variants/{id}:
 *   get:
 *     summary: Get variant by ID
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant details
 *       404:
 *         description: Variant not found
 *   put:
 *     summary: Update an existing variant
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Variant'
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Variant not found
 *   delete:
 *     summary: Soft delete a variant (deactivate)
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant deactivated
 *       404:
 *         description: Variant not found
 */

/**
 * @swagger
 * /variants/{id}/stock/increase:
 *   post:
 *     summary: Increase stock quantity for a variant
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Stock increased
 *       400:
 *         description: Invalid quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Variant not found
 */

/**
 * @swagger
 * /variants/{id}/stock/decrease:
 *   post:
 *     summary: Decrease stock quantity for a variant
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Stock decreased
 *       400:
 *         description: Out of stock/insufficient inventory
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Variant not found
 */

// Public Read Endpoints
router.get("/search", searchVariants);
router.get("/product/:productId", getVariantsByProduct);
router.get("/", getAllVariants);
router.get("/:id", getVariantById);

// Protected Mutation Endpoints (Requires valid Authorization token)
router.post("/", protect, createVariant);
router.put("/:id", protect, updateVariant);
router.delete("/:id", protect, deleteVariant);
router.post("/:id/stock/increase", protect, increaseStock);
router.post("/:id/stock/decrease", protect, decreaseStock);

module.exports = router;
