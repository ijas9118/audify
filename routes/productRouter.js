const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const { getProduct, addProduct } = require("../controller/productController");

// Product Management Route
router.get("/", adminAuth, getProduct);
// Add new product
router.post("/add", addProduct);

module.exports = router;
