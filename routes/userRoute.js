const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const {
  sendOtp,
  loginUser,
  logoutUser,
  verifyAndSignUp,
} = require("../controller/userController");

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("layout", {
    title: "Audify",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/home",
    activePage: "home"
  });
});

router.get("/signup", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("layout", {
    title: "Sign Up",
    header: "partials/header",
    viewName: "users/signup",
    activePage: "home"
  });
});
router.post("/signup", sendOtp);
router.post("/verify-otp", verifyAndSignUp);

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("layout", {
    title: "Login",
    header: "partials/header",
    viewName: "users/login",
    activePage: "home"
  });
});
router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/shop", (req, res) => {
  res.render("layout", {
    title: "Audify",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/shop",
    activePage: "shop",
  });
});

module.exports = router;
