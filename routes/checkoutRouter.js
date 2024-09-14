const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const {
  getCheckoutPage,
  handleOrderSubmission,
  orderSuccessPage,
} = require("../controller/checkoutController");

router.get("/", userAuth, getCheckoutPage);

router.post("/", userAuth, handleOrderSubmission);

router.get("/order-success/:orderId", userAuth, orderSuccessPage);

module.exports = router;
