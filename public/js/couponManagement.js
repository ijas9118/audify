document.querySelector("#addCouponform").addEventListener("submit", function (event) {
  event.preventDefault();
  addCoupon();
});

document.querySelectorAll(".edit-coupon-form").forEach(form => {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const couponId = this.getAttribute("data-coupon-id");
    updateCoupon(couponId);
  });
});

async function addCoupon() {
  let Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const couponCode = document.getElementById("couponCode").value;
  const discountType = document.getElementById("discountType").value;
  const discountValue = document.getElementById("discountValue").value;
  const maxDiscountValue = document.getElementById("maxDiscountValue").value;
  const minCartValue = document.getElementById("minCartValue").value;
  const validFrom = document.getElementById("validFrom").value;
  const validUntil = document.getElementById("validUntil").value;
  const usageLimit = document.getElementById("usageLimit").value;
  const isActive = document.getElementById("isActive").value === "true";

  if (
    !couponCode ||
    !discountType ||
    !discountValue ||
    !validFrom ||
    !validUntil
  ) {
    await Toast.fire({
      icon: "warning",
      title: "Please fill in all required fields",
    });
    return;
  }

  const couponData = {
    code: couponCode,
    discountType,
    discountValue: parseFloat(discountValue),
    maxDiscountValue: maxDiscountValue ? parseFloat(maxDiscountValue) : undefined,
    minCartValue: minCartValue ? parseFloat(minCartValue) : 0,
    validFrom, // New field for start date
    validUntil, // Updated field for expiration date
    usageLimit: parseInt(usageLimit, 10),
    isActive,
};

  try {
    const response = await fetch("/admin/coupon/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(couponData),
    });

    const result = await response.json();

    if (response.ok) {
      Toast.fire({
        icon: "success",
        title: "Coupon added successfully!",
      });
      const addCouponModal = new bootstrap.Modal(
        document.getElementById("addCouponModal")
      );
      addCouponModal.hide();
    } else {
      Toast.fire({
        icon: "error",
        title: `Error adding coupon: ${result.message || "Unknown error"}`,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Toast.fire({
      icon: "error",
      title: "An error occurred while adding the coupon.",
    });
  }
}

async function updateCoupon(couponId) {
  let Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const couponCode = document.getElementById(`couponCode${couponId}`).value;
  const discountType = document.getElementById(`discountType${couponId}`).value;
  const discountValue = document.getElementById(`discountValue${couponId}`).value;
  const maxDiscountValue =
    document.getElementById(`maxDiscountValue${couponId}`).value || null;
  const minCartValue = document.getElementById(`minCartValue${couponId}`).value || null;
  const expirationDate = document.getElementById(`expirationDate${couponId}`).value;
  const usageLimit = document.getElementById(`usageLimit${couponId}`).value || null;
  const isActive = document.getElementById(`isActive${couponId}`).checked; // Corrected to boolean

  if (
    !couponCode ||
    !discountType ||
    !discountValue ||
    !expirationDate
  ) {
    await Toast.fire({
      icon: "warning",
      title: "Please fill in all required fields",
    });
    return;
  }

  const couponData = {
    code: couponCode,
    discountType,
    discountValue: parseFloat(discountValue),
    maxDiscountValue: maxDiscountValue ? parseFloat(maxDiscountValue) : undefined,
    minCartValue: minCartValue ? parseFloat(minCartValue) : 0,
    expirationDate,
    usageLimit: parseInt(usageLimit, 10),
    isActive,
  };

  try {
    const response = await fetch(`/admin/coupon/update/${couponId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(couponData),
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById(`couponCodeDisplay${couponId}`).textContent = couponCode;
      document.getElementById(`discountTypeDisplay${couponId}`).textContent =
        discountType === 'percentage' ? `${couponData.discountValue}%` : `₹${couponData.discountValue}`;
      document.getElementById(`maxDiscountValueDisplay${couponId}`).textContent =
        couponData.maxDiscountValue ? `₹${couponData.maxDiscountValue}` : '-';
      document.getElementById(`minCartValueDisplay${couponId}`).textContent =
        couponData.minCartValue ? `₹${couponData.minCartValue}` : '-';
      document.getElementById(`usageLimitDisplay${couponId}`).textContent =
        couponData.usageLimit || 'Unlimited';
      document.getElementById(`validFromDisplay${couponId}`).textContent = new Date(couponData.expirationDate).toLocaleDateString();
      document.getElementById(`validUntilDisplay${couponId}`).textContent = new Date(couponData.expirationDate).toLocaleDateString();
      document.getElementById(`isActiveDisplay${couponId}`).innerHTML =
        `<span class="badge w-100 py-2 ${couponData.isActive ? 'bg-success' : 'bg-danger'}">${couponData.isActive ? 'Active' : 'Inactive'}</span>`;

      Toast.fire({
        icon: "success",
        title: "Coupon updated successfully!",
      });
      const modal = bootstrap.Modal.getInstance(
        document.getElementById(`editCouponModal${couponId}`)
      );
      modal.hide();
    } else {
      Toast.fire({
        icon: "error",
        title: `Error updating coupon: ${result.message || "Unknown error"}`,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Toast.fire({
      icon: "error",
      title: `An error occurred while updating the coupon. ${error}`,
    });
  }
}

async function deleteCoupon(couponId) {
  let Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const confirmDelete = await Swal.fire({
    title: 'Are you sure?',
    text: "This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (!confirmDelete.isConfirmed) {
    return; // Exit if the user cancels the deletion
  }

  try {
    const response = await fetch(`/admin/coupon/delete/${couponId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok) {
      // Remove the coupon's row from the table
      const row = document.querySelector(`tr[data-coupon-id="${couponId}"]`);
      if (row) row.remove();

      Toast.fire({
        icon: "success",
        title: "Coupon deleted successfully!",
      });
    } else {
      Toast.fire({
        icon: "error",
        title: `Error deleting coupon: ${result.message || "Unknown error"}`,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Toast.fire({
      icon: "error",
      title: "An error occurred while deleting the coupon.",
    });
  }
}
