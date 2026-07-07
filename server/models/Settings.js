const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "FreshMart General Store" },
    logo: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    deliveryCharge: { type: Number, default: 40 },
    freeDeliveryThreshold: { type: Number, default: 499 },
    minimumOrderAmount: { type: Number, default: 0 },
    businessHours: { type: String, default: "9:00 AM - 10:00 PM" },
  },
  { timestamps: true }
);

// Ensures there is only ever one settings document
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
