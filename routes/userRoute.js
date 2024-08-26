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

router.post("/logout", logoutUser);

module.exports = router;
