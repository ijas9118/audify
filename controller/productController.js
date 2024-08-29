const Product = require("../models/products");
const Category = require("../models/categories");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");

// Render Product Management Page
exports.getProducts = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  const products = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "categoryId", 
        foreignField: "_id", 
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails", 
    },
  ]);

  res.render("layout", {
    title: "Product Management",
    viewName: "admin/productManagement",
    activePage: "products",
    isAdmin: true,
    products,
    categories,
  });
});

// Add new product
exports.addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId } = req.body;

  const mainImageFile = req.files['mainImage'] ? req.files['mainImage'][0] : null;
  const supportImageFiles = req.files['supportImages'] ? req.files['supportImages'] : [];

  if (!mainImageFile || supportImageFiles.length !== 2) {
    return res.status(400).json({ message: "Please provide exactly one main image and two support images." });
  }

  const uploadPromises = [
    // Upload main image
    new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "products", resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        )
        .end(mainImageFile.buffer);
    }),

    // Upload support images
    ...supportImageFiles.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "products", resource_type: "image" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          )
          .end(file.buffer);
      });
    })
  ];

  const imageUrls = await Promise.all(uploadPromises);
  
  const [mainImageUrl, ...supportImageUrls] = imageUrls;

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
    images: {
      main: mainImageUrl,
      supports: supportImageUrls
    },
  });

  // Save the product to the database
  const createdProduct = await product.save();

  // Respond with the created product
  res.redirect("/admin/products");
});


// Unlist Product
exports.toggleProductStatus = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // Find the product by ID
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Toggle the isActive field
  product.isActive = !product.isActive;

  // Save the updated product
  await product.save();

  // Redirect back to the product management page
  res.redirect("/admin/products");
});