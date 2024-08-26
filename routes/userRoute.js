const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const { createUser, loginUser, logoutUser } = require("../controller/userController");

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render("layout", {
    title: "Audify",
    header: req.session.user ? 'partials/login_header' : 'partials/header',
    viewName: "users/home"
  }); 
});
router.get("/signup", (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render("layout", {
    title: "Sign Up",
    header: 'partials/header',
    viewName: "users/signup",
  });
});
router.post("/signup", createUser);

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render("layout", {
    title: "Login",
    header: 'partials/header',
    viewName: "users/login",
  });
});
router.post("/login", loginUser);

router.get("/verify-otp", (req, res) => {
  if (!req.session.otpRequired) {
    return res.redirect('/');
  }
  res.render("layout", {
    title: "Verify OTP",
    header: 'partials/header',
    viewName: "users/verify_otp",
  });
});
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  // console.log(Date.now(), user.otpExpires);
  console.log(1234567);
  
  if (user && user.otp === otp && user.otpExpires > Date.now()) {
    req.session.user = user._id;
    
    user.otp = undefined; // Clear OTP
    user.otpExpires = undefined; // Clear OTP expiration
    await user.save();
    req.session.otpRequired = false; // Reset OTP requirement
    return res.redirect('/');
  } else {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
});

router.post("/logout", logoutUser);

module.exports = router;
