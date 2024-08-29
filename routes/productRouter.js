const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/multer");
const {
  getProduct,
  addProduct,
  toggleProductStatus,
} = require("../controller/productController");

// Product Management Route
router.get("/", adminAuth, getProduct);
// Add new product
router.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "supportImages", maxCount: 2 },
  ]),
  addProduct
);

router.post("/toggle-status/:id", adminAuth, toggleProductStatus);

module.exports = router;
