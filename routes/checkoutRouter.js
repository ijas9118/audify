const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const {
  getCheckoutPage,
  handleOrderSubmission,
  orderSuccessPage,
  razorPay,
  applyCoupon,
  removeCoupon,
} = require("../controller/checkoutController");

router.get("/", userAuth, getCheckoutPage);

router.post("/", userAuth, handleOrderSubmission);

router.post('/apply-coupons', userAuth, applyCoupon)

router.get('/remove-coupon/:cartId', userAuth, removeCoupon)

router.post('/order', razorPay);

router.get("/order-success/:orderId", userAuth, orderSuccessPage);

module.exports = router;
