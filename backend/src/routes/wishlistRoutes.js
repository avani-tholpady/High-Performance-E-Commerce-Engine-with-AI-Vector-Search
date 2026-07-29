const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require("../controllers/wishlistController");

// Require JWT authorization for all wishlist operations
router.use(protect);

router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);

module.exports = router;
