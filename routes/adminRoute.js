const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../controller/adminController");
const User = require('../models/userModel')

router.get("/", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("admin/login");
  }
  res.render("layout", {
    title: "Audify",
    viewName: "admin/adminHome",
    activePage: "dashboard",
    isAdmin: true,
  });
});

router.get("/login", (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin");
  }
  res.render("admin/adminLogin", { title: "Admin Login" });
});
router.post("/login", loginAdmin);

router.get("/users", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  try {
    const users = await User.find(); // Fetch all users from the database
    res.render('layout', {
      title: 'User Management',
      viewName: 'admin/userManagement',
      activePage: 'users',
      isAdmin: true,
      users: users, // Pass users data to the view
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get("/products", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  res.render("layout", {
    title: "Product Management",
    viewName: "admin/productManagement",
    activePage: "products", 
    isAdmin: true,
  });
});

router.get("/orders", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  res.render("layout", {
    title: "Order Management",
    viewName: "admin/orderManagement",
    activePage: "orders", 
    isAdmin: true,
  });
});

router.get("/category", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  res.render("layout", {
    title: "Category Management",
    viewName: "admin/categoryManagement",
    activePage: "category", 
    isAdmin: true,
  });
});

router.get("/coupon", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  res.render("layout", {
    title: "Coupon Management",
    viewName: "admin/couponManagement",
    activePage: "coupon", 
    isAdmin: true,
  });
});

router.get("/offer", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  res.render("layout", {
    title: "Offer Management",
    viewName: "admin/offerManagement",
    activePage: "offer", 
    isAdmin: true,
  });
});

router.get("/deal", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  res.render("layout", {
    title: "Offer Management",
    viewName: "admin/dealManagement",
    activePage: "deal", 
    isAdmin: true,
  });
});

module.exports = router;
