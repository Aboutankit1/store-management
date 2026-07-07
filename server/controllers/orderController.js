const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const DELIVERY_CHARGE = 40;
const FREE_DELIVERY_THRESHOLD = 499;

const generateOrderNumber = () => {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${stamp}-${random}`;
};

// @desc    Place an order from the current cart
// @route   POST /api/orders
// @body    { shippingAddress, paymentMethod }
// @access  Private/Customer
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "cod" } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Validate stock and build order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.status !== "active") {
      res.status(400);
      throw new Error(`Product ${product ? product.name : ""} is no longer available`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: item.priceAtAdd,
      quantity: item.quantity,
    });
  }

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const discount = 0; // Coupon logic can be layered in here
  const grandTotal = itemsTotal + deliveryCharge - discount;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsTotal,
    deliveryCharge,
    discount,
    grandTotal,
    paymentMethod,
    status: "pending",
    statusHistory: [{ status: "pending", note: "Order placed" }],
  });

  // Decrement stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
  }

  // Clear the cart
  cart.items = [];
  cart.couponCode = null;
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// @desc    Get logged-in customer's order history
// @route   GET /api/orders/my
// @access  Private/Customer
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Get single order (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("customer", "name email phone");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (req.user.role !== "admin" && order.customer._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json({ success: true, data: order });
});

// @desc    Get all orders (admin) - supports ?status=&search=&page=&limit=
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.orderNumber = { $regex: search, $options: "i" };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: orders,
  });
});

// Valid forward transitions an admin can apply
const ALLOWED_TRANSITIONS = {
  pending: ["accepted", "rejected"],
  accepted: ["packing", "cancelled"],
  packing: ["dispatched", "cancelled"],
  dispatched: ["delivered"],
  delivered: [],
  rejected: [],
  cancelled: [],
};

// @desc    Update order status (accept/reject/pack/dispatch/deliver/cancel)
// @route   PATCH /api/orders/:id/status
// @body    { status, note }
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const allowedNext = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(status)) {
    res.status(400);
    throw new Error(`Cannot move order from '${order.status}' to '${status}'`);
  }

  // Restock if the order is rejected or cancelled
  if (["rejected", "cancelled"].includes(status)) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  order.status = status;
  order.statusHistory.push({ status, note });
  if (status === "delivered") order.paymentStatus = "paid";
  await order.save();

  res.json({ success: true, data: order });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
