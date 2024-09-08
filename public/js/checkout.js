document.addEventListener("DOMContentLoaded", () => {
  // Set default address ID in the hidden input field
  const defaultAddressCard = document.querySelector(".address-card.active-address");
  if (defaultAddressCard) {
    const defaultAddressId = defaultAddressCard.getAttribute("data-id");
    document.getElementById("selectedAddressId").value = defaultAddressId;
  }

  // Set default payment method in the hidden input field
  const highlightedPaymentCard = document.querySelector(".payment-card.highlighted");
  if (highlightedPaymentCard) {
    const selectedPaymentMethod = highlightedPaymentCard.getAttribute("data-method");
    document.getElementById("paymentMethod").value = selectedPaymentMethod;
  }

  // Add click event listeners to payment cards
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-card").forEach((c) => c.classList.remove("highlighted"));
      card.classList.add("highlighted");
      const selectedPaymentMethod = card.getAttribute("data-method");
      document.getElementById("paymentMethod").value = selectedPaymentMethod;
    });
  });

  const addressCards = document.querySelectorAll(".address-card");
  addressCards.forEach((card) => {
    card.addEventListener("click", () => {
      addressCards.forEach((card) => card.classList.remove("active-address"));
      card.classList.add("active-address");
      const addressId = card.getAttribute("data-id");
      document.getElementById("selectedAddressId").value = addressId;
    });
  });

  // Apply coupon button event handler
  document.getElementById("applyCoupon").addEventListener("click", () => {
    alert("Coupon Applied: " + document.getElementById("couponCode").value);
  });
});
