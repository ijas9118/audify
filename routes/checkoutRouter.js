const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const {
  getCheckoutPage,
  handleOrderSubmission,
  orderSuccessPage,
  razorPay,
  applyCoupon,
} = require("../controller/checkoutController");

router.get("/", userAuth, getCheckoutPage);

router.post("/", userAuth, handleOrderSubmission);

router.post('/apply-coupon', userAuth, applyCoupon);

router.post('/order', razorPay);


router.get("/order-success/:orderId", userAuth, orderSuccessPage);

module.exports = router;
