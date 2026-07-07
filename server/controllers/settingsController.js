const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");

// @desc    Get store settings (public - storefront needs delivery charge etc.)
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json({ success: true, data: settings });
});

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  Object.assign(settings, req.body);
  const updated = await settings.save();
  res.json({ success: true, data: updated });
});

module.exports = { getSettings, updateSettings };
