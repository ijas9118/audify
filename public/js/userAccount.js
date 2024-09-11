document.getElementById('userForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const userId = this.dataset.id;
  const formData = new FormData(this);
  
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  try {
    const response = await fetch(`/account/${userId}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: result.message || 'Your account has been updated!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = '/account';
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: result.message || 'Something went wrong!',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'There was an error updating your account. Please try again later.',
    });
  }
});
