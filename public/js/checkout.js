document.addEventListener("DOMContentLoaded", () => {
  // Address selection functionality
  setupAddressSelection();

  // Payment method selection functionality
  setupPaymentMethodSelection();

  // Form submission functionality
  setupFormSubmission();
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Convert FormData to a plain object

    console.log("Form Data:", data);

    try {
      const response = await fetch("/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Convert the object to a JSON string
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Server Response:", responseData);
    } catch (error) {
      console.error("Error:", error);
    }
  });
}
