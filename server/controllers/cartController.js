const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get current user's cart (with computed totals)
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name image sellingPrice stock unit status"
  );

  if (!cart) {
    return res.json({ success: true, data: { items: [], itemsTotal: 0 } });
  }

  const itemsTotal = cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
  res.json({ success: true, data: { ...cart.toObject(), itemsTotal } });
});

// @desc    Add product to cart (or increase quantity if already present)
// @route   POST /api/cart
// @body    { productId, quantity }
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((i) => i.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity, priceAtAdd: product.sellingPrice });
  }

  await cart.save();
  res.status(201).json({ success: true, data: cart });
});

// @desc    Update quantity of a cart item (increase/decrease)
// @route   PUT /api/cart/:productId
// @body    { quantity }
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }
  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, data: cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, data: cart });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.couponCode = null;
  await cart.save();
  res.json({ success: true, data: cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
