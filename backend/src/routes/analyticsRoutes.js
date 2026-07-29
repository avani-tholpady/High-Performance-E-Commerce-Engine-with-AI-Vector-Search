const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getSearchAnalytics } = require("../controllers/analyticsController");

/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Retrieve aggregate statistics of product search terms
 *     description: Returns top searches, counts, average response times, and results counts.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search analytics details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Lowercase keyword
 *                       keyword:
 *                         type: string
 *                         description: Raw original keyword
 *                       searchCount:
 *                         type: integer
 *                       avgResponseTimeMs:
 *                         type: number
 *                       avgResultCount:
 *                         type: number
 *                       lastSearchedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */

// GET /api/analytics/search (Protected endpoint)
router.get("/search", protect, getSearchAnalytics);

module.exports = router;
