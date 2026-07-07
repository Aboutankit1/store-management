const express = require("express");
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("customer"), placeOrder);
router.get("/my", protect, authorize("customer"), getMyOrders);

router.get("/", protect, authorize("admin"), getAllOrders);
router.patch("/:id/status", protect, authorize("admin"), updateOrderStatus);

router.get("/:id", protect, getOrderById); // owner or admin check happens inside controller

module.exports = router;
