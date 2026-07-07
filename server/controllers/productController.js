const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @desc    Get products - supports search, category, brand, price range, status, pagination
// @route   GET /api/products?search=&category=&brand=&minPrice=&maxPrice=&status=&featured=&page=&limit=&sort=
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    status,
    featured,
    stockStatus,
    page = 1,
    limit = 12,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (brand) filter.brand = { $regex: brand, $options: "i" };
  if (status) filter.status = status;
  if (featured) filter.featured = featured === "true";
  if (minPrice || maxPrice) {
    filter.sellingPrice = {};
    if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
    if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
  }
  if (stockStatus === "out_of_stock") filter.stock = { $lte: 0 };
  if (stockStatus === "low_stock") {
    filter.$expr = { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$lowStockThreshold"] }] };
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug").sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  Object.assign(product, req.body);
  const updated = await product.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

// @desc    Adjust stock (stock-in / stock-out) - Inventory module
// @route   PATCH /api/products/:id/stock
// @body    { type: "in" | "out", quantity: number, note?: string }
// @access  Private/Admin
const adjustStock = asyncHandler(async (req, res) => {
  const { type, quantity } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (!["in", "out"].includes(type) || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error("Provide a valid type ('in' or 'out') and a positive quantity");
  }

  if (type === "in") {
    product.stock += Number(quantity);
  } else {
    if (product.stock < quantity) {
      res.status(400);
      throw new Error("Cannot stock-out more than available stock");
    }
    product.stock -= Number(quantity);
  }

  await product.save();
  res.json({ success: true, data: product });
});

// @desc    Low stock / out of stock products for inventory alerts
// @route   GET /api/products/alerts/low-stock
// @access  Private/Admin
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  }).populate("category", "name");
  res.json({ success: true, count: products.length, data: products });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowStockAlerts,
};
