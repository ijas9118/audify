document.addEventListener("DOMContentLoaded", () => {
  // Address selection functionality
  setupAddressSelection();

  // Payment method selection functionality
  setupPaymentMethodSelection();

  // Form submission functionality
  setupFormSubmission();

  setupCouponApplication();
});

// Function to handle address selection
function setupAddressSelection() {
  const addressCards = document.querySelectorAll(".address-card");
  const selectedAddressIdInput = document.getElementById("selectedAddressId");

  addressCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const currentlySelectedCard = document.querySelector(
        ".address-card.active-address"
      );

      if (card.classList.contains("active-address")) {
        deselectAddress(card, selectedAddressIdInput);
      } else {
        if (currentlySelectedCard) {
          deselectAddress(currentlySelectedCard, selectedAddressIdInput);
        }
        selectAddress(card, selectedAddressIdInput);
      }
    });
  });
}

// Function to handle address deselection
function deselectAddress(card, inputElement) {
  card.classList.remove("active-address");
  inputElement.value = ""; // Clear the hidden input
  clearAddressForm(); // Optionally clear form fields
}

// Function to handle address selection
async function selectAddress(card, inputElement) {
  card.classList.add("active-address");
  inputElement.value = card.dataset.id; // Set the hidden input with the selected address ID

  try {
    const addressData = await fetchAddressDetails(card.dataset.id);
    fillAddressForm(addressData);
  } catch (error) {
    console.error("Error fetching address details:", error);
  }
}

// Function to fetch address details from the server
async function fetchAddressDetails(addressId) {
  const response = await fetch(`/account/addresses/${addressId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

// Function to fill address form fields
function fillAddressForm(address) {
  document.getElementById("name").value = address.name || "";
  document.getElementById("mobile").value = address.mobile || "";
  document.getElementById("alternateMobile").value =
    address.alternateMobile || "";
  document.getElementById("location").value = address.location || "";
  document.getElementById("city").value = address.city || "";
  document.getElementById("state").value = address.state || "";
  document.getElementById("landmark").value = address.landmark || "";
  document.getElementById("zip").value = address.zip || "";
}

// Function to clear address form fields
function clearAddressForm() {
  document.getElementById("name").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("alternateMobile").value = "";
  document.getElementById("location").value = "";
  document.getElementById("city").value = "";
  document.getElementById("state").value = "";
  document.getElementById("landmark").value = "";
  document.getElementById("zip").value = "";
}

// Function to handle payment method selection
function setupPaymentMethodSelection() {
  const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  const paymentMethodInput = document.getElementById("paymentMethod");

  paymentMethods.forEach((method) => {
    method.addEventListener("change", () => {
      paymentMethodInput.value = method.value; // Update the hidden input with the selected payment method
    });
  });
}

// Function to handle form submission
function setupFormSubmission() {
  const form = document.getElementById("checkoutForm");
  const totalPrice = form.getAttribute("data-total-price");

  let Toast = Swal.mixin({
    toast: true,
    position: "top", // Adjust position as needed
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Convert FormData to a plain object

    const paymentMethod = data.paymentMethod;

    try {
      if (paymentMethod === "RazorPay") {
        const amount = totalPrice;
        const currency = "INR";
        const receiptId = "qwerty1";

        const response = await fetch("/checkout/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            currency,
            receipt: receiptId,
          }), // Convert the object to a JSON string
        });
        const order = await response.json();

        var options = {
          key: "rzp_test_QYQyRI9jHWn6Or", // Enter the Key ID generated from the Dashboard
          amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency,
          name: "Audify", //your business name
          description: "Test Transaction",
          image: "https://example.com/your_logo",
          order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
          handler: async function (response) {
            const razorpayPaymentId = response.razorpay_payment_id;
            const razorpayOrderId = response.razorpay_order_id;
            const razorpaySignature = response.razorpay_signature;

            try {
              const finalCheckoutResponse = await fetch("/checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              });
  
              const checkoutResult = await finalCheckoutResponse.json();
  
              if (finalCheckoutResponse.ok) {
                // Show success toast
                await Toast.fire({
                  icon: "success",
                  title: "Order placed successful!",
                });
                // Redirect to order success page
                window.location.href = `/checkout/order-success/${checkoutResult.orderId}`;
              } else {
                Toast.fire({
                  icon: "error",
                  title: checkoutResult.message || "An error occurred while finalizing the order",
                });
              }
            } catch (error) {
              console.error("Error during final checkout:", error);
              Toast.fire({
                icon: "error",
                title: "An unexpected error occurred while finalizing the order",
              });
            }
          },
          prefill: {
            //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
            name: data.name, //your customer's name
            contact: data.mobile, //Provide the customer's phone number for better conversion rates
          },
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#3399cc",
          },
        };
        var rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response) {
          alert(response.error.code);
          alert(response.error.description);
          alert(response.error.source);
          alert(response.error.step);
          alert(response.error.reason);
          alert(response.error.metadata.order_id);
          alert(response.error.metadata.payment_id);
        });

        rzp1.open();
      } else if (paymentMethod === "Cash On Delivery") {
        // If Cash on Delivery is selected, call standard checkout API
        let response = await fetch("/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json(); // Parse the JS`ON response
  
        if (response.ok) {
          await Toast.fire({
            icon: "success",
            title: "Order placed successfully!",
          });
          window.location.href = `/checkout/order-success/${result.orderId}`; // Change this URL as needed
        } else {
          Toast.fire({
            icon: "error",
            title: result.message || "An error occurred while placing the order",
          });
        }
      }

    } catch (error) {
      console.error("Error:", error);
      Toast.fire({
        icon: "error",
        title: `An unexpected error occurred ${error}`,
      });
    }
  });
}

// Function to handle coupon application
function setupCouponApplication() {
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponCodeInput = document.getElementById('couponCode');
  const grandTotalElement = document.getElementById('grandTotal');
  const checkoutForm = document.getElementById('checkoutForm');

  applyCouponBtn.addEventListener('click', async () => {
    const couponCode = couponCodeInput.value.trim();
    const totalPrice = parseFloat(checkoutForm.dataset.totalPrice); // Get the total price from the form data attribute

    if (!couponCode) {
      alert('Please enter a coupon code.');
      return;
    }

    try {
      // Make a POST request to apply the coupon
      const response = await fetch('/checkout/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalPrice, couponCode }),
      });

      const result = await response.json();

      if (response.ok) {
        const { newTotal } = result;
        alert(newTotal)

        // Update the grand total on the frontend
        grandTotalElement.textContent = `₹${newTotal.toFixed(2)}`;
        checkoutForm.dataset.totalPrice = newTotal.toFixed(2); // Update form's total price

        alert('Coupon applied successfully!');
      } else {
        alert(`Error applying coupon: ${result.message}`);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert(`An error occurred while applying the coupon. ${error}`);
    }
  });
}