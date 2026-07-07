const express = require("express");
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../controllers/cartController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("customer"));

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeCartItem);

module.exports = router;
