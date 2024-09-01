document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const croppedImage = document.getElementById("croppedImage");
  const cropButton = document.getElementById("cropButton");

  let cropper;

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        croppedImage.src = e.target.result;

        // Destroy any existing cropper instance to avoid multiple instances
        if (cropper) {
          cropper.destroy();
        }

        // Initialize cropper
        cropper = new Cropper(croppedImage, {
          aspectRatio: 1,
          viewMode: 1,
        });

        cropButton.style.display = "inline-block";
      };

      reader.readAsDataURL(file);
    }
  });

  cropButton.addEventListener("click", () => {
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      croppedImage.src = croppedCanvas.toDataURL();
      cropper.destroy(); // Destroy cropper instance after cropping
      cropButton.style.display = "none"; // Hide crop button after cropping
    }
  });
});
