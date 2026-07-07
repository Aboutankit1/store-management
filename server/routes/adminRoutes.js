const express = require("express");
const { getDashboardStats, getCustomers, toggleCustomerStatus } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/customers", getCustomers);
router.patch("/customers/:id/status", toggleCustomerStatus);

module.exports = router;
