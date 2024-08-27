const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  logoutAdmin,
  getUsers,
  getProduct,
  getOrders,
  getCategory,
  getCoupons,
  getOffers,
  getDeals,
  getAdminHome,
  getAdminLogin,
} = require("../controller/adminController");

// ============================
// Admin Home Route
// ============================
router.get("/", getAdminHome);

// ============================
// Admin Authentication Routes
// ============================

// Admin Login Route
router.get("/login",getAdminLogin);

router.post("/login", loginAdmin);

// Admin Logout Route
router.post("/logout", logoutAdmin);

// ============================
// User Management Routes
// ============================
router.get("/users", getUsers);

// ============================
// Product Management Route
// ============================
router.get("/products", getProduct);

// ============================
// Order Management Route
// ============================
router.get("/orders", getOrders);

// ============================
// Category Management Route
// ============================
router.get("/category", getCategory);

// ============================
// Coupon Management Route
// ============================
router.get("/coupon", getCoupons);

// ============================
// Offer Management Route
// ============================
router.get("/offer", getOffers);

// ============================
// Deal Management Route
// ============================
router.get("/deal", getDeals);

module.exports = router;
