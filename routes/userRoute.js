const express = require("express");
const router = express.Router();
const {
  sendOtp,
  loginUser,
  logoutUser,
  verifyAndSignUp,
  getShop,
  getProduct
} = require("../controller/userController");
const {  } = require("../controller/productController");

router.get("/", (req, res) => {
  res.render("layout", {
    title: "Audify",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/home",
    activePage: "home",
    isAdmin: false,
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
    activePage: "home",
    isAdmin: false,
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
    activePage: "home",
    isAdmin: false,
  });
});
router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/shop", getShop);

router.get('/shop/:id', getProduct);

module.exports = router;
