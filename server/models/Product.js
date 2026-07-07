const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    barcode: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    images: [{ type: String }],
    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, default: "pc" }, // e.g. kg, ltr, pc, pack
    lowStockThreshold: { type: Number, default: 10 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.virtual("stockStatus").get(function () {
  if (this.stock <= 0) return "out_of_stock";
  if (this.stock <= this.lowStockThreshold) return "low_stock";
  return "in_stock";
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ name: "text", brand: "text", sku: "text" });

module.exports = mongoose.model("Product", productSchema);
