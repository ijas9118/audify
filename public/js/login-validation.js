document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearErrors();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    let isValid = true;

    if (!validateEmail(email)) {
      setError("emailError", "Please enter a valid email address.");
      isValid = false;
    } else if (password.length < 6) {
      setError("passwordError", "Password must be at least 6 characters long.");
      isValid = false;
    }

    if (isValid) {
      try {
        const response = await fetch('/login', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          window.location.href = result.redirectUrl || '/';
        } else {
          showAlert("error", "Login Failed", result.message || "An error occurred. Please try again.");
        }
      } catch (error) {
        showAlert("error", "Error", "An error occurred. Please try again.");
      }
    }
  });

  function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  function showAlert(icon, title, text) {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
    });
  }

  function setError(id, message) {
    document.getElementById(id).textContent = message;
    document.getElementById(id).style.display = "block";
  }

  function clearErrors() {
    document.getElementById("emailError").textContent = "";
    document.getElementById("emailError").style.display = "none";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("passwordError").style.display = "none";
  }
});
