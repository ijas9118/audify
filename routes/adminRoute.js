const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
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
  addCategory,
} = require("../controller/adminController");

// ============================
// Admin Home Route
// ============================
router.get("/", adminAuth, getAdminHome);

// ============================
// Admin Authentication Routes
// ============================

// Admin Login Route
router.route("/login").get(getAdminLogin).post(loginAdmin);

// Admin Logout Route
router.post("/logout", logoutAdmin);

// ============================
// User Management Routes
// ============================
router.get("/users", adminAuth, getUsers);

// ============================
// Product Management Route
// ============================
router.get("/products", adminAuth, getProduct);

// ============================
// Order Management Route
// ============================
router.get("/orders", adminAuth, getOrders);

// ============================
// Category Management Route
// ============================
router.route("/category").get(adminAuth, getCategory).post(addCategory);

// ============================
// Coupon Management Route
// ============================
router.get("/coupon", adminAuth, getCoupons);

// ============================
// Offer Management Route
// ============================
router.get("/offer", adminAuth, getOffers);

// ============================
// Deal Management Route
// ============================
router.get("/deal", adminAuth, getDeals);

module.exports = router;
