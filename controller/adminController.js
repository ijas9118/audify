const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/products");
const Category = require("../models/categories");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");

// ============================
//  Admin Authentication Controllers
// ============================

// Render Admin Login Page
exports.getAdminLogin = asyncHandler(async (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin");
  }
  res.render("admin/adminLogin", { title: "Admin Login" });
});

// Handle Admin Login
exports.loginAdmin = asyncHandler(async (req, res) => {
  const { user, password } = req.body;
  const findAdmin = await Admin.findOne({ user });

  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    req.session.admin = findAdmin._id;
    console.log("Admin logged in");

    res.redirect("/admin");
  } else {
    throw new Error("Invalid Credentials");
  }
});

// Render Admin Home Page (Dashboard)
exports.getAdminHome = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Audify",
    viewName: "admin/adminHome",
    activePage: "dashboard",
    isAdmin: true,
  });
});

// Handle Admin Logout
exports.logoutAdmin = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.redirect("/admin/login");
  });
});

// ============================
//  User Management Controllers
// ============================

// Render User Management Page
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  if (!users) {
    throw new Error("Failed to fetch users");
  }

  res.render("layout", {
    title: "User Management",
    viewName: "admin/userManagement",
    activePage: "users",
    isAdmin: true,
    users: users,
  });
});

// ============================
//  Product Management Controllers
// ============================

// Render Product Management Page
exports.getProduct = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Product Management",
    viewName: "admin/productManagement",
    activePage: "products",
    isAdmin: true,
  });
});

// Add new product
exports.addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId } = req.body;

  // Check if all required fields are provided
  if (!name || !price || !categoryId) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  // Check if a product with the same name already exists
  const existingProduct = await Product.findOne({ name });
  if (existingProduct) {
    return res
      .status(400)
      .json({ message: "Product with this name already exists" });
  }

  // Create a new product document
  const product = new Product({
    name,
    description,
    price,
    categoryId,
  });

  // Save the product to the database
  const createdProduct = await product.save();

  // Respond with the created product
  res.status(201).json(createdProduct);
});

// ============================
//  Order Management Controllers
// ============================

// Render Order Management Page
exports.getOrders = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Order Management",
    viewName: "admin/orderManagement",
    activePage: "orders",
    isAdmin: true,
  });
});

// ============================
//  Category Management Controllers
// ============================

// Render Category Management Page
exports.getCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    throw new Error("Failed to fetch users");
  }

  res.render("layout", {
    title: "Category Management",
    viewName: "admin/categoryManagement",
    activePage: "category",
    isAdmin: true,
    categories: categories,
  });
});

// Controller to add a new category
exports.addCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validate input
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // Create new category
  const newCategory = new Category({ name, description });
  await newCategory.save();

  res.redirect('/admin/category');
});

// Unlist Category
exports.toggleCategoryStatus = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  // Find the category by ID
  const category = await Category.findById(categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Toggle the isActive field
  category.isActive = !category.isActive;

  // Save the updated category
  await category.save();

  // Redirect back to the category management page
  res.redirect("/admin/category");
});

// Controller to delete a category
exports.deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  // Find and delete the category by ID
  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Redirect back to the category management page
  res.redirect('/admin/category');
});

// ============================
//  Coupon Management Controllers
// ============================

// Render Coupon Management Page
exports.getCoupons = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Coupon Management",
    viewName: "admin/couponManagement",
    activePage: "coupon",
    isAdmin: true,
  });
});

// ============================
//  Offer Management Controllers
// ============================

// Render Offer Management Page
exports.getOffers = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Offer Management",
    viewName: "admin/offerManagement",
    activePage: "offer",
    isAdmin: true,
  });
});

// ============================
//  Deals Management Controllers
// ============================

// Render Deals Management Page
exports.getDeals = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Offer Management",
    viewName: "admin/dealManagement",
    activePage: "deal",
    isAdmin: true,
  });
});
