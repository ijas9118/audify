const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const {
  getCheckoutPage,
  orderSuccessPage,
} = require("../controller/userController");

router.get("/", userAuth, getCheckoutPage);

router.post("/", userAuth, orderSuccessPage);

module.exports = router;
