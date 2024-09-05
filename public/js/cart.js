function changeQuantity(productId, change) {
  var quantityInput = document.getElementById("quantity-" + productId);

  if (quantityInput) {
    var currentQuantity = parseInt(quantityInput.value, 10);
    var newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      newQuantity = 1;
    }
    quantityInput.value = newQuantity;

    updateQuantityInDatabase(productId, newQuantity);
  }
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
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
