function changeQuantity(productId, change) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  let newQuantity = parseInt(quantityInput.value) + change;

  // Ensure the quantity is valid
  if (newQuantity < 1) {
    newQuantity = 1;
  }

  updateQuantityInDatabase(productId, newQuantity);
}

function updateQuantityInDatabase(productId, newQuantity) {
  fetch("/shop/cart/updateQuantity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
      quantity: newQuantity,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse JSON response
    })
    .then((cart) => {
      // Update the UI with the new cart data
      updateCartUI(cart);
    })
    .catch((error) => {
      console.error("Error updating cart:", error);
    });
}

function updateCartUI(cart) {
  // Update quantities and subtotals for each item
  cart.items.forEach((item) => {
    const quantityInput = document.getElementById(`quantity-${item.productId}`);
    if (quantityInput) {
      quantityInput.value = item.quantity;
    }

    const subtotalElement = document.querySelector(
      `.cart-item[data-product-id="${item.productId}"] .subtotal #subtotal-${item.productId}`
    );
    if (subtotalElement) {
      subtotalElement.textContent = `₹${item.subtotal.toFixed(2)}`;
    }
  });

  // Update cart summary
  const subtotalSummaryElement = document.querySelector(
    ".cart-summary .d-flex.justify-content-between span:nth-of-type(2)"
  );
  if (subtotalSummaryElement) {
    subtotalSummaryElement.textContent = `₹${cart.items
      .reduce((acc, item) => acc + item.subtotal, 0)
      .toFixed(2)}`;
  }

  const shippingChargeElement = document.querySelector(
    ".cart-summary .d-flex.justify-content-between:nth-of-type(2) span:nth-of-type(2)"
  );
  if (shippingChargeElement) {
    shippingChargeElement.textContent = `₹${cart.shippingCharge.toFixed(2)}`;
  }

  const totalElement = document.querySelector(
    ".cart-summary .total span:nth-of-type(2)"
  );
  if (totalElement) {
    totalElement.textContent = `₹${cart.total.toFixed(2)}`;
  }
}
