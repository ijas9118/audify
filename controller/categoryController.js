const Category = require("../models/categories");
const asyncHandler = require("express-async-handler");

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

  res.redirect("/admin/category");
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
  res.redirect("/admin/category");
});
