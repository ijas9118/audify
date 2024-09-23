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
        console.log(totalPrice)
        const amount = totalPrice;
        const currency = "INR";
        const receiptId = "qwerty1";

        const response = await fetch("/checkout/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount * 100,
            currency,
            receipt: receiptId,
          }), // Convert the object to a JSON string
        });
        const order = await response.json();

        var options = {
          key: "rzp_test_QYQyRI9jHWn6Or", // Enter the Key ID generated from the Dashboard
          amount,
          currency,
          name: "Audify", //your business name
          description: "Test Transaction",
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
                  title:
                    checkoutResult.message ||
                    "An error occurred while finalizing the order",
                });
              }
            } catch (error) {
              console.error("Error during final checkout:", error);
              Toast.fire({
                icon: "error",
                title:
                  "An unexpected error occurred while finalizing the order",
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
            title:
              result.message || "An error occurred while placing the order",
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


<div class="container my-5">
      <h4 class="mb-4">Payment Method</h4>
      <div class="row">
        <div class="col-12">
          <!-- Payment Method 2 -->
          <div class="mb-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="paymentMethod"
                id="razorpay"
                value="RazorPay"
              />
              <label
                class="form-check-label d-flex align-items-center"
                for="razorpay"
              >
                <i
                  class="fas fa-mobile-alt fa-2x ms-3 me-3"
                  style="color: #7a479b"
                ></i>
                Online Payment (RazorPay)
              </label>
            </div>
          </div>

          <!-- Payment Method 3 -->
          <div class="mb-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="paymentMethod"
                id="wallet"
                value="Wallet"
              />
              <label
                class="form-check-label d-flex align-items-center"
                for="wallet"
              >
                <i
                  class="fas fa-wallet fa-2x ms-3 me-3"
                  style="color: #7a479b"
                ></i>
                Wallet
              </label>
            </div>
          </div>

          <!-- Payment Method 4 -->
          <div class="mb-3">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="paymentMethod"
                id="cashOnDelivery"
                value="Cash On Delivery"
              />
              <label
                class="form-check-label d-flex align-items-center"
                for="cashOnDelivery"
              >
                <i
                  class="fa-solid fa-money-bill-1 fa-2x ms-3 me-3"
                  style="color: #7a479b"
                ></i>
                Cash On Delivery
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Input for Payment Method -->
    <input type="hidden" name="paymentMethod" id="paymentMethod" />