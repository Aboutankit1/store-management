const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

// @desc    Dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalCustomers,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
    revenueAgg,
  ] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "delivered" }),
    Product.countDocuments({ $expr: { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$lowStockThreshold"] }] } }),
    Product.countDocuments({ stock: { $lte: 0 } }),
    Order.find().sort({ createdAt: -1 }).limit(8).populate("customer", "name email"),
    Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  // Monthly sales graph - last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlySales = await Order.aggregate([
    { $match: { status: "delivered", createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$grandTotal" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      monthlySales,
    },
  });
});

// @desc    Get all customers (admin)
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { role: "customer" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, count: customers.length, total, data: customers });
});

// @desc    Activate / deactivate a customer account
// @route   PATCH /api/admin/customers/:id/status
// @access  Private/Admin
const toggleCustomerStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "customer") {
    res.status(404);
    throw new Error("Customer not found");
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: { _id: user._id, isActive: user.isActive } });
});

module.exports = { getDashboardStats, getCustomers, toggleCustomerStatus };
