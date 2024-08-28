const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const {
  loginAdmin,
  logoutAdmin,
  getUsers,
  getOrders,
  getCoupons,
  getOffers,
  getDeals,
  getAdminHome,
  getAdminLogin,
} = require("../controller/adminController");
const categoryRouter = require("./categoryRouter");
const productRouter = require('./productRouter')

// Admin Home Route
router.get("/", adminAuth, getAdminHome);

// Admin Authentication Routes
// Admin Login Route
router.route("/login").get(getAdminLogin).post(loginAdmin);
// Admin Logout Route
router.post("/logout", adminAuth, logoutAdmin);

// User Management Routes
router.get("/users", adminAuth, getUsers);

// Product Management Route
router.use("/products", productRouter);

// Order Management Route
router.get("/orders", adminAuth, getOrders);

// Category Management Route
router.use("/category", categoryRouter);

// Coupon Management Route
router.get("/coupon", adminAuth, getCoupons);

// Offer Management Route
router.get("/offer", adminAuth, getOffers);

// Deal Management Route
router.get("/deal", adminAuth, getDeals);

module.exports = router;
