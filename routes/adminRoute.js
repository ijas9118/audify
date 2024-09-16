const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const Category = require('../models/categories')
const Product = require('../models/products')
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
  toggleUserStatus,
  updateOrderStatus,
  viewOrder,
  addOffer,
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

// User status toggle
router.post("/users/toggle-status/:id", adminAuth, toggleUserStatus);

// Product Management Route
router.use("/products", productRouter);

// Order Management Route
router.get("/orders", adminAuth, getOrders);

router.post('/orders/update-status/:id', adminAuth, updateOrderStatus);

router.get('/orders/view/:id', adminAuth, viewOrder)

// Category Management Route
router.use("/category", categoryRouter);

// Coupon Management Route
router.get("/coupon", adminAuth, getCoupons);

// Offer Management Route
router.get("/offer", adminAuth, getOffers);
router.post('/offer', adminAuth, addOffer);
router.get('/offer/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});
router.get('/offer/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Deal Management Route
router.get("/deal", adminAuth, getDeals);

module.exports = router;
