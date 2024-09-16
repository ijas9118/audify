document.addEventListener("DOMContentLoaded", function() {
  const offerTypeSelect = document.getElementById("offerType");
  const productCategorySection = document.getElementById("productCategorySection");
  const referralSection = document.getElementById("referralSection");
  const productOrCategorySelect = document.getElementById("productOrCategory");

  // Fetch products or categories based on offerType
  function fetchOptions(offerType) {
    const url = offerType === 'product' ? '/admin/offer/products' : offerType === 'category' ? '/admin/offer/categories' : null;
    
    if (url) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const options = data.map(item => `<option value="${item._id}">${item.name}</option>`).join('');
          productOrCategorySelect.innerHTML = `<option value="" selected>Select ${offerType.charAt(0).toUpperCase() + offerType.slice(1)}</option>${options}`;
        })
        .catch(error => {
          console.error('Error fetching options:', error);
          productOrCategorySelect.innerHTML = '<option value="" selected>Error loading options</option>';
        });
    } else {
      productOrCategorySelect.innerHTML = '<option value="" selected>Select Product or Category</option>';
    }
  }

  offerTypeSelect.addEventListener("change", function() {
    const offerType = offerTypeSelect.value;
    
    // Show or hide referral section based on offer type
    if (offerType === "referral") {
      referralSection.classList.remove("d-none");
    } else {
      referralSection.classList.add("d-none");
    }
    
    // Show product/category section and update options
    if (offerType === "product" || offerType === "category") {
      productCategorySection.style.display = 'block';
      fetchOptions(offerType);
    } else {
      productCategorySection.style.display = 'none';
      productOrCategorySelect.innerHTML = '<option value="" selected>Select Product or Category</option>';
    }
  });

  // Prevent default form submission and handle offer addition
  document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault();
    addOffer();
  });
});

function addOffer() {
  const offerType = document.getElementById("offerType").value;
  const productOrCategory = document.getElementById("productOrCategory").value;
  const discountType = document.getElementById("discountType").value;
  const discountValue = document.getElementById("discountValue").value;
  const maxDiscountAmount = document.getElementById("maxDiscountAmount").value || null;
  const minCartValue = document.getElementById("minCartValue").value || null;
  const validFrom = document.getElementById("validFrom").value;
  const validUntil = document.getElementById("validUntil").value;
  const referrerBonus = offerType === 'referral' ? document.getElementById("referrerBonus").value || null : null;
  const refereeBonus = offerType === 'referral' ? document.getElementById("refereeBonus").value || null : null;

  const offerData = {
    type: offerType,
    product: offerType === 'product' ? productOrCategory : undefined,
    category: offerType === 'category' ? productOrCategory : undefined,
    discountType,
    discountValue,
    maxDiscountAmount,
    minCartValue,
    validFrom,
    validUntil,
    referralBonus: offerType === 'referral' ? { referrer: referrerBonus, referee: refereeBonus } : undefined
  };

  fetch('/admin/offer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(offerData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Offer added successfully!");
      const modal = bootstrap.Modal.getInstance(document.getElementById('addOfferModal'));
      modal.hide();
      // Optionally, refresh the offers list or clear the form
      // fetchOffers();
      // or
      // document.querySelector("form").reset();
    } else {
      alert("Error: " + data.message);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("An error occurred while adding the offer.");
  });
}
