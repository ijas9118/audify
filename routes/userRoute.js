const express = require("express");
const router = express.Router();
const userAuth = require('../middleware/userAuth')
const {
  sendOtp,
  loginUser,
  logoutUser,
  verifyAndSignUp,
  getShop,
  getProduct,
  getUserAccount,
  updateUserAccount,
  getAddresses,
  addAddress,
  updateDefaultAddress,
  getCart,
  addToCart,
  updateCart,
  deleteItemFromCart
} = require("../controller/userController");

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

router.post('/signup/resend-otp', sendOtp)

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

router.post("/logout", userAuth, logoutUser);

router.get("/shop", getShop);

router.get('/shop/cart', userAuth, getCart);

router.post('/shop/cart/updateQuantity', userAuth, updateCart);

router.get('/shop/cart/:id', userAuth, addToCart);

router.delete('/shop/cart/:id', userAuth, deleteItemFromCart);

router.get('/shop/:id', getProduct);

router.get('/account', userAuth, getUserAccount);

router.get('/account/addresses', userAuth, getAddresses);

router.post('/account/addresses', userAuth, addAddress);

router.post('/account/addresses/default', userAuth, updateDefaultAddress)

router.post('/account/:id', userAuth, updateUserAccount);

module.exports = router;
