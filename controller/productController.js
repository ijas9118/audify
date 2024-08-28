const Product = require("../models/products");
const Category = require('../models/categories')
const asyncHandler = require("express-async-handler");

// Render Product Management Page
exports.getProduct = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.render("layout", {
    title: "Product Management",
    viewName: "admin/productManagement",
    activePage: "products",
    isAdmin: true,
    categories
  });
});

// Add new product
exports.addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId } = req.body;
  console.log(req.body);
  
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