// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

const slugify = (text) =>
  text.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const categoriesData = [
  { name: "Fruits & Vegetables", image: "" },
  { name: "Dairy & Bakery", image: "" },
  { name: "Snacks", image: "" },
  { name: "Beverages", image: "" },
  { name: "Household", image: "" },
];

const productsData = [
  { name: "Fresh Bananas", brand: "Farm Fresh", price: 49, mrp: 60, stock: 120, unit: "dozen", category: "Fruits & Vegetables" },
  { name: "Red Apples (1kg)", brand: "Farm Fresh", price: 159, mrp: 180, stock: 80, unit: "kg", category: "Fruits & Vegetables" },
  { name: "Toned Milk (1L)", brand: "Amul", price: 58, mrp: 60, stock: 200, unit: "ltr", category: "Dairy & Bakery" },
  { name: "Brown Bread", brand: "Britannia", price: 45, mrp: 50, stock: 60, unit: "pack", category: "Dairy & Bakery" },
  { name: "Potato Chips", brand: "Lays", price: 20, mrp: 20, stock: 5, unit: "pack", category: "Snacks" },
  { name: "Chocolate Cookies", brand: "Oreo", price: 30, mrp: 35, stock: 0, unit: "pack", category: "Snacks" },
  { name: "Cola (750ml)", brand: "Coca-Cola", price: 40, mrp: 45, stock: 150, unit: "pc", category: "Beverages" },
  { name: "Orange Juice (1L)", brand: "Real", price: 110, mrp: 120, stock: 70, unit: "ltr", category: "Beverages" },
  { name: "Dishwash Liquid", brand: "Vim", price: 99, mrp: 110, stock: 40, unit: "pc", category: "Household" },
  { name: "Toilet Cleaner", brand: "Harpic", price: 85, mrp: 95, stock: 8, unit: "pc", category: "Household" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@store.com";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: "Store Admin",
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role: "admin",
      });
      console.log(`Admin created: ${adminEmail}`);
    } else {
      console.log("Admin already exists, skipping");
    }

    // Sample customer
    const customerExists = await User.findOne({ email: "customer@store.com" });
    if (!customerExists) {
      await User.create({
        name: "Test Customer",
        email: "customer@store.com",
        password: "Customer@123",
        role: "customer",
        phone: "9999999999",
        addresses: [
          {
            label: "Home",
            line1: "123 MG Road",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
            isDefault: true,
          },
        ],
      });
      console.log("Sample customer created: customer@store.com");
    }

    // Categories
    const categoryMap = {};
    for (const cat of categoriesData) {
      let category = await Category.findOne({ name: cat.name });
      if (!category) {
        category = await Category.create({ name: cat.name, slug: slugify(cat.name), image: cat.image });
      }
      categoryMap[cat.name] = category._id;
    }
    console.log(`Categories ready: ${categoriesData.length}`);

    // Products
    let created = 0;
    for (const p of productsData) {
      const sku = `SKU-${slugify(p.name).toUpperCase().slice(0, 10)}`;
      const exists = await Product.findOne({ sku });
      if (!exists) {
        await Product.create({
          name: p.name,
          sku,
          brand: p.brand,
          category: categoryMap[p.category],
          mrp: p.mrp,
          sellingPrice: p.price,
          discountPercent: Math.round(((p.mrp - p.price) / p.mrp) * 100),
          stock: p.stock,
          unit: p.unit,
          lowStockThreshold: 10,
          status: "active",
          featured: Math.random() > 0.6,
          description: `${p.name} by ${p.brand}. Sourced fresh for daily grocery needs.`,
        });
        created++;
      }
    }
    console.log(`Products created: ${created}`);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
