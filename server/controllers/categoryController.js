const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// @desc    Get all categories (supports ?search=)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: "i" };
  }
  if (req.query.activeOnly === "true") {
    filter.isActive = true;
  }
  const categories = await Category.find(filter).sort({ name: 1 });
  res.json({ success: true, count: categories.length, data: categories });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, data: category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, image, isActive } = req.body;
  const category = await Category.create({ name, slug: slugify(name), image, isActive });
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  const { name, image, isActive } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  const updated = await category.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await category.deleteOne();
  res.json({ success: true, message: "Category deleted" });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
