const applyCoupon = (price, coupon) => {
  // Check if the coupon is valid and active
  if (!coupon) return price - 5;

  const now = new Date();

  // Check if coupon is within valid date range and active
  if (now < coupon.validFrom || now > coupon.validUntil || !coupon.isActive) {
    return price; // Return original price if the coupon is expired or inactive
  }

  let discountAmount = 0;

  // Apply discount based on the discount type (percentage or fixed)
  if (coupon.discountType === "percentage") {
    discountAmount = (price * coupon.discountValue) / 100;
  } else if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  }

  // Apply the maximum discount value if applicable
  if (coupon.maxDiscountValue && discountAmount > coupon.maxDiscountValue) {
    discountAmount = coupon.maxDiscountValue;
  }

  console.log(`Discount Applied: ${discountAmount}`);

  // Return the new price after applying the discount
  return price - discountAmount;
};

module.exports = {
  applyCoupon,
};
